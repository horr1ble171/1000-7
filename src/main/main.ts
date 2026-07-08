import { app, BrowserWindow, ipcMain, globalShortcut, screen, nativeTheme, nativeImage, Notification, shell } from 'electron'
import path from 'path'
import os from 'os'
import Store from 'electron-store'
import { setupTray } from './tray'
import { setupIPCHandlers } from './ipcHandlers'

const buildNumber = parseInt(os.release().split('.')[2] || '0', 10)
const isWindows11 = process.platform === 'win32' && buildNumber >= 22000

interface AppSettings {
  startHotkey: string
  stopHotkey: string
  totalDuration: number
  theme: 'dark' | 'light'
  syncThemeWithOS: boolean
  animations: boolean
  uiScale: number
  autoStart: boolean
  minimizeToTray: boolean
  windowBounds: { x: number; y: number; width: number; height: number }
  windowMaximized: boolean
}

const store = new Store<AppSettings>({
  defaults: {
    startHotkey: 'F1',
    stopHotkey: 'F2',
    totalDuration: 25,
    theme: 'dark',
    syncThemeWithOS: true,
    animations: true,
    uiScale: 100,
    autoStart: false,
    minimizeToTray: true,
    windowBounds: { x: undefined as any, y: undefined as any, width: 520, height: 660 },
    windowMaximized: false
  }
})

const PROTOCOL = 'autosender'
let mainWindow: BrowserWindow | null = null

// ─── Single Instance Lock ───────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.show()
    }
    const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL}://`))
    if (url) handleDeepLink(url)
  })
}

// ─── Deep Linking Protocol ──────────────────────────────────
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL)
}

function handleDeepLink(url: string) {
  mainWindow?.webContents.send('deep-link', url)
}

// ─── Apply Theme ────────────────────────────────────────────
function applyTheme() {
  const syncTheme = store.get('syncThemeWithOS')
  if (syncTheme) {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    mainWindow?.webContents.send('theme-changed', theme)
  }
}

