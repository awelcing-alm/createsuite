#!/usr/bin/env bash
set -euo pipefail

# Ensure PostgreSQL is running when the container resumes from sleep
if command -v pg_ctlcluster &> /dev/null; then
  PG_VERSION=$(ls /etc/postgresql/ | head -n1)
  pg_ctlcluster "$PG_VERSION" main status >/dev/null 2>&1 || pg_ctlcluster "$PG_VERSION" main start
else
  service postgresql start || true
fi
