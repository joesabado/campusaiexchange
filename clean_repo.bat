@echo off
setlocal enabledelayedexpansion

echo Cleaning repository...

REM Force remove script.js from Git tracking
git rm -f script.js
if errorlevel 1 (
    echo script.js not tracked by Git, continuing...
)

REM Remove script.js file if it exists
if exist "script.js" (
    echo Removing script.js file
    del /F /Q "script.js"
)

REM Update .gitignore to exclude script.js
echo Updating .gitignore
echo /script.js >> .gitignore
sort .gitignore /O .gitignore

REM Clean Git cache
echo Cleaning Git cache
git rm -r --cached .
git add .

REM Commit changes
set "commit_message=Force remove script.js and update .gitignore"
echo Committing changes: !commit_message!
git commit -m "!commit_message!"

REM Push changes
echo Pushing changes to remote repository
git push origin main

echo Repository cleaning complete.
pause