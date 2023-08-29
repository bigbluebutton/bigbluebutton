#!/bin/bash
set -e
set -x

# Check if `jq` is available
if ! command -v jq &> /dev/null; then
    echo "Error: 'jq' is not installed. Please install 'jq' before using this script."
    exit 1
fi

# Check if both the PR number is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <PR_NUMBER>"
    exit 1
fi

PR_NUMBER=$1
REPO_URL="https://github.com/bigbluebutton/bigbluebutton.git"

# Get the PR branch name
PR_BRANCH=$(curl -s https://api.github.com/repos/bigbluebutton/bigbluebutton/pulls/${PR_NUMBER} | jq -r '.head.ref')

# Get the sender's username
SENDER_USERNAME=$(curl -s https://api.github.com/repos/bigbluebutton/bigbluebutton/pulls/${PR_NUMBER} | jq -r '.head.repo.owner.login')

# Configure the sender's fork as a remote with a name based on the sender's username
REMOTE_NAME="upstream_${SENDER_USERNAME}"
if git remote | grep -q "^$REMOTE_NAME$"; then
  git remote remove $REMOTE_NAME
fi

git remote add ${REMOTE_NAME} git@github.com:${SENDER_USERNAME}/bigbluebutton.git

# Fetch the PR branch and create a local branch to track it
LOCAL_BRANCH="PR_${PR_NUMBER}"
git fetch ${REMOTE_NAME} ${PR_BRANCH}
if git branch --list ${LOCAL_BRANCH} | grep ${LOCAL_BRANCH}; then
  git checkout develop
  git branch -D ${LOCAL_BRANCH}
fi
git checkout -b ${LOCAL_BRANCH} ${REMOTE_NAME}/${PR_BRANCH}

echo "Created and checked out local branch '${LOCAL_BRANCH}'"
echo "Configured '${SENDER_USERNAME}' fork as '${REMOTE_NAME}'"
echo "Tracking '${PR_BRANCH}' from '${REMOTE_NAME}'"

