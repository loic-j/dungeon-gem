#!/bin/bash
set -e

HOST_CLAUDE=/tmp/.claude-host
CLAUDE_DIR=/home/node/.claude

# Save plugin state baked into image (plugins/ dir + enabledPlugins from settings)
BAKED_ENABLED=$(node -e "
  try {
    const s = JSON.parse(require('fs').readFileSync('$CLAUDE_DIR/settings.json', 'utf8'));
    process.stdout.write(JSON.stringify(s.enabledPlugins || []));
  } catch(e) { process.stdout.write('[]'); }
")

# Copy host credentials/state — exclude plugins/ (baked in image)
find "$HOST_CLAUDE" -mindepth 1 -maxdepth 1 ! -name 'plugins' -exec cp -r {} "$CLAUDE_DIR/" \;

# Merge settings: keep host permissions/hooks, restore baked enabledPlugins
SETTINGS="$CLAUDE_DIR/settings.json"
if [ -f "$SETTINGS" ]; then
  node -e "
    const fs = require('fs');
    const s = JSON.parse(fs.readFileSync('$SETTINGS', 'utf8'));
    s.enabledPlugins = $BAKED_ENABLED;
    delete s.extraKnownMarketplaces;
    fs.writeFileSync('$SETTINGS', JSON.stringify(s, null, 2));
  "
fi

# Fix hardcoded host paths in copied files
find "$CLAUDE_DIR" -type f \( -name '*.json' -o -name '*.jsonl' \) \
  -exec sed -i "s|$HOST_HOME|/home/node|g" {} +
