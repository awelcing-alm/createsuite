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
    python3 python3-pip make g++ sudo locales \
    libncurses5-dev libncursesw5-dev libssl-dev \
    inotify-tools jq ripgrep fd-find fzf htop \
    unzip zip vim-tiny zsh \
    && rm -rf /var/lib/apt/lists/*

# --- 2. Node.js (22.x) & Bun ---
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && curl -fsSL https://bun.sh/install | bash \
    && rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.bun/bin:${PATH}"

# --- 3. Rust (For High-Performance NIFs & CLI Tools) ---
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# --- 4. Modern CLI Replacements (The "Power" Tools) ---
RUN cargo install eza bat zoxide starship

# --- 5. Ghostty Terminfo (For the ultimate terminal experience) ---
RUN mkdir -p /tmp/ghostty && \
    curl -fsSL https://raw.githubusercontent.com/ghostty-org/ghostty/main/terminfo/ghostty.terminfo -o /tmp/ghostty/ghostty.terminfo && \
    tic -x /tmp/ghostty/ghostty.terminfo && \
    rm -rf /tmp/ghostty

# --- 6. GitHub CLI ---
RUN type -p curl >/dev/null || (apt-get update && apt-get install curl -y) \
    && mkdir -p -m 755 /etc/apt/keyrings \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install gh -y

# --- 7. OpenCode & CreateSuite Runtime ---
RUN curl -fsSL https://opencode.ai/install | bash
ENV PATH="/root/.opencode/bin:${PATH}"

# --- 8. Zsh Setup (Oh My Zsh + Customizations) ---
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
RUN git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# Create a unique Zsh config
RUN echo 'eval "$(starship init zsh)"' >> ~/.zshrc && \
    echo 'eval "$(zoxide init zsh)"' >> ~/.zshrc && \
    echo 'alias ls="eza --icons"' >> ~/.zshrc && \
    echo 'alias cat="bat"' >> ~/.zshrc && \
    echo 'alias cs-tasks="ls .createsuite/tasks"' >> ~/.zshrc && \
    echo 'alias cs-agents="ls .createsuite/agents"' >> ~/.zshrc && \
    echo 'alias cs-convoys="ls .createsuite/convoys"' >> ~/.zshrc

# --- 9. CreateSuite Welcome Message (The "Zone" feel) ---
RUN echo 'echo "\033[1;35m      ___                   _         ____        _ _       \033[0m"' >> ~/.zshrc && \
    echo 'echo "\033[1;35m     / __\ __ ___  __ _| |_ ___ / ___| _   _(_) |_ ___ \033[0m"' >> ~/.zshrc && \
    echo 'echo "\033[1;34m    / / | \x27__/ _ \/ _\x60 | __/ _ \\___ \| | | | | __/ _ \ \033[0m"' >> ~/.zshrc && \
    echo 'echo "\033[1;34m   / /__| | |  __/ (_| | ||  __/ ___| | |_| | | ||  __/ \033[0m"' >> ~/.zshrc && \
    echo 'echo "\033[1;36m   \____/_|  \___|\__,_|\__\___|____/ \__,_|_|\__\___| \033[0m"' >> ~/.zshrc && \
    echo 'echo "\033[1;32m   --------------------------------------------------- \033[0m"' >> ~/.zshrc && \
    echo 'echo "\033[1;33m   Welcome to the CreateSuite Evolution Zone.           \033[0m"' >> ~/.zshrc && \
    echo 'echo "\033[0m"' >> ~/.zshrc

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
