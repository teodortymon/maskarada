# Maskarada — project instructions

Eleventy (11ty) static site (with TinaCMS for content editing) for Teatr
Maskarada. The active redesign lives on the `v2` branch. Styling is Bootstrap 5
compiled from `scss/` into `css/styles.css` via the npm `sass` build; Eleventy
renders the Liquid templates (`_layouts/`, `_includes/`, `_s2/` plays,
`_data/`). The v2 beta deploys to Cloudflare Pages. (Migrated off Jekyll — see
`eleventy.config.js` for the collection, YAML/CSV data, and custom-filter setup.)

## Every wrap-up message ends with URL + CHANGES

Whenever you finish a piece of work and hand back to the user, end that message
with these two labelled lines:

```
URL: http://localhost:<port>/<path>
CHANGES: <one- or two-line summary of what changed>
```

- **URL** — the running dev-server address where the change can be seen (read the
  real port from the server's own startup log; it auto-increments from 8080). If
  several pages changed, link the most relevant one. If no server is running or
  the change has no visible page (pure infra/tooling/docs), write `URL: n/a`.
- **CHANGES** — a terse plain-language summary of what you actually changed
  (files/behaviour), not a restatement of the request.

This applies to every completion hand-off, including after `/finish`.

## Serving & commands go through mise

`mise.toml` is the single source of truth for every build / run / serve command.

- **Always serve and build via mise.** Never run raw `npx @11ty/eleventy ...`,
  `npm run ...`, `npx tinacms ...`, or `make <target>` directly — use the mise
  task instead:
  - `mise run dev` — Eleventy dev server + SCSS watch, live reload (no CMS)
  - `mise run dev-tina` — Eleventy behind the TinaCMS editing UI
  - `mise run build` — compile SCSS + build the static site into `_site/`
  - `mise run cf-pages-deploy` — deploy the built `_site/` to the Cloudflare beta
  - Run `mise tasks` to see the full, current list.
- **New commands feed back into mise.** Whenever you discover or start relying on
  a working command that isn't a task yet, ADD it to `mise.toml` (or a file task
  under `mise-tasks/` if it has multiple lines / logic) with a `description`, then
  run it via `mise run <task>`. The task list is our persistent memory — never let
  a useful command live only in shell history.

## Feature work: branch + worktree per change

Every new piece of work starts on its own branch in its own git worktree — never
commit feature work directly onto `v2`.

1. **Branch name** follows `v2-<type>/<name-of-change>`, where `<type>` is one of:
   - `feature` — new user-facing functionality (`v2-feature/gallery-lightbox`)
   - `chore` — maintenance, deps, content, refactors (`v2-chore/bump-tina`)
   - `infra` — build/CI/tooling/config (`v2-infra/mise-tasks`)
2. **Create it in a new worktree** branched off `v2`:
   ```fish
   git worktree add .claude/worktrees/<name-of-change> -b v2-<type>/<name-of-change> v2
   ```
   Copy the project's gitignored env files (e.g. `.env`, `.env.local`) into the new
   worktree if they exist — worktrees don't inherit them.
3. Do the work there, committing to the feature branch.
4. When done, run **`/finish`** (see below) to merge it up into `v2`.

## Design experiments: clickable prototypes

When asked to experiment with design (redesigns, variants, "show me a few
approaches"), don't just describe options or show static screenshots — build
**clickable prototypes** that can be flipped through live:

- Implement the variants on real pages (or a lab page) and add a small floating
  variant switcher so each option is one tap away: a fixed panel of buttons that
  toggles data attributes on `<html>` (variant CSS keys off them), persists the
  choice in localStorage, and reads URL params for shareable links. Keep the
  switcher JS in a static file under `t/js/` — inline multi-line `<script>` gets
  mangled by markdown on `.md` pages. (Reference implementation: branch
  `v2-feature/play-card-redesign` history, `_includes/variant_switcher.html`.)
- Serve them from the worktree's `mise run dev` server and expose it with
  `ngrok http <port>` so the prototypes can be tested on a phone as well as
  desktop.
- Once a variant is chosen, hard-code the winner and remove the switcher and
  any lab pages before merging.

## Interactive PRs: always expose a mobile test tunnel

Whenever you open (or update) a PR **while I'm working interactively with you**,
always also attempt to expose the running dev server over `ngrok` so I can test
the change on my phone, and give me the public URL in the hand-off:

- Read the real port from the dev server's own startup log (it auto-increments
  from 8080). If no dev server is running yet, start one with `mise run dev`
  first.
- Start the tunnel with `ngrok http <port>` (background it). ngrok free allows
  only one session, so if a tunnel is already up, restart it fresh rather than
  launching a second. Report the `https://…ngrok…` URL alongside the localhost
  URL in the wrap-up.
- This is an interactive-only courtesy: **skip it entirely in cron / unattended
  runs** (e.g. `/backlog --cron`) — no ngrok there.

## Finishing work: `/finish`

The `/finish` local skill wraps up a feature branch: it merges the current
`v2-<type>/<name>` branch up into `v2`, pushes `v2`, then deletes the feature
branch and removes its worktree. Run it from inside the feature worktree once the
work is committed and reviewed.

## Clearing the backlog: `/backlog`

The `/backlog` local skill works the **open GitHub issue backlog** end to end:
it fetches every open issue and, per issue not already in flight, creates a
`v2-<type>/<slug>-<N>` worktree off `v2` (the `/start` mechanics), makes the
change, and opens a **draft PR into `v2`** — you review the PR queue and `/finish`
the ones you accept. It never auto-merges, and it's idempotent (skips issues that
already have a matching branch or open PR).

Two modes:

- **Interactive** (`/backlog`, or `/backlog 41,44` for specific issues) — opens
  an IntelliJ window and a dev server per issue so you can inspect each change
  live.
- **Cron / unattended** (`/backlog --cron`) — headless: no IntelliJ, no dev
  servers; build-check, push, open the draft PR, remove the worktree.

For scheduling, point cron / launchd (or `/schedule`, `/loop`) at the
**`backlog-cron`** mise task, which runs the skill headless. The `gh`/`git`/`mise`
commands it needs are allowlisted in `.claude/settings.json` so unattended runs
don't stall on permission prompts.
