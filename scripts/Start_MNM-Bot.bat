@echo off

@echo Starting 'Exam-bot'
cd /D D:\GitHub\DiscordBots\Exam-bot\
pm2 start .\src\index.js --name Exam-bot --watch

@echo:
@echo 'Exam-bot' started, please check...

pause
