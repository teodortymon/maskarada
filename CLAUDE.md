# Maskarada — project instructions

Jekyll site (with TinaCMS for content editing) for Teatr Maskarada. The active
redesign lives on the `v2` branch.

## Serving & commands go through mise

`mise.toml` is the single source of truth for every build / run / serve command.

- **Always serve and build via mise.** Never run raw `bundle exec jekyll ...`,
  `npx tinacms ...`, or `make <target>` directly — use the mise task instead:
  - `mise run dev` — Jekyll with livereload (no CMS)
  - `mise run dev-tina` — Jekyll behind the TinaCMS editing UI
  - `mise run build` — build the static site into `_site/`
  - Run `mise tasks` to see the full, current list.
- **New commands feed back into mise.** Whenever you discover or start relying on
  a working command that isn't a task yet, ADD it to `mise.toml` (or a file task
  under `mise-tasks/` if it has multiple lines / logic) with a `description`, then
  run it via `mise run <task>`. The task list is our persistent memory — never let
  a useful command live only in shell history or in the legacy `Makefile`.
- The old `Makefile` is legacy. Port any target you still need into a mise task
  rather than invoking `make`.

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
