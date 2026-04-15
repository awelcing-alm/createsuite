# CreateSuite "Unique Zone" Ultra Container
# Designed to be a high-performance, aesthetically unique development environment

# Base: Optimized Elixir + Erlang on Debian Bookworm
FROM hexpm/elixir:1.18.2-erlang-27.2.1-debian-bookworm-20260202

# Suppress interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/zsh

# --- 1. Core System Power & Build Tools ---
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg2 ca-certificates git build-essential \
    python3 make g++ locales \
    libncurses5-dev libncursesw5-dev libssl-dev \
    inotify-tools jq ripgrep fd-find fzf htop \
    unzip zip vim-tiny zsh postgresql postgresql-contrib lsof \
    && rm -rf /var/lib/apt/lists/*

# --- 2. Node.js (22.x) ---
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# --- 3. Modern CLI Replacements (pre-built binaries; no Rust toolchain needed) ---
RUN \
    # eza
    EZA_VERSION=$(curl -sL https://api.github.com/repos/eza-community/eza/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/') && \
    curl -fsSL "https://github.com/eza-community/eza/releases/download/${EZA_VERSION}/eza_x86_64-unknown-linux-gnu.tar.gz" | tar xz -C /usr/local/bin && \
    # bat
    BAT_VERSION=$(curl -sL https://api.github.com/repos/sharkdp/bat/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/') && \
    curl -fsSL "https://github.com/sharkdp/bat/releases/download/${BAT_VERSION}/bat-${BAT_VERSION}-x86_64-unknown-linux-gnu.tar.gz" | tar xzO "bat-${BAT_VERSION}-x86_64-unknown-linux-gnu/bat" > /usr/local/bin/bat && chmod +x /usr/local/bin/bat && \
    # zoxide
    ZOXIDE_VERSION=$(curl -sL https://api.github.com/repos/ajeetdsouza/zoxide/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/') && \
    curl -fsSL "https://github.com/ajeetdsouza/zoxide/releases/download/${ZOXIDE_VERSION}/zoxide-${ZOXIDE_VERSION}-x86_64-unknown-linux-gnu.tar.gz" | tar xz -C /usr/local/bin zoxide && \
    # starship
    curl -fsSL https://starship.rs/install.sh | sh -s -- -y -b /usr/local/bin

# --- 4. Ghostty Terminfo (For the ultimate terminal experience) ---
RUN mkdir -p /usr/share/terminfo/x && \
    curl -fsSL https://raw.githubusercontent.com/sneethe/terminfo/master/78/xterm-ghostty -o /usr/share/terminfo/x/xterm-ghostty

# --- 5. GitHub CLI ---
RUN type -p curl >/dev/null || (apt-get update && apt-get install curl -y) \
    && mkdir -p -m 755 /etc/apt/keyrings \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y --no-install-recommends gh \
    && rm -rf /var/lib/apt/lists/*

# --- 6. OpenCode & CreateSuite Runtime ---
RUN curl -fsSL https://opencode.ai/install | bash
ENV PATH="/root/.opencode/bin:${PATH}"

# --- 7. Zsh Setup (Oh My Zsh + Customizations) ---
# Shallow clone for much faster image builds
RUN git clone --depth 1 https://github.com/ohmyzsh/ohmyzsh.git ~/.oh-my-zsh && \
    cp ~/.oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc

RUN mkdir -p ~/.config && cat <<'EOF' > ~/.config/starship.toml
"$schema" = 'https://starship.rs/config-schema.json'

add_newline = false
scan_timeout = 25
command_timeout = 300
follow_symlinks = false

format = "$directory$git_branch$git_status$cmd_duration$line_break$character"

[cmd_duration]
min_time = 1200
format = "[ took $duration](dimmed white)"
EOF

RUN echo 'export DISABLE_AUTO_UPDATE="true"' >> ~/.zshrc && \
    echo 'export DISABLE_UPDATE_PROMPT="true"' >> ~/.zshrc && \
    echo 'export ZSH_DISABLE_COMPFIX="true"' >> ~/.zshrc && \
    echo 'export STARSHIP_LOG="error"' >> ~/.zshrc && \
    echo 'eval "$(starship init zsh)"' >> ~/.zshrc && \
    echo 'eval "$(zoxide init zsh)"' >> ~/.zshrc && \
    echo 'alias ls="eza --icons"' >> ~/.zshrc && \
    echo 'alias cat="bat"' >> ~/.zshrc && \
    echo 'alias cs-tasks="ls .createsuite/tasks"' >> ~/.zshrc && \
    echo 'alias cs-agents="ls .createsuite/agents"' >> ~/.zshrc && \
    echo 'alias cs-convoys="ls .createsuite/convoys"' >> ~/.zshrc && \
    echo '[[ -t 1 ]] && /usr/local/bin/createsuite-startup-art' >> ~/.zshrc

RUN cat <<'EOF' > /usr/local/bin/createsuite-startup-art
#!/usr/bin/env bash

if [[ -n "${CREATESUITE_NO_MOTD:-}" ]]; then
  exit 0
fi

if [[ ! -t 1 ]]; then
  exit 0
fi

render() {
  local shift="$1"
  printf "\e[38;2;255;105;80m%*s%s\e[0m\n" "$shift" "" "..::..::..::..::..::..::..::..::..::..::.."
  printf "\e[38;2;255;173;96m%*s%s\e[0m\n" "$shift" "" ".::--==++**xx%%##%%xx**++==--::.  createsuite"
  printf "\e[38;2;255;214;120m%*s%s\e[0m\n" "$shift" "" "::--==++**x%%%%@@@@%%%%x**++==--::  kinetic mesh"
  printf "\e[38;2;180;226;120m%*s%s\e[0m\n" "$shift" "" "..::--==++**x%%%%@@%%%%x**++==--::.."
  printf "\e[38;2;110;214;170m%*s%s\e[0m\n" "$shift" "" "   ____                _       ____        _ _"
  printf "\e[38;2;90;193;230m%*s%s\e[0m\n" "$shift" "" "  / ___|_ __ ___  __ _| |_ ___/ ___| _   _(_) |_ ___"
  printf "\e[38;2;102;153;255m%*s%s\e[0m\n" "$shift" "" " | |   | '__/ _ \/ _\` | __/ _ \\___ \\| | | | | __/ _ \\"
  printf "\e[38;2;153;120;255m%*s%s\e[0m\n" "$shift" "" " | |___| | |  __/ (_| | ||  __/___) | |_| | | ||  __/"
  printf "\e[38;2;214;110;255m%*s%s\e[0m\n" "$shift" "" "  \\____|_|  \\___|\\__,_|\\__\\___|____/ \\__,_|_|\\__\\___|"
  printf "\e[38;2;220;220;220m%*s%s\e[0m\n" "$shift" "" "..::..::..::..::..::..::..::..::..::..::..::.."
}

render 0
sleep 0.010
render 1
sleep 0.010
render 0
printf "\e[2m%s\e[0m\n\n" "startup telemetry: stable | prompt diagnostics: clear"
EOF
RUN chmod +x /usr/local/bin/createsuite-startup-art

# --- 8. Portless proxy (required by dev.sh) ---
RUN npm install -g portless

# --- 9. PostgreSQL Setup ---
# Configure for local development (trust auth, listen on all interfaces)
RUN sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/*/main/postgresql.conf \
    && echo "host all all 0.0.0.0/0 trust" >> /etc/postgresql/*/main/pg_hba.conf

# --- 10. Elixir/Mix Optimization ---
RUN mix local.hex --force && \
    mix local.rebar --force

# --- 11. Environment Tuning ---
WORKDIR /workspaces/createsuite
ENV NODE_ENV=development
ENV MIX_ENV=dev
ENV PHX_SERVER=true
ENV TERM=xterm-256color

# Set locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

CMD ["zsh"]
