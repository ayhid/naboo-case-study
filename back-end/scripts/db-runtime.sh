#!/usr/bin/env sh
set -eu

if [ "$#" -lt 1 ]; then
  echo "Usage: sh ./scripts/db-runtime.sh <compose-command> [args...]"
  exit 1
fi

compose_command="$1"
shift

if command -v docker-compose >/dev/null 2>&1; then
  docker-compose "$compose_command" "$@"
else
  docker compose "$compose_command" "$@"
fi
