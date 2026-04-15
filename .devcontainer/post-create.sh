#!/usr/bin/env bash
set -euo pipefail

echo "🚀 CreateSuite dev container setup..."

# --- PostgreSQL ---
PG_VERSION=$(ls /etc/postgresql/ | head -n1)
echo "🐘 Starting PostgreSQL (v${PG_VERSION})..."
pg_ctlcluster "$PG_VERSION" main start || service postgresql start || true
sleep 2

# Ensure databases exist
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname = 'backend_repo'\" | grep -q 1 || psql -c \"CREATE DATABASE backend_repo;\""
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname = 'backend_repo_test'\" | grep -q 1 || psql -c \"CREATE DATABASE backend_repo_test;\""

# --- Phoenix ---
if [ ! -d "backend/myapp/deps" ] || [ ! -f "backend/myapp/deps/phoenix/mix.exs" ]; then
  echo "🔨 Running Phoenix DB setup..."
  ./scripts/dev.sh db:setup || true
else
  echo "⏭️  Phoenix deps already present, skipping db:setup"
fi

# --- OpenCode upgrade ---
if command -v opencode &> /dev/null; then
  echo "⬆️  Upgrading OpenCode to latest..."
  opencode upgrade || true
  echo "✅ OpenCode version: $(opencode --version)"
else
  echo "⚠️  OpenCode not found in PATH"
fi

# --- Node dependencies (skip if lockfile hasn't changed) ---
needs_npm_ci() {
  local pkg="$1"
  local lock="$2"
  local modules="$3"
  [ ! -d "$modules" ] || [ "$lock" -nt "$modules/.package-lock.json" ] || [ "$pkg" -nt "$modules/.package-lock.json" ]
}

if needs_npm_ci package.json package-lock.json node_modules; then
  echo "📦 Installing root Node dependencies..."
  npm ci
else
  echo "⏭️  Root node_modules up to date"
fi

if needs_npm_ci agent-ui/package.json agent-ui/package-lock.json agent-ui/node_modules; then
  echo "📦 Installing agent-ui Node dependencies..."
  (cd agent-ui && npm ci)
else
  echo "⏭️  agent-ui node_modules up to date"
fi

# --- Build ---
echo "🔨 Building project..."
npm run build

echo "✅ Dev container ready!"
