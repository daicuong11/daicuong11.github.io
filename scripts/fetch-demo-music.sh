#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/music"
mkdir -p "$DEST"
cd "$DEST"
echo "Downloading SoundHelix-Song-1.mp3 into 01.mp3 (large file)..."
curl -L --fail -o 01.mp3 "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
for i in 02 03 04 05 06 07 08 09 10; do
  cp -f 01.mp3 "$i.mp3"
done
echo "Done. Replace with your own shorter MP3s when ready."
