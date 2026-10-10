@echo off
chcp 65001 >nul
title Cabinet · 珍奇柜画廊构建工具
echo ========================================================
echo   Cabinet · 扫描 pic/ 描述卡片并同步画廊清单
echo ========================================================
echo.

python "%~dp0build_cabinet.py"

echo.
pause
