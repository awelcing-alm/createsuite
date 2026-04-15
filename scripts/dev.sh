#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$PROJECT_ROOT/.pids/dev.pid"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

START_WROTE_PID_FILE=0

info() {
  printf "%b\n" "${BLUE}[INFO]${NC} $1"
}

ok() {
  printf "%b\n" "${GREEN}[OK]${NC} $1"
}

warn() {
  printf "%b\n" "${YELLOW}[WARN]${NC} $1"
}

error() {
  printf "%b\n" "${RED}[ERROR]${NC} $1" >&2
}

usage() {
  cat <<EOF
Usage: ./scripts/dev.sh <command>

Commands:
  start      Start all services (Phoenix, Express, Frontend)
  stop       Stop all running services
  status     Show status of running services
  restart    Restart all services
  db:setup   Setup Phoenix database (create + migrate)

Options:
  --help     Show this help message
EOF
}

cleanup_on_exit() {
  if [ "$START_WROTE_PID_FILE" -eq 1 ] && [ -f "$PID_FILE" ]; then
    rm -f "$PID_FILE"
  fi
}

ensure_pid_dir() {
  mkdir -p "$PROJECT_ROOT/.pids"
}

port_in_use() {
  local port=$1
  if command -v lsof >/dev/null 2>&1; then
    lsof -i ":$port" -sTCP:LISTEN >/dev/null 2>&1
  else
    ss -tuln | grep -q ":$port "
  fi
}

check_port_free() {
  local name=$1
  local port=$2
  if port_in_use "$port"; then
    local proc_info
    proc_info=$(lsof -i ":$port" -sTCP:LISTEN -t 2>/dev/null | head -1)
    if [ -n "$proc_info" ]; then
      if [ -f "$PID_FILE" ]; then
        load_pid_file
        case "$name" in
          Phoenix)  [ "$proc_info" = "$phoenix" ]  && return 0 ;;
          Express)  [ "$proc_info" = "$express" ]  && return 0 ;;
          Frontend) [ "$proc_info" = "$frontend" ] && return 0 ;;
        esac
      fi
      error "Port $port is already in use by PID $proc_info. Run './scripts/dev.sh stop' first or kill the process."
      return 1
    fi
  fi
  return 0
}

