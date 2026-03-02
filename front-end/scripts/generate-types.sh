#!/usr/bin/env sh
set -eu

cp ../back-end/schema.gql ./src/graphql/schema.gql
graphql-codegen
