#!/bin/sh
set -eu
cd "$(dirname "$0")/../project"
npm run render:final -- '../output/动效优化版.mp4' --browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --concurrency=4
