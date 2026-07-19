---
name: backlog
description: Work the GitHub issue backlog — fetch every open issue and, per issue, spin up a worktree, make the change, and open a draft PR into v2. Interactive by default (opens IntelliJ + a dev server per issue); pass --cron for unattended/headless runs (no IDE, no dev servers). Use when the user says "/backlog", "work the backlog", "grind the issues", or schedules issue-clearing on cron.
---

# /backlog — auto-work open GitHub issues into draft PRs

Fetches **all open GitHub issues** on `origin` and, for each one not already in
flight, creates a `v2-<type>/<slug>-<N>` worktree off `v2` (the `/start`
convention), makes the change, and opens a **draft PR into `v2`**. Never
auto-merges — the human reviews the resulting PR queue and runs `/finish` on the
ones they accept.

It runs in one of two modes, and the difference is the whole point of the skill:

- **Interactive** (default — the user typed `/backlog`): a human is watching, so
  open an IntelliJ window and a dev server per issue for live inspection.
- **Cron** (`/backlog --cron`): unattended, so **no IntelliJ and no dev
  servers** — just build-check, push, open the draft PR, and clean the worktree
  up.

Repo is `teodortymon/maskarada`; the active branch is `v2` and PRs target `v2`.

## 1. Determine mode and issue filter

Read the arguments after `/backlog` (prose-style, like `/start`):

- **Cron mode** if the arguments contain `--cron` / `cron`, **or** the env var
  `BACKLOG_CRON` is set (`test -n "$BACKLOG_CRON"` — the `backlog-cron` mise task
  sets it). Otherwise **interactive mode**.
- **Issue filter:** any bare issue numbers (e.g. `/backlog 41` or
  `/backlog 41,44`) restrict the run to just those issues. Works in either mode
  and is the easy way to test. No numbers → all open issues.

State the mode you resolved before doing anything.

## 2. Locate the `v2` worktree

Capture `V2_WT` — the worktree with `v2` checked out — from `git worktree list`
(the line whose branch is `[v2]`). Run all top-level git via `git -C "$V2_WT" ...`
so it works regardless of where you're standing. Get `v2` current-ish:

```
git -C "$V2_WT" pull --ff-only origin v2
```

