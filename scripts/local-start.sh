#!/bin/bash
set -e
cd "$(dirname "$0")/.."
local_node=( "$PWD"/.data/runtime/node-*/bin/node )
if [ ! -x "${local_node[0]}" ]; then
  echo "The project-local Node runtime is missing. See docs/LOCAL-TESTING.md."
  exit 1
fi
exec "${local_node[0]}" scripts/local-start.mjs
