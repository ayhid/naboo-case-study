#!/usr/bin/env sh
set -eu

BACKEND_SCHEMA_PATH="../back-end/schema.gql"
FRONTEND_SCHEMA_PATH="./src/graphql/schema.gql"

# In monorepo/local runs, sync schema from backend when available.
if [ -f "$BACKEND_SCHEMA_PATH" ]; then
  cp "$BACKEND_SCHEMA_PATH" "$FRONTEND_SCHEMA_PATH"
fi

# In Docker/frontend-only contexts, rely on committed frontend schema.
if [ ! -f "$FRONTEND_SCHEMA_PATH" ]; then
  echo "Schema file not found at $FRONTEND_SCHEMA_PATH" >&2
  exit 1
fi

npx graphql-codegen
