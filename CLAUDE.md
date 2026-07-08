# Maskarada — project instructions

Eleventy (11ty) static site (with TinaCMS for content editing) for Teatr
Maskarada. The active redesign lives on the `v2` branch. Styling is Bootstrap 5
compiled from `scss/` into `css/styles.css` via the npm `sass` build; Eleventy
renders the Liquid templates (`_layouts/`, `_includes/`, `_s2/` plays,
`_data/`). The v2 beta deploys to Cloudflare Pages. (Migrated off Jekyll — see
`eleventy.config.js` for the collection, YAML/CSV data, and custom-filter setup.)

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

## Finishing work: `/finish`

The `/finish` local skill wraps up a feature branch: it merges the current
`v2-<type>/<name>` branch up into `v2`, pushes `v2`, then deletes the feature
branch and removes its worktree. Run it from inside the feature worktree once the
work is committed and reviewed.
