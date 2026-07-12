---
name: start
description: Start a new piece of work — create a branch + worktree off v2 (name inferred from the request), copy gitignored env files in, then work there and verify with a non-conflicting `mise run dev`. Use when the user says "/start", "start this", "begin a new feature/fix", or otherwise kicks off a fresh change on v2.
---

# /start — spin up a feature worktree off `v2`

The mirror image of `/finish`. Given a description of the work (the rest of the
prompt after `/start`, or the surrounding request), create a `v2-<type>/<name>`
branch in its own worktree per the CLAUDE.md workflow, wire up its env files, and
start working there — verifying changes in a live dev server that won't collide
with any server already running.

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

So the branch is `v2-<type>/<name>` (e.g. `v2-feature/newsletter-signup`) and the
worktree dir is `.claude/worktrees/<name>`.

If the request is too vague to name confidently, ask the user for a one-line
description before creating anything — don't invent a slug you'll have to rename.

## 2. Preconditions — check before creating anything

1. **Capture the `v2` worktree path** `V2_WT` — the worktree with `v2` checked
   out. Find it in `git worktree list` (the line whose branch is `[v2]`). Run all
   git commands with `git -C "$V2_WT" ...` so it works no matter where you're
   standing.
2. **No name collision.** `git -C "$V2_WT" worktree list` must not already contain
   `.claude/worktrees/<name>`, and `git -C "$V2_WT" branch --list v2-<type>/<name>`
   must be empty. If either exists, pick a more specific `<name>` or ask the user.
3. **`v2` is current-ish.** `git -C "$V2_WT" pull --ff-only origin v2` to branch
   off the latest (skip/report, don't hard-fail, if there's no `origin` or no
   network).

## 3. Create the worktree

```
git -C "$V2_WT" worktree add "$V2_WT/.claude/worktrees/<name>" -b v2-<type>/<name> v2
```

Let `WT="$V2_WT/.claude/worktrees/<name>"` be the new worktree path.

## 4. Copy gitignored env files in

Worktrees do **not** inherit gitignored files, and the app/deploy needs them
(`mise.toml` loads `.env`; wrangler reads `CLOUDFLARE_*` from it). For each of
`.env` and `.env.local`, copy it from `$V2_WT` into `$WT` **only if the source
exists and the destination doesn't**:

```fish
for f in .env .env.local
  if test -e "$V2_WT/$f"; and not test -e "$WT/$f"
    cp "$V2_WT/$f" "$WT/$f"
  end
end
```

Report which env files were copied (or that there were none).

## 5. Open the worktree in a new IntelliJ window

Launch IntelliJ IDEA on the new worktree so the user can edit alongside you. The
JetBrains Toolbox `idea` launcher is on `PATH`; pointing it at a directory opens
that directory in a **new** project window (it doesn't disturb the `v2` window):

```
idea "$WT"
```

If `idea` isn't found on `PATH`, fall back to the Toolbox script directly
(`"$HOME/Library/Application Support/JetBrains/Toolbox/scripts/idea" "$WT"`), and
if that's also missing, just tell the user to open `$WT` manually — don't block
the rest of the flow on it.

## 6. Work in the new worktree

From here on, do the actual change **inside `$WT`** — read, edit, and commit
there. Everything below runs with the worktree as the working directory (use
absolute paths under `$WT`, or `git -C "$WT" ...`).

## 7. Verify with a non-conflicting `mise run dev`

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
   - If you need to pin a port instead, pass one through Eleventy, e.g.
     `npx @11ty/eleventy --serve --port=8090` — but prefer `mise run dev` and let
     it auto-pick, adding a mise task only if pinning becomes a recurring need.
3. **Verify the change in the browser.** Open the actual logged URL with the
   claude-in-chrome tools (per the global Browser guidance), screenshot / read
   the page, and confirm the change looks right. Watch the dev server output and
   the browser console for build or runtime errors.
4. **Leave the server running** while you iterate; live reload will pick up edits.
   **Keep it running when you hand back to the user** — they'll usually want to
   test the change in the browser themselves, so don't stop the server just
   because your own verification is done. Only stop it if the user asks, or right
   before running `/finish`. Tell them the URL/port it's on so they can open it.
   If the worktree's `mise.toml` isn't trusted yet (`mise` errors with "Config
   files … are not trusted"), run `mise trust` in `$WT` once, then start dev.

## Finish up

Tell the user: the branch + worktree that were created, which env files were
copied, and the dev URL/port the server came up on — and that the server is
**still running** for them to test. Remind them the change lives in `$WT` and
that `/finish` will merge `v2-<type>/<name>` back into `v2` when they're done.

Then notify:
`terminal-notifier -title "Claude Code" -message "/start: v2-<type>/<name> worktree ready, dev on :<port>"`
