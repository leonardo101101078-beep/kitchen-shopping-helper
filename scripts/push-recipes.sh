#!/usr/bin/env bash
# Stage recipe markdown changes, commit, and push to origin (current branch).
# Usage:
#   npm run recipes:push
#   npm run recipes:push -- "feat: 新增番茄炒蛋"
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "push-recipes: not a git repository" >&2
  exit 1
fi

git add -- 'src/recipes/'

if git diff --cached --quiet; then
  echo "push-recipes: no changes under src/recipes/ (nothing to commit)."
  exit 0
fi

if [ "$#" -gt 0 ]; then
  COMMIT_MSG="$*"
else
  COMMIT_MSG="chore(recipes): update recipes"
fi
git commit -m "$COMMIT_MSG"

BRANCH="$(git branch --show-current)"
git push -u origin "$BRANCH"
echo "push-recipes: pushed to origin/$BRANCH"
