#!/bin/bash

exec 1>&2

RED=$(tput setaf 1) 
YELLOW=$(tput setaf 3)
RESET=$(tput sgr0)

ONLY_DIFF=$(git diff -U0 --cached -S"(\W|^)(it|describe)\.only\s+?\(" --pickaxe-regex | egrep "(^\+.*(it|describe).only)|\+{3}")

if [ -n "$ONLY_DIFF" ]; then
    echo "❌  Check failed: ${YELLOW}.only(..)${RESET} on tests not allowed!"
    echo "${RED}$ONLY_DIFF${RESET}"
    exit 1
fi
