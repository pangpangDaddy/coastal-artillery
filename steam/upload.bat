@echo off
REM 上传构建到 Steam。需要先下载 Steamworks SDK:
REM https://partner.steamgames.com/downloads/steamworks_sdk.zip
REM 把 sdk\tools\ContentBuilder\builder\steamcmd.exe 的路径填到下面

set STEAMCMD=C:\steamworks_sdk\tools\ContentBuilder\builder\steamcmd.exe
set /p PASSWORD=Steam password (or leave empty if cached): 

%STEAMCMD% +login YOUR_STEAM_ACCOUNT %PASSWORD% +run_app_build "%~dp0scripts\app_build.vdf" +quit
