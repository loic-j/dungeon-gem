FROM mcr.microsoft.com/devcontainers/javascript-node:24

# Install pnpm
RUN npm install -g pnpm

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Install Playwright system-level deps for Chromium (runs as root)
RUN npx --yes playwright install-deps chromium

USER node
