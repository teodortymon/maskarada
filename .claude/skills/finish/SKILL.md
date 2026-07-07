---
name: finish
description: Finish the current feature branch — merge it up into v2, push v2, then delete the feature branch and remove its worktree. Use when the user says "/finish", "finish this", "wrap up", or is done with a v2-feature/chore/infra branch and wants it merged into v2.
---

# /finish — merge a feature branch up into `v2`

Wraps up work done on a `v2-<type>/<name>` branch (created per the CLAUDE.md
worktree workflow): merge it into `v2`, push `v2`, then delete the branch and
remove its worktree.

## Preconditions — check before doing anything

1. **Current branch is a feature branch.** Run `git branch --show-current`. It
   MUST match `v2-(feature|chore|infra)/...`. If it's `v2`, `master`, or anything
   else, STOP and tell the user `/finish` only runs from a feature branch.
2. **Working tree is clean.** Run `git status --porcelain`. If there are
   uncommitted changes, STOP and ask the user whether to commit them first (do NOT
   commit without permission per the user's global rule). Only proceed once clean.
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
