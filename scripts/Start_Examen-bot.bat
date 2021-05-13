@echo off

@echo 'Examen-bot' starten...
cd /D D:\GitHub\DiscordBots\Examen-bot\
pm2 start .\src\index.js --name Examen-bot --watch

@echo:
@echo 'Examen-bot' gestart
