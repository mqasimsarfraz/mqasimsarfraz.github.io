#!/bin/sh

set -e

command -v hugo >/dev/null 2>&1 || { echo >&2 "I require 'hugo' but it's not installed.  Aborting."; exit 1; }


echo "Info: Building site ..."

hugo --gc --minify