is_pid_alive() {
  local pid=$1
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

load_pid_file() {
  phoenix=""
  express=""
  frontend=""

  if [ -f "$PID_FILE" ]; then
    phoenix=$(grep '^phoenix=' "$PID_FILE" | cut -d= -f2)
    express=$(grep '^express=' "$PID_FILE" | cut -d= -f2)
    frontend=$(grep '^frontend=' "$PID_FILE" | cut -d= -f2)
  fi
}

all_services_running() {
  load_pid_file
  is_pid_alive "$phoenix" && is_pid_alive "$express" && is_pid_alive "$frontend"
}

stop_service() {
  local name=$1
  local pid=$2

  if [ -z "$pid" ]; then
    return 0
  fi

  if ! is_pid_alive "$pid"; then
    warn "$name already stopped (PID $pid)"
    return 0
  fi

  info "Stopping $name (PID $pid)..."
  kill "$pid" 2>/dev/null
  sleep 5

  if is_pid_alive "$pid"; then
    warn "$name did not exit after SIGTERM; sending SIGKILL"
    kill -9 "$pid" 2>/dev/null
    sleep 1
  fi

  if is_pid_alive "$pid"; then
    error "Failed to stop $name (PID $pid)"
    return 1
  fi

  ok "$name stopped"
  return 0
}

wait_for_all_healthy() {
  local max_wait=45
  local waited=0
  local phoenix_ok=0
  local express_ok=0
  local frontend_ok=0

  info "Waiting for health checks (up to ${max_wait}s)..."

  while [ $waited -lt $max_wait ]; do
    if [ $phoenix_ok -eq 0 ] && curl -sf "http://phoenix.localhost/api/health" >/dev/null 2>&1; then
      printf "  ✅ Phoenix is ready (%ss)\n" "$waited"
      phoenix_ok=1
    fi
    if [ $express_ok -eq 0 ] && curl -sf "http://express.localhost/api/health" >/dev/null 2>&1; then
      printf "  ✅ Express is ready (%ss)\n" "$waited"
      express_ok=1
    fi
    if [ $frontend_ok -eq 0 ] && curl -sf "http://frontend.localhost" >/dev/null 2>&1; then
      printf "  ✅ Frontend is ready (%ss)\n" "$waited"
      frontend_ok=1
    fi

    if [ $phoenix_ok -eq 1 ] && [ $express_ok -eq 1 ] && [ $frontend_ok -eq 1 ]; then
      return 0
    fi

    sleep 1
    waited=$((waited + 1))
  done

  [ $phoenix_ok -eq 0 ] && printf "  ❌ Phoenix failed to start within %ss\n" "$max_wait"
  [ $express_ok -eq 0 ] && printf "  ❌ Express failed to start within %ss\n" "$max_wait"
  [ $frontend_ok -eq 0 ] && printf "  ❌ Frontend failed to start within %ss\n" "$max_wait"
  return 1
}

ensure_portless_proxy() {
  info "Checking Portless proxy..."

  if portless proxy status >/dev/null 2>&1; then
    ok "Portless proxy is running"
    return 0
  fi

  warn "Portless proxy is not running; starting it"
  if portless proxy start --no-tls >/dev/null 2>&1; then
    ok "Portless proxy started"
    return 0
  fi

  error "Failed to start Portless proxy"
  return 1
}

check_postgres() {
  info "Checking PostgreSQL..."
  if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    ok "PostgreSQL is accepting connections"
    return 0
  fi

  error "PostgreSQL is not running on localhost:5432"
  return 1
}

db_exists() {
  psql -h localhost -U postgres -lqt 2>/dev/null | cut -d '|' -f 1 | grep -qw backend_repo
}

db_setup() {
  info "Setting up Phoenix database..."
  if (cd "$PROJECT_ROOT/backend/myapp" && mix deps.get && mix ecto.create && mix ecto.migrate); then
    ok "Database setup completed"
    return 0
  fi

  error "Database setup failed"
  return 1
}

write_pid_file() {
  ensure_pid_dir
  cat > "$PID_FILE" <<EOF
phoenix=$PHOENIX_PID
express=$EXPRESS_PID
frontend=$FRONTEND_PID
EOF
}

show_urls() {
  printf "\n"
  ok "Services available at:"
  printf "  Phoenix:  http://phoenix.localhost\n"
  printf "  Express:  http://express.localhost\n"
  printf "  Frontend: http://frontend.localhost\n"
}

start_services() {
  if [ -f "$PID_FILE" ] && all_services_running; then
    warn "Services are already running"
    show_status
    return 0
  fi

  if [ -f "$PID_FILE" ] && ! all_services_running; then
    warn "Removing stale PID file"
    rm -f "$PID_FILE"
  fi

  ensure_portless_proxy || return 1
  check_postgres || return 1

  check_port_free "Phoenix" 4000 || return 1
  check_port_free "Express" 3001 || return 1
  check_port_free "Frontend" 5173 || return 1

  if db_exists; then
    ok "Database backend_dev already exists"
  else
    warn "Database backend_dev not found"
    db_setup || return 1
  fi

  info "Starting Phoenix..."
  (cd "$PROJECT_ROOT/backend/myapp" && mix phx.server) &
  PHOENIX_PID=$!
  if ! portless alias phoenix 4000 >/dev/null 2>&1; then
    warn "Failed to register phoenix.localhost alias immediately"
  fi

  info "Starting Express..."
  (cd "$PROJECT_ROOT/agent-ui/server" && PORT=3001 node index.js) &
  EXPRESS_PID=$!
  if ! portless alias express 3001 >/dev/null 2>&1; then
    warn "Failed to register express.localhost alias"
  fi

  info "Starting Frontend..."
  (cd "$PROJECT_ROOT/agent-ui" && npx vite --strictPort --host 127.0.0.1) &
  FRONTEND_PID=$!
  sleep 3
  if ! portless alias frontend 5173 >/dev/null 2>&1; then
    warn "Failed to register frontend.localhost alias"
  fi

  START_WROTE_PID_FILE=1
  write_pid_file

  wait_for_all_healthy || {
    stop_services
    return 1
  }

  START_WROTE_PID_FILE=0
  ok "All services started"
  show_urls
  return 0
}

stop_services() {
  if [ ! -f "$PID_FILE" ]; then
    warn "No services running"
    return 0
  fi

  load_pid_file

  stop_service "Frontend" "$frontend"
  stop_service "Express" "$express"
  stop_service "Phoenix" "$phoenix"

  info "Removing portless aliases..."
  portless alias --remove phoenix 2>/dev/null
  portless alias --remove express 2>/dev/null
  portless alias --remove frontend 2>/dev/null

  rm -f "$PID_FILE"
  START_WROTE_PID_FILE=0
  ok "All tracked services stopped"
  return 0
}

show_status() {
  if [ ! -f "$PID_FILE" ]; then
    warn "No services running"
    return 0
  fi

  load_pid_file

  printf "%-10s | %-8s | %-8s | %s\n" "Service" "PID" "Status" "URL"
  printf "%-10s-+-%-8s-+-%-8s-+-%s\n" "----------" "--------" "--------" "-------------------------------"

  if is_pid_alive "$phoenix"; then
    phoenix_status="running"
  else
    phoenix_status="stopped"
  fi

  if is_pid_alive "$express"; then
    express_status="running"
  else
    express_status="stopped"
  fi

  if is_pid_alive "$frontend"; then
    frontend_status="running"
  else
    frontend_status="stopped"
  fi

  printf "%-10s | %-8s | %-8s | %s\n" "Phoenix" "${phoenix:-n/a}" "$phoenix_status" "http://phoenix.localhost"
  printf "%-10s | %-8s | %-8s | %s\n" "Express" "${express:-n/a}" "$express_status" "http://express.localhost"
  printf "%-10s | %-8s | %-8s | %s\n" "Frontend" "${frontend:-n/a}" "$frontend_status" "http://frontend.localhost"

  printf "\n"
  info "Portless routes:"
  portless list
}

restart_services() {
  stop_services || return 1
  sleep 2
  start_services
}

handle_signal() {
  warn "Received shutdown signal"
  stop_services
  exit 0
}

trap cleanup_on_exit EXIT
trap handle_signal INT TERM

COMMAND=${1:-}

case "$COMMAND" in
  "")
    usage
    ;;
  --help)
    usage
    ;;
  start)
    start_services
    ;;
  stop)
    stop_services
    ;;
  status)
    show_status
    ;;
  restart)
    restart_services
    ;;
  db:setup)
    db_setup
    ;;
  *)
    usage
    exit 1
    ;;
esac
