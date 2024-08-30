@echo off
setlocal enabledelayedexpansion

echo Updating repository...

REM Generate a new version number (using current date and time)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set version=%datetime:~0,8%-%datetime:~8,6%

REM Update version numbers in index.html
powershell -Command "(gc index.html) -replace '(script.js\?v=)[0-9.-]+', '$1%version%' | Out-File -encoding ASCII index.html"
powershell -Command "(gc index.html) -replace '(styles.css\?v=)[0-9.-]+', '$1%version%' | Out-File -encoding ASCII index.html"

REM Update version number in script.js
powershell -Command "(gc script.js) -replace '(Script version: )[0-9.-]+', '$1%version%' | Out-File -encoding ASCII script.js"

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

REM Remove data.json from tracking if it exists
git rm --cached data.json 2>nul

REM Add all changes
echo Staging all changes
git add .

REM Check for large files
for /f "tokens=3" %%a in ('git status --porcelain ^| findstr /r "^?? "') do (
    for %%F in ("%%a") do (
        set "size=%%~zF"
        if !size! gtr 104857600 (
            echo Warning: File %%F is larger than 100MB. Removing from staging.
            git reset HEAD "%%F"
        )
    )
)

REM Check if there are changes to commit
git diff --cached --quiet
if errorlevel 1 (
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
) else (
    echo No changes to commit
)

echo Repository update complete.
pause
