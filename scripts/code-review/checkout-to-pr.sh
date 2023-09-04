#!/bin/bash
# set -e
# set -x

# Check if `jq` is available
if ! command -v jq &> /dev/null; then
    echo "Error: 'jq' is not installed. Please install 'jq' before using this script."
    echo "sudo apt install jq -y"
    exit 1
fi

# Check if both the PR number is provided
if [  $# -le 0 ]; then
    echo "Usage: $0 <PR_NUMBER>"
    exit 1
fi

# Check if the PR number was provided as a number
if [[ "$1" =~ ^[0-9]+$ ]]; then
    echo "Argument is a valid number."
else
    echo "Argument is not a valid number."
    exit 1
fi

# Check if the current directory is a Git repository
if [ ! -d .git ]; then
    echo "This is not a Git repository."
    exit 1
fi

# Check if there are any uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "There are uncommitted changes in the repository."
    if [ "$2" == "--stash" ]; then
        git stash save "Temporary stash of local code while reviewing $1"
        echo "Uncommitted changes stashed. You can retrieve them later."
    else 
        echo "Please commit or stash your changes before proceeding."
        exit 1
    fi
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

