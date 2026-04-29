FROM mcr.microsoft.com/devcontainers/javascript-node:24

# Install pnpm
RUN npm install -g pnpm

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Install Playwright system-level deps for Chromium (runs as root)
RUN npx --yes playwright install-deps chromium

USER node

# Install Claude plugins (baked into image — no host config used, rebuild image to update)
RUN claude plugins marketplace add anthropics/claude-plugins-official && \
    claude plugins marketplace add JuliusBrussee/caveman && \
    claude plugins install frontend-design@claude-plugins-official && \
    claude plugins install context7@claude-plugins-official && \
    claude plugins install code-simplifier@claude-plugins-official && \
    claude plugins install github@claude-plugins-official && \
    claude plugins install feature-dev@claude-plugins-official && \
    claude plugins install playwright@claude-plugins-official && \
    claude plugins install claude-md-management@claude-plugins-official && \
    claude plugins install typescript-lsp@claude-plugins-official && \
    claude plugins install security-guidance@claude-plugins-official && \
    claude plugins install commit-commands@claude-plugins-official && \
    claude plugins install claude-code-setup@claude-plugins-official && \
    claude plugins install prisma@claude-plugins-official && \
    claude plugins install terraform@claude-plugins-official && \
    claude plugins install caveman@caveman
