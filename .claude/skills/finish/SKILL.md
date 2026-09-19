---
name: finish
description: Finish the current feature branch — push it and open a GitHub PR into master, merge the PR, then delete the branch and remove its worktree. Use when the user says "/finish", "finish this", "wrap up", or is done with a feature/chore/infra branch and wants it shipped to master.
---

# /finish — ship a feature branch to `master` via a GitHub PR

Wraps up work done on a `<type>/<name>` branch (created by `/start` off
`master`): commit anything pending, push the branch, open a **GitHub PR into
master**, merge it, then delete the branch and remove its worktree.

> **We never push straight to `master`.** `master` deploys to GitHub Pages on
> every push, so all changes land through a PR — that's the "automated GitHub MR"
> flow. Because the PR targets the repo's **default branch (master)**, a `Closes
> #N` line in the PR body makes GitHub **auto-close the issue on merge**. (The old
> v2 PRs targeted a non-default branch and never auto-closed, so this skill used
> to `gh issue close` by hand — no longer needed.)

> **Committing + merging is authorized by invoking `/finish`.** The user has
> standing approval: whenever they run `/finish`, commit any pending changes, open
> the PR, and merge it — without stopping to ask for commit/merge permission.
> Still show what changed and use a descriptive message; **never add a
> `Co-authored-by` trailer** (per the user's global rule).

## Pick a mode

Run `git branch --show-current` and branch on the result:

- **On a feature branch** (`(feature|chore|infra)/...`) → the full PR flow:
  everything under **"Feature-branch mode"** below.
- **On `master` with pending changes** → you must not push master directly (it
  deploys to prod). Move the work onto a branch first: infer a `<type>/<name>`
  (as `/start` would), `git switch -c <type>/<name>`, then run Feature-branch
  mode from step 2. Tell the user you did this.
- **On `master` clean** → nothing to finish; report and stop.
- **Anything else** (a detached HEAD, an unrelated branch) → STOP and tell the
  user `/finish` only runs from a `(feature|chore|infra)/*` branch.

---

## Feature-branch mode

## Step 0 — stop this worktree's dev server first

**Removing the worktree doesn't stop its dev server.** `mise run dev` is a running
process (Eleventy + SCSS watch + format-on-save); deleting the worktree directory
later leaves it orphaned and still **holding its port**, so the next `/start`
bumps to 8081, 8082, … and stale servers pile up. Stop it *before* the merge:

```
mise run dev-stop
```

Run it from inside this worktree (`$FEATURE_WT`). `dev-stop` is scoped to this
worktree via its local `.dev-server.pid`, so it stops **only** this worktree's
server and leaves dev servers in other worktrees running. If no server is
running here it's a safe no-op.

- **Never** stop it with `pkill -f eleventy`, `pkill -f sass`, `pkill -f "mise run
  dev"`, or any name-pattern `pkill`/`killall` — those match **every** worktree's
  processes and will kill unrelated dev servers the user has running elsewhere.
- If you started the server in this session, `TaskStop <task-id>` on that
  background task is equally scoped and also fine.

## Step 1 — commit pending changes (with the deletion guard)

1. Confirm the branch: `git branch --show-current` matches
   `(feature|chore|infra)/...` (the mode check above routed you here).
2. Run `git status --porcelain`.
   - **Guard against accidental image deletions.** If the status shows any
     **deleted** `t/lay/img/*.jpg` or `w/kostiumy/**` gallery image that your
     change didn't intend, STOP and restore it (`git checkout -- <path>`) before
     committing — these get wiped by accident repeatedly and must never be
     committed as deletions.
   - If there are (intended) uncommitted changes, show what changed
     (`git status` + `git diff --stat`), then stage and commit them on the feature
     branch with a descriptive message (committing is pre-authorized by the
     `/finish` invocation — see the note at the top; **no `Co-authored-by`**):
     ```
     git add -A
     git commit -m "<concise description of the change>"
     ```
   - If the tree is clean and the branch has commits ahead of `master`, continue.
     If clean and not ahead of `master`, there's nothing to ship — report + stop.
3. **Capture identifiers up front:**
   - `FEATURE` = the current branch name.
   - `FEATURE_WT` = this worktree's path (`git rev-parse --show-toplevel`).
   - `MAIN_WT` = the worktree that has `master` checked out (`git worktree list`,
     the `[master]` line).
   - `N` = the issue number this branch addresses, if any — the trailing `-<N>`
     of the branch name (the `/start` + `/backlog` convention), else ask/skip.

## Step 2 — push the branch

```
git push -u origin "$FEATURE"
```
(Skip/report, don't hard-fail, if there's no `origin` or no network — without a
remote there's no PR to open; stop and tell the user.)

## Step 3 — open the PR into master (or reuse an open one)

Check first: `gh pr list --head "$FEATURE" --state open --json number -q '.[0].number'`.

- If a PR is already open, reuse its number.
- Otherwise create it against `master`. Put `Closes #N` in the body when there's
  an issue so GitHub auto-closes it on merge:
  ```
  gh pr create --base master --head "$FEATURE" \
    --title "<concise change title>" \
    --body "<what & why>

  Closes #N"
  ```
  Omit the `Closes #N` line when there's no issue. (PR-description attribution
  follows the harness rule; do not add a `Co-authored-by` trailer.)

## Step 4 — merge the PR

```
gh pr merge "$FEATURE" --squash --delete-branch
```

- `--squash` keeps master history one-commit-per-change; `--delete-branch`
  removes the **remote** branch after merge.
- If GitHub refuses because required checks are still running, enable auto-merge
  instead and tell the user it will merge when green:
  ```
  gh pr merge "$FEATURE" --squash --delete-branch --auto
  ```
  Then **stop here** (the worktree/branch cleanup below waits until it's actually
  merged — auto-merge will happen later). Do **not** `--admin`-bypass checks
  unless the user explicitly asks.
- Confirm it merged before cleaning up:
  `gh pr view "$FEATURE" --json state -q .state` must print `MERGED`.

## Step 5 — clean up (only after MERGED is confirmed)

Drive this from `$MAIN_WT`, since you can't remove a worktree while standing in
it, and refresh master to include the merge:

```
git -C "$MAIN_WT" pull --ff-only origin master
git -C "$MAIN_WT" worktree remove "$FEATURE_WT"
git -C "$MAIN_WT" branch -D "$FEATURE"
```

- `branch -D` (not `-d`) is correct here: a **squash** merge means the local
  branch tip isn't in master's history, so `-d` would wrongly refuse. `-D` is safe
  because Step 4 already confirmed the PR is `MERGED`.
- If `worktree remove` refuses due to leftover state, report it rather than using
  `--force` without asking.
- The remote branch was deleted by `--delete-branch` in Step 4; if it lingers,
  `git -C "$MAIN_WT" push origin --delete "$FEATURE"` (skip silently if gone).

## Finish up

Report a short summary: the PR number + URL, that it was merged into `master`
(which triggers the GitHub Pages deploy), which issue GitHub auto-closed (if any),
and that the branch + worktree were removed. Since the current worktree no longer
exists, remind the user to `cd "$MAIN_WT"` (or open a fresh worktree) to continue.

Then notify:
`terminal-notifier -title "Claude Code" -message "/finish: <FEATURE> merged into master and cleaned up"`