// ─── Create Window ──────────────────────────────────────────
function createWindow() {
  const savedBounds = store.get('windowBounds')
  const savedMaximized = store.get('windowMaximized')

  const cursor = screen.getCursorScreenPoint()
  const currentDisplay = screen.getDisplayNearestPoint(cursor)
  const { x: dx, y: dy, width: dw, height: dh } = currentDisplay.workArea

  const bounds = {
    x: Math.max(dx, Math.min(savedBounds.x, dx + dw - 200)),
    y: Math.max(dy, Math.min(savedBounds.y, dy + dh - 200)),
    width: Math.max(480, Math.min(savedBounds.width, dw)),
    height: Math.max(560, Math.min(savedBounds.height, dh))
  }

  mainWindow = new BrowserWindow({
    ...bounds,
    minWidth: 480,
    minHeight: 560,
    resizable: true,
    titleBarStyle: 'hidden',
    ...(isWindows11 ? { backgroundMaterial: 'mica' as const } : {}),
    hasShadow: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    icon: path.join(__dirname, '../../public/icon.png')
  })

  // CSP Headers
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:;"
        ]
      }
    })
  })

  // Safe link handling
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  if (savedMaximized) {
    mainWindow.maximize()
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    if (store.get('autoStart')) {
      app.setLoginItemSettings({ openAtLogin: true })
    }
    applyTheme()
  })

  mainWindow.on('resize', saveWindowBounds)
  mainWindow.on('move', saveWindowBounds)

  mainWindow.on('maximize', () => {
    store.set('windowMaximized', true)
    mainWindow?.webContents.send('window-maximized-changed', true)
  })

  mainWindow.on('unmaximize', () => {
    store.set('windowMaximized', false)
    mainWindow?.webContents.send('window-maximized-changed', false)
  })

  mainWindow.on('close', (event) => {
    if (store.get('minimizeToTray') && !(app as any).isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  // Jump Lists
  app.setUserTasks([
    {
      title: 'Запустить отправку',
      description: 'Начать отправку последовательности 1000-7',
      program: process.execPath,
      iconPath: process.execPath,
      iconIndex: 0
    }
  ])

  registerGlobalHotkeys()
  setupTray(mainWindow, store)
  setupIPCHandlers(mainWindow, store)
}

function saveWindowBounds() {
  if (!mainWindow || mainWindow.isMaximized() || mainWindow.isMinimized()) return
  const bounds = mainWindow.getBounds()
  store.set('windowBounds', bounds)
}

// ─── Hotkeys ────────────────────────────────────────────────
function registerGlobalHotkeys() {
  globalShortcut.unregisterAll()
  const startKey = store.get('startHotkey')
  const stopKey = store.get('stopHotkey')
  try { globalShortcut.register(startKey, () => mainWindow?.webContents.send('global-hotkey', 'start')) } catch { }
  try { globalShortcut.register(stopKey, () => mainWindow?.webContents.send('global-hotkey', 'stop')) } catch { }
}

// ─── IPC Handlers ───────────────────────────────────────────
ipcMain.handle('window-close', () => {
  if (store.get('minimizeToTray')) {
    mainWindow?.hide()
  } else {
    (app as any).isQuitting = true
    app.quit()
  }
})

ipcMain.handle('window-minimize', () => mainWindow?.minimize())

ipcMain.handle('window-maximize', () => {
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize()
})

ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized() ?? false)

ipcMain.handle('reload-hotkeys', () => { registerGlobalHotkeys(); return true })

ipcMain.handle('get-hotkeys', () => ({
  start: store.get('startHotkey'),
  stop: store.get('stopHotkey')
}))

ipcMain.handle('save-hotkey', (_, type: 'start' | 'stop', key: string) => {
  store.set(type === 'start' ? 'startHotkey' : 'stopHotkey', key)
  registerGlobalHotkeys()
  return true
})

ipcMain.handle('get-settings', () => ({
  theme: store.get('theme'),
  syncThemeWithOS: store.get('syncThemeWithOS'),
  animations: store.get('animations'),
  uiScale: store.get('uiScale'),
  autoStart: store.get('autoStart'),
  minimizeToTray: store.get('minimizeToTray')
}))

ipcMain.handle('set-setting', (_, key: string, value: any) => {
  store.set(key as any, value)
  if (key === 'theme' || key === 'syncThemeWithOS') applyTheme()
  if (key === 'autoStart') app.setLoginItemSettings({ openAtLogin: !!value })
  return true
})

ipcMain.handle('reset-settings', () => {
  store.clear()
  registerGlobalHotkeys()
  applyTheme()
  return true
})

ipcMain.handle('get-duration', () => store.get('totalDuration') || 25)

ipcMain.handle('set-duration', (_, seconds: number) => {
  store.set('totalDuration', Math.max(25, seconds))
  return true
})

ipcMain.handle('get-auto-start', () => app.getLoginItemSettings().openAtLogin)

ipcMain.handle('set-auto-start', (_, enable: boolean) => {
  app.setLoginItemSettings({ openAtLogin: enable })
  store.set('autoStart', enable)
  return true
})

ipcMain.handle('show-notification', (_, { title, body }: { title: string; body: string }) => {
  new Notification({ title, body }).show()
  return true
})

ipcMain.handle('set-progress-bar', (_, progress: number) => {
  if (progress < 0) {
    mainWindow?.setProgressBar(-1)
  } else {
    mainWindow?.setProgressBar(Math.min(1, Math.max(0, progress)))
  }
  return true
})

// ─── App Events ─────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow()
  nativeTheme.on('updated', applyTheme)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('before-quit', () => {
  (app as any).isQuitting = true
  globalShortcut.unregisterAll()
})

app.on('open-url', (event, url) => {
  event.preventDefault()
  handleDeepLink(url)
})