Skip/report (don't hard-fail) if there's no `origin` or no network.

## 3. Fetch the open issues

```
gh issue list --state open --json number,title,body,url --limit 100
```

Apply the numeric filter from step 1 if one was given. If there are no open
issues, report that and stop.

## 4. Dedup — skip issues already in flight

This is what makes repeated (cron) runs idempotent. For each issue **#N**, skip it
if any of these already exist:

- A branch whose name ends in `-N` (local or remote):
  ```
  git -C "$V2_WT" branch --list "*-$N"
  git ls-remote --heads origin "*-$N"
  ```
- An open PR that targets it:
  ```
  gh pr list --base v2 --state open --json number,headRefName,body
  ```
  → its `headRefName` ends in `-N`, or its body contains `#N`.

Record skipped issues as `skipped-in-flight` for the final report; don't touch
them.

## 5. Per remaining issue — create the worktree (the `/start` mechanics)

For each issue #N still standing:

1. **Infer the branch name** `v2-<type>/<slug>-<N>`:
   - `<type>`: `feature` for genuinely new user-facing functionality; otherwise
     `chore` (bug fixes, content, refactors — there is no `fix` type); `infra` for
     build/CI/tooling. When in doubt, `chore`.
   - `<slug>`: a 2–4 word kebab summary of the issue.
   - **The `-<N>` suffix is mandatory** — it carries the issue number for dedup
     and traceability, and the prefix still matches `/finish`'s
     `v2-(feature|chore|infra)/...` recognizer.
   - Worktree dir: `$V2_WT/.claude/worktrees/<slug>-<N>`.
2. **Create it off `v2`:**
   ```
   git -C "$V2_WT" worktree add "$V2_WT/.claude/worktrees/<slug>-<N>" -b v2-<type>/<slug>-<N> v2
   ```
   Let `WT` be that path. If `mise` later reports the worktree config isn't
   trusted, run `mise trust` in `$WT` once.
3. **Copy gitignored env files in** (worktrees don't inherit them; the app/deploy
   need them). For each of `.env` and `.env.local`, copy from `$V2_WT` only if the
   source exists and the destination doesn't:
   ```fish
   for f in .env .env.local
     if test -e "$V2_WT/$f"; and not test -e "$WT/$f"
       cp "$V2_WT/$f" "$WT/$f"
     end
   end
   ```

## 6. Do the work — one subagent per issue

Spawn **one subagent per issue** (Agent tool, `general-purpose`), each pointed at
its own `$WT`. **Do not** use the `isolation: 'worktree'` flag — each issue
already has its own distinct worktree directory, so parallel subagents don't
collide, and the isolation flag would create a second, throwaway worktree.

**Concurrency:** in **interactive** mode cap at ~3 in flight at once (each opens an
IntelliJ window + a dev server — heavy); if there are more issues, warn and let
them drain in waves. In **cron** mode use the default cap.

Give each subagent: the issue number, title, and body; `$WT`; the branch name; the
base branch `v2`; and the mode. Its contract:

- Make the change **inside `$WT`**, keeping the diff minimal and on-topic to the
  issue. For vague/open-ended issues, make a reasonable best-effort change — the
  draft PR is where the human redirects it.
- **If you get stuck, leave the best code you have — never revert** (global rule).
- Run `mise run build` from `$WT` as a headless sanity check. If it breaks, note
  the failure but **still open the PR as a draft**.
- Commit on the feature branch with a descriptive message. **No `Co-authored-by`
  trailer** (global rule).
- Push and open the draft PR:
  ```
  git -C "$WT" push -u origin v2-<type>/<slug>-<N>
  gh pr create --draft --base v2 --head v2-<type>/<slug>-<N> \
    --title "<issue title>" \
    --body "Refs #<N>

  <one-line summary of what changed; note any build failure or open question>"
  ```
  Use `Refs #N`, **not** `Closes #N` — GitHub only auto-closes issues from PRs
  merged into the **default** branch (`master`), and these target `v2`, so
  `Closes` wouldn't fire anyway. `/finish` closes the issue when the accepted PR's
  branch is merged into `v2` (it derives `N` from the `-<N>` branch suffix).
- Return: issue #, branch, PR URL, and status
  (`opened` / `build-failed-draft` / `errored`).

## 7. Mode-specific side effects

**Interactive mode**, for each issue's `$WT`:

- **Open IntelliJ** on the worktree: `idea "$WT"` (opens a new project window
  without disturbing the `v2` window). If `idea` isn't on `PATH`, fall back to
  `"$HOME/Library/Application Support/JetBrains/Toolbox/scripts/idea" "$WT"`; if
  that's missing too, just tell the user to open `$WT` manually — don't block.
- **Start a dev server** from `$WT` via the Bash tool's `run_in_background` (not a
  raw `&`): `mise run dev`. Eleventy auto-increments from 8080 when the port is
  taken, so parallel servers are safe — **read each server's own startup log** to
  learn its real `http://localhost:<port>/` and report it. Leave the servers
  running for the user to test.

**Cron mode**, for each issue after its PR is opened:

- **Never** open IntelliJ and **never** start a dev server.
- **Remove the local worktree** so runs don't pile up (branch + PR live on the
  remote; dedup keys off those, not the local worktree):
  ```
  git -C "$V2_WT" worktree remove "$WT"
  ```

## 8. Report and notify

Print a summary table: issue → branch → PR URL → status (`opened` /
`build-failed-draft` / `skipped-in-flight` / `errored`). In **interactive** mode,
also list each dev-server URL and remind the user the servers + IntelliJ windows
are still up for testing, and that `/finish` (run from a worktree) merges an
accepted branch into `v2`.

Notify (**interactive only** — cron runs unattended):
```
terminal-notifier -title "Claude Code" -message "/backlog: <N> draft PRs opened, <M> skipped"
```

## Running on a schedule (cron)

The reusable entry point is the **`backlog-cron` mise task**
(`mise-tasks/backlog-cron`): it sets `BACKLOG_CRON=1` and runs
`claude -p "/backlog --cron" --permission-mode acceptEdits`. Point any scheduler
at it — pick one:

- **system cron / launchd:** a job that runs `mise run backlog-cron` in the repo.
- **`/schedule`:** a cloud routine running `/backlog --cron`.
- **`/loop`:** `/loop <interval> /backlog --cron`.

`.claude/settings.json` allowlists the `gh`/`git`/`mise` commands this skill uses
so the `acceptEdits` cron run doesn't stall on permission prompts.

## Caveats

- **No visual verification in cron.** `mise run build` catches template/SCSS
  breakage, not visual regressions — that's exactly why the output is a **draft**
  PR for human review.
- **Issues don't auto-close on merge** (PRs target `v2`, not the default
  `master`); `/finish` closes the issue when you merge the accepted PR's branch.
- **Cost scales with issue count** — each issue is a full subagent. Use the
  numeric filter (`/backlog 41,44`) to bound a run.
