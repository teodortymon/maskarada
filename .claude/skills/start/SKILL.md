---
name: start
description: Start a new piece of work — create a branch + worktree off master (name inferred from the request), copy gitignored env files in, then work there and verify with a non-conflicting `mise run dev`. Use when the user says "/start", "start this", "begin a new feature/fix", or otherwise kicks off a fresh change. `/finish` wraps it up as a GitHub PR merged into master.
---

# /start — spin up a feature worktree off `master`

The mirror image of `/finish`. Given a description of the work (the rest of the
prompt after `/start`, or the surrounding request), create a `<type>/<name>`
branch in its own worktree off `master`, wire up its env files, and start working
there — verifying changes in a live dev server that won't collide with any server
already running.

> **Why master, not v2.** `master` is now the production branch: it deploys to
> GitHub Pages on every push (`.github/workflows/deploy-github-pages.yml`), so we
> never commit straight to it — every change lands via a **GitHub PR into
> master** (opened + merged by `/finish`). Because the PR targets the repo's
> **default branch**, GitHub auto-closes any `Closes #N` issue on merge (the old
> v2 PRs targeted a non-default branch and never auto-closed — `/finish` had to
> close issues by hand).

## 1. Infer the branch name

From the user's request, pick:

- **`<type>`** — one of the three allowed types (this is what keeps `/finish`
  working; it only recognises these):
  - `feature` — new user-facing functionality (default for "add …", "build …").
  - `chore` — maintenance, deps, content, refactors, **and bug fixes** (there is
    no `fix` type; a fix maps to `chore` unless it's really new behaviour).
  - `infra` — build / CI / tooling / config.
- **`<name>`** — a short kebab-case slug of the change (e.g.
  `newsletter-signup`, `gallery-lightbox-caption`). Keep it 2–4 words.

So the branch is `<type>/<name>` (e.g. `feature/newsletter-signup`) and the
worktree dir is `.claude/worktrees/<name>`. **No `v2-` prefix** — that was the old
convention; master-based branches drop it (matches `chore/remove-test-banner`).

If the request is too vague to name confidently, ask the user for a one-line
description before creating anything — don't invent a slug you'll have to rename.

## 2. Preconditions — check before creating anything

1. **Capture the `master` worktree path** `MAIN_WT` — the worktree with `master`
   checked out. Find it in `git worktree list` (the line whose branch is
   `[master]`). Run all git commands with `git -C "$MAIN_WT" ...` so it works no
   matter where you're standing.
2. **No name collision.** `git -C "$MAIN_WT" worktree list` must not already
   contain `.claude/worktrees/<name>`, and `git -C "$MAIN_WT" branch --list
   <type>/<name>` must be empty. If either exists, pick a more specific `<name>`
   or ask the user.
3. **`master` is current.** `git -C "$MAIN_WT" pull --ff-only origin master` to
   branch off the latest (skip/report, don't hard-fail, if there's no `origin` or
   no network). Starting from stale master is what causes avoidable PR conflicts.

## 3. Create the worktree

```
git -C "$MAIN_WT" worktree add "$MAIN_WT/.claude/worktrees/<name>" -b <type>/<name> master
```

Let `WT="$MAIN_WT/.claude/worktrees/<name>"` be the new worktree path.

## 4. Copy gitignored env files in

Worktrees do **not** inherit gitignored files, and the app/deploy needs them
(`mise.toml` loads `.env`; wrangler reads `CLOUDFLARE_*`/`BILETOMAT_*` from it).
For each of `.env` and `.env.local`, copy it from `$MAIN_WT` into `$WT` **only if
the source exists and the destination doesn't**:

```fish
for f in .env .env.local
  if test -e "$MAIN_WT/$f"; and not test -e "$WT/$f"
    cp "$MAIN_WT/$f" "$WT/$f"
  end
end
```

Report which env files were copied (or that there were none).

## 5. Work in the new worktree

From here on, do the actual change **inside `$WT`** — read, edit, and commit
there. Everything below runs with the worktree as the working directory (use
absolute paths under `$WT`, or `git -C "$WT" ...`).

Two recurring traps to avoid while you work:

- **Never delete gallery/poster images.** `t/lay/img/*.jpg` and the
  `w/kostiumy/**` gallery JPEGs have repeatedly been removed by accident in
  worktrees. If a build or tool wants to rewrite them, keep them; if `git status`
  ever shows an image **deleted** that your change didn't intend, restore it
  (`git -C "$WT" checkout -- <path>`) — never commit the deletion.
- **SCSS edits need a template rebuild to reach the served site.** A bare `scss/`
  edit doesn't get copied into `_site/css` until Eleventy rebuilds a template, so
  the dev server can look stale — touch any template (or save a `.liquid`/`.md`)
  to force the passthrough.

## 6. Verify with a non-conflicting `mise run dev`

Before starting the server, avoid clobbering a dev server the user (or another
worktree) already has running:

1. **Check what's already up.** Eleventy's default dev port is **8080**; SCSS
   watch and the dev server run in parallel. See what's listening:
   ```fish
   lsof -nP -iTCP -sTCP:LISTEN | grep -E ':80[0-9][0-9]' ; or true
   ```
2. **Start dev in the background** from inside `$WT` (run via the Bash tool's
   `run_in_background`, not a raw `&`):
   ```
   mise run dev
   ```
   The Eleventy dev server auto-increments the port when 8080 is taken, so a
   second instance is safe — it just binds 8081, 8082, … **Do not** hardcode
   8080; read the server's own startup output to learn the real URL/port
   (it logs `Server at http://localhost:<port>/`).
   - If pinning is easier, `mise run dev-pinned` (default :8790; `PORT=8791 mise
     run dev-pinned` to override) avoids the 808x race when several worktrees
     serve at once.
3. **Verify the change in the browser.** Open the actual logged URL with the
   claude-in-chrome tools (per the global Browser guidance), screenshot / read
   the page, and confirm the change looks right. Watch the dev server output and
   the browser console for build or runtime errors.
   - **If the change adds a new external origin** (a third-party script, iframe,
     font, image host, analytics beacon, …), `mise run dev` will **not** catch a
     CSP problem — dev doesn't apply `_headers`. Add the origin(s) to the
     `Content-Security-Policy` in `_headers`, then verify with **`mise run
     preview`** (Cloudflare Pages emulation on :8788, which *does* apply
     `_headers`) and confirm the browser console shows **no CSP violation**.
     (Production on GitHub Pages ignores `_headers` entirely, but the Cloudflare
     `preview`/beta paths need it, so keep the CSP correct.)
4. **Leave the server running** while you iterate; live reload will pick up edits.
   **Keep it running when you hand back to the user** — they'll usually want to
   test the change in the browser themselves, so don't stop the server just
   because your own verification is done. Only stop it if the user asks, or right
   before running `/finish`. Tell them the URL/port it's on so they can open it.
   If the worktree's `mise.toml` isn't trusted yet (`mise` errors with "Config
   files … are not trusted"), run `mise trust` in `$WT` once, then start dev.
   - **When you do stop it, stop only THIS worktree's server:** run `mise run
     dev-stop` from inside `$WT` (or `TaskStop` on the background task id you
     started it with). **Never** use a broad `pkill -f eleventy`/`sass`/`mise run
     dev` — that kills every worktree's dev server, not just this one. `/finish`
     Step 0 does exactly this before removing the worktree.

## Finish up

Tell the user: the branch + worktree that were created, which env files were
copied, and the dev URL/port the server came up on — and that the server is
**still running** for them to test. Remind them the change lives in `$WT` and
that `/finish` will push `<type>/<name>` and open + merge a **GitHub PR into
master** when they're done.

Then notify:
`terminal-notifier -title "Claude Code" -message "/start: <type>/<name> worktree ready, dev on :<port>"`
