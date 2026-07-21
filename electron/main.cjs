const { app, BrowserWindow } = require('electron')
const path = require('path')

// Required for the Steam overlay to render on top of the game
app.commandLine.appendSwitch('in-process-gpu')
app.commandLine.appendSwitch('disable-direct-composition')

// 480 = Spacewar (Valve's public test AppID). Replace with your real AppID
// after registering on Steamworks, and update steam_appid.txt to match.
const STEAM_APP_ID = 480

let steamClient = null
function initSteam() {
  try {
    const steamworks = require('steamworks.js')
    steamClient = steamworks.init(STEAM_APP_ID)
    steamworks.electronEnableSteamOverlay()
    console.log('Steam initialized as:', steamClient.localplayer.getName())
  } catch (err) {
    // Runs fine without Steam (dev mode / DRM-free)
    console.log('Steam not available, running standalone:', err.message)
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#0c0c0c',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

app.whenReady().then(() => {
  initSteam()
  createWindow()
})

app.on('window-all-closed', () => app.quit())
