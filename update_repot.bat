@echo off
setlocal enabledelayedexpansion

echo Updating repository...

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
    
    REM Push changes to remote repository
    echo Pushing changes to remote repository
    git push
) || (
    echo No changes to commit
)

echo Repository update complete.
pause
