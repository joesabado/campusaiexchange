@echo off
setlocal enabledelayedexpansion

echo Updating repository...

REM Fetch the latest changes from the remote repository
echo Fetching changes from remote repository
git fetch origin

REM Check if there are any changes to pull
git rev-list HEAD...origin/main --count > temp.txt
set /p commit_count=<temp.txt
del temp.txt

if %commit_count% gtr 0 (
    echo There are changes to pull. Pulling changes...
    git pull --rebase origin main
    if errorlevel 1 (
        echo Pull failed. Attempting merge...
        git merge origin/main --allow-unrelated-histories
        if errorlevel 1 (
            echo Merge failed. Please resolve conflicts manually and run the script again.
            exit /b 1
        )
    )
) else (
    echo Local repository is up to date.
)

REM Stage all changes
echo Staging all changes
git add -A

REM Check for large files
git diff --cached --numstat | findstr /R "^-" > nul
if not errorlevel 1 (
    echo Warning: Large files detected. Please review before committing.
    git diff --cached --numstat
    set /p continue="Do you want to continue? (Y/N): "
    if /i "!continue!" neq "Y" (
        echo Aborting commit. Please review and stage files manually.
        exit /b 1
    )
)

REM Commit changes
set /p commit_message="Enter commit message: "
if "!commit_message!"=="" (
    set commit_message="Auto-update: %date% %time%"
)
echo Committing changes with message: "!commit_message!"
git commit -m "!commit_message!"

REM Push changes to remote repository
echo Pushing changes to remote repository
git push origin main
if errorlevel 1 (
    echo Push failed. Pulling latest changes and trying again...
    git pull --rebase origin main
    git push origin main
    if errorlevel 1 (
        echo Push failed again. Please resolve issues manually.
        exit /b 1
    )
)

echo Repository update complete.
pause
