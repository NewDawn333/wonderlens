#!/bin/zsh
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")"
echo "Starting Wonderlens..."
echo "Leave this Mac awake and this window open while you are at the park."
echo ""
node scripts/open-on-phone.mjs
echo ""
read -k 1 "?Press any key to stop the server."
