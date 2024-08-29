@echo off
setlocal enabledelayedexpansion

echo Updating repository...

<<<<<<< HEAD
REM Fetch the latest changes from the remote repository
echo Fetching changes from remote repository
git fetch

REM Check if there are any changes to pull
git rev-list HEAD...origin/main --count > temp.txt
set /p commit_count=<temp.txt
del temp.txt

if %commit_count% gtr 0 (
    echo There are changes to pull. Pulling changes...
    git pull --rebase
) else (
    echo Local repository is up to date.
)

REM Add all changes
echo Staging all changes
git add -A

REM Check if there are changes to commit
git diff --cached --quiet || (
    set /p commit_message="Enter commit message: "
    if "!commit_message!"=="" (
        set commit_message="Auto-update: %date% %time%"
    )
    echo Committing changes with message: "!commit_message!"
    git commit -m "!commit_message!"
=======
REM Stash local changes to data.json if it exists and has changes
git diff --quiet data.json || (
    echo Stashing changes to data.json
    git stash push data.json
)

REM Pull changes from the remote repository
echo Pulling changes from remote repository
git pull

REM Pop the stashed changes to data.json if there were any
git stash list | findstr /C:"stash@{0}" >nul && (
    echo Reapplying local changes to data.json
    git stash pop
) || (
    echo No stashed changes for data.json
)

REM Add all changes except data.json
echo Staging changes (excluding data.json)
git add -A
git reset -- data.json

REM Check if there are changes to commit
git diff --cached --quiet || (
    echo Committing changes with automatic message
    git commit -m "Auto-update: %date% %time%"
    echo Changes committed
>>>>>>> origin/main
    
    REM Push changes to remote repository
    echo Pushing changes to remote repository
    git push
) || (
    echo No changes to commit
)

echo Repository update complete.
pause
