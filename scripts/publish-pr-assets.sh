#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Uso: scripts/publish-pr-assets.sh <carpeta> <archivo>..." >&2
  exit 1
fi

folder="$1"
shift
assets_branch="pr-assets"
repo_root="$(git rev-parse --show-toplevel)"
slug="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
worktree="$(mktemp -d)"
trap 'git -C "$repo_root" worktree remove --force "$worktree" >/dev/null 2>&1 || true' EXIT

if git -C "$repo_root" ls-remote --exit-code --heads origin "$assets_branch" >/dev/null; then
  git -C "$repo_root" fetch -q origin "$assets_branch"
  git -C "$repo_root" worktree add -q --detach "$worktree" FETCH_HEAD
else
  git -C "$repo_root" worktree add -q --detach "$worktree"
  git -C "$worktree" checkout -q --orphan "$assets_branch-new"
  git -C "$worktree" rm -rfq .
fi

mkdir -p "$worktree/$folder"
for file in "$@"; do
  cp "$file" "$worktree/$folder/"
done

git -C "$worktree" add "$folder"
git -C "$worktree" -c core.hooksPath=/dev/null commit -q -m "chore: add PR assets for $folder"
git -C "$worktree" push -q origin "HEAD:refs/heads/$assets_branch"
git -C "$repo_root" branch -q -D "$assets_branch-new" >/dev/null 2>&1 || true

for file in "$@"; do
  name="$(basename "$file")"
  echo "![${name%.*}](https://raw.githubusercontent.com/$slug/$assets_branch/$folder/$name)"
done
