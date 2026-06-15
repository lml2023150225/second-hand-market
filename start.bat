@echo off
chcp 65001 > nul
echo ===============================
echo   校园二手交易平台 - 启动中...
echo ===============================
echo.
echo [1/2] 启动网站服务器...
start "校园二手-服务器" cmd /c "cd /d %~dp0 && npx next dev -p 3000"
echo [2/2] 启动公网隧道...
echo.
echo 等待服务器启动...
timeout /t 5 /nobreak > nul
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:3000 serveo.net
pause
