# Agent Workflow

These instructions apply to this repository.

## GitHub Sync Rule

Before making website edits or publishing changes, treat the GitHub remote as the current source of truth and sync safely:

1. Run `git fetch origin --prune`.
2. Inspect `git status -sb` and `git rev-list --left-right --count HEAD...origin/main`.
3. If the branch is behind and the worktree is clean, run `git pull --ff-only origin main`.
4. If the branch is behind and the worktree has local changes, stash with `git stash push -u`, run `git pull --ff-only origin main`, then reapply the stash and resolve any conflicts.
5. Never use `git push --force`, `git reset --hard`, or any destructive overwrite to make local match remote or remote match local.
6. Before pushing, fetch again and confirm the push will be a normal fast-forward update.

## Publish Rule

For launch/push requests:

1. Sync from GitHub first using the rule above.
2. Run the relevant checks, at minimum `node --check` for edited JavaScript and `npm test`.
3. Commit the intended local changes with a clear message.
4. Push with normal `git push origin main`.
5. If GitHub rejects the push because the remote moved, fetch, integrate, retest, recommit if needed, and push again.
