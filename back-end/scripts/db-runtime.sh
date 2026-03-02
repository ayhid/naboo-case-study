#!/usr/bin/env sh
set -eu

if [ "$#" -lt 1 ]; then
  echo "Usage: sh ./scripts/db-runtime.sh <compose-command> [args...]"
  exit 1
fi

compose_command="$1"
shift

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
project_dir="$(CDPATH= cd -- "$script_dir/.." && pwd)"
compose_file="$project_dir/docker-compose.yml"

if command -v docker-compose >/dev/null 2>&1; then
  docker-compose -f "$compose_file" "$compose_command" "$@"
else
  docker compose -f "$compose_file" "$compose_command" "$@"
fi
