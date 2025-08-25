@echo off
echo Starting AI Analysis Server...
echo.
echo Make sure you have:
echo 1. Node.js installed
echo 2. Created a .env file in the server directory with your GEMINI_API_KEY
echo 3. Run 'npm install' in the server directory
echo.
cd server
npm start
pause
