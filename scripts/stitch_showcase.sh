#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTDIR="$ROOT/showcase"
mkdir -p "$OUTDIR"

mapfile -t VIDEOS < <(find "$ROOT/test-results" -type f -name '*.webm' | sort)
if [ ${#VIDEOS[@]} -eq 0 ]; then
  echo "No Playwright videos found under test-results/" >&2
  exit 1
fi

LIST="$OUTDIR/inputs.txt"
: > "$LIST"
for video in "${VIDEOS[@]}"; do
  printf "file '%s'\n" "$video" >> "$LIST"
done

rm -f "$OUTDIR/trustplane-showcase-raw.webm" "$OUTDIR/trustplane-showcase-firstcut.mp4"

ffmpeg -y -f concat -safe 0 -i "$LIST" -c copy "$OUTDIR/trustplane-showcase-raw.webm" >/dev/null 2>&1 || \
ffmpeg -y -f concat -safe 0 -i "$LIST" -vf format=yuv420p -c:v libx264 -preset veryfast -crf 23 "$OUTDIR/trustplane-showcase-firstcut.mp4" >/dev/null 2>&1

if [ -f "$OUTDIR/trustplane-showcase-raw.webm" ]; then
  echo "$OUTDIR/trustplane-showcase-raw.webm"
elif [ -f "$OUTDIR/trustplane-showcase-firstcut.mp4" ]; then
  echo "$OUTDIR/trustplane-showcase-firstcut.mp4"
else
  echo "Failed to stitch showcase video" >&2
  exit 1
fi
