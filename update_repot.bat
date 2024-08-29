@echo off
setlocal enabledelayedexpansion

echo Updating repository...

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
    
    REM Push changes to remote repository
    echo Pushing changes to remote repository
    git push
) || (
    echo No changes to commit
)

echo Repository update complete.
pause
