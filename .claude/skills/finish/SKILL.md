---
name: finish
description: Finish the current feature branch — merge it up into v2, push v2, then delete the feature branch and remove its worktree. Use when the user says "/finish", "finish this", "wrap up", or is done with a v2-feature/chore/infra branch and wants it merged into v2.
---

# /finish — merge a feature branch up into `v2`

Wraps up work done on a `v2-<type>/<name>` branch (created per the CLAUDE.md
worktree workflow): merge it into `v2`, push `v2`, then delete the branch and
remove its worktree.

> **Committing is authorized by invoking `/finish`.** The user has standing
> approval: whenever they run `/finish`, commit any pending changes, merge up into
> `v2`, and push — without stopping to ask for commit permission. Still show what
> changed and use a descriptive message; never add a `Co-authored-by` trailer.

## Pick a mode

Run `git branch --show-current` and branch on the result:

- **On a feature branch** (`v2-(feature|chore|infra)/...`) → the full merge-up
  flow: everything under **"Feature-branch mode"** below.
- **On `v2` itself** → the lightweight **"Direct-on-`v2` mode"** below: commit any
  pending changes (with permission) and push. There's no branch to merge or
  worktree to remove.
- **Anything else** (`master`, a detached HEAD, an unrelated branch) → STOP and
  tell the user `/finish` only runs from a `v2-*` feature branch or from `v2`.

---

## Direct-on-`v2` mode

Use this when work was committed (or is still pending) directly on `v2` rather
than in a feature worktree. (No dev server to stop here — the `v2` worktree isn't
being removed; if you want to stop a server you started, `mise run dev-stop`.)

1. **Locate the `v2` worktree.** You're likely already in it; set
   `V2_WT="$(git rev-parse --show-toplevel)"`.
2. **Handle pending changes.** Run `git -C "$V2_WT" status --porcelain`.
   - If there are uncommitted changes, show the user what changed
     (`git -C "$V2_WT" status` + a quick `git -C "$V2_WT" diff --stat`), then stage
     and commit them with a message that describes the change (committing is
     pre-authorized by the `/finish` invocation — see the note at the top):
     ```
     git -C "$V2_WT" add -A
     git -C "$V2_WT" commit -m "<concise description of the change>"
     ```
     Do not add any `Co-authored-by` trailer (per the user's global rule).
   - If the tree is already clean but `v2` is ahead of `origin/v2`
     (`git -C "$V2_WT" status -sb` shows `ahead`), skip straight to the push.
   - If it's clean and not ahead, there's nothing to do — report and stop.
3. **Push `v2`:**
   ```
   git -C "$V2_WT" push origin v2
   ```
   (Skip/report, don't hard-fail, if there's no `origin` or no network.)
4. **Finish up.** Report what was committed (if anything) and that `v2` was
   pushed, then notify:
   `terminal-notifier -title "Claude Code" -message "/finish: committed + pushed v2"`

---

## Feature-branch mode

## Step 0 — stop this worktree's dev server first

**Removing the worktree doesn't stop its dev server.** `mise run dev` is a running
process (Eleventy + SCSS watch + format-on-save); deleting the worktree directory
in step 4 leaves it orphaned and still **holding its port**, so the next `/start`
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

## Preconditions — check before doing anything

1. **Current branch is a feature branch.** Confirm `git branch --show-current`
   matches `v2-(feature|chore|infra)/...` (the mode check above already routed you
   here).
2. **Working tree.** Run `git status --porcelain`. If there are uncommitted
   changes, show what changed (`git status` + `git diff --stat`), then stage and
   commit them on the feature branch with a descriptive message before proceeding
   (committing is pre-authorized by the `/finish` invocation — see the note at the
   top; no `Co-authored-by` trailer):
   ```
   git add -A
   git commit -m "<concise description of the change>"
   ```
3. **Capture identifiers up front:**
   - `FEATURE` = the current branch name.
   - `FEATURE_WT` = this worktree's path (`git rev-parse --show-toplevel`).
   - `V2_WT` = the worktree path that has `v2` checked out. Find it with
     `git worktree list` (the line whose branch is `[v2]`).

## Steps

You cannot merge into `v2` or remove this worktree while standing inside it, so
drive the merge from the `v2` worktree using `git -C "$V2_WT" ...`.

1. **Make sure `v2` is ready:**
   - `git -C "$V2_WT" status --porcelain` must be clean. If not, STOP and report
     — the user needs to deal with the `v2` worktree's dirty state.
   - `git -C "$V2_WT" pull --ff-only origin v2` to get the latest (skip/report if
     there is no `origin` or no network, don't hard-fail).
2. **Merge the feature branch into `v2`:**
   ```
   git -C "$V2_WT" merge --no-ff "$FEATURE" -m "Merge $FEATURE into v2"
   ```
   If the merge conflicts, STOP: leave it in place and tell the user which files
   conflict so they can resolve in the `v2` worktree. Do not force or abort without
   asking.
3. **Push `v2`:**
   ```
   git -C "$V2_WT" push origin v2
   ```
4. **Remove the feature worktree** (run from `$V2_WT`, not from inside it):
   ```
   git -C "$V2_WT" worktree remove "$FEATURE_WT"
   ```
   If it refuses due to leftover state, report it rather than using `--force`
   without asking.
5. **Delete the feature branch:**
   ```
   git -C "$V2_WT" branch -d "$FEATURE"
   ```
   Use `-d` (safe delete). If git complains it's not fully merged, that means the
   merge didn't land — investigate, don't `-D`.
6. **Delete the remote feature branch** if one was pushed:
   `git -C "$V2_WT" push origin --delete "$FEATURE"` (skip silently if it never
   existed on the remote).

## Finish up

Report a short summary: what was merged, that `v2` was pushed, and that the branch
+ worktree were removed. Since the current worktree no longer exists, remind the
user to `cd "$V2_WT"` (or open a fresh worktree) to continue.

Then notify:
`terminal-notifier -title "Claude Code" -message "/finish: <FEATURE> merged into v2 and cleaned up"`
