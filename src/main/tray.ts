import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import Store from 'electron-store'

let tray: Tray | null = null

export function setupTray(mainWindow: BrowserWindow, _store: Store) {
  const iconPath = path.join(__dirname, '../../public/icon.png')
  let trayIcon: nativeImage

  try {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 32, height: 32 })
    if (trayIcon.isEmpty()) {
      trayIcon = createTrayIcon(32)
    }
  } catch {
    trayIcon = createTrayIcon(32)
  }

  tray = new Tray(trayIcon)
  tray.setToolTip('Auto Sender — 1000-7')
  tray.setIgnoreDoubleClickEvents(false)

  updateMenu(mainWindow)

  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  return tray
}

function updateMenu(win: BrowserWindow) {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Показать',
      click: () => { win.show(); win.focus() }
    },
    {
      label: 'Скрыть',
      click: () => win.hide()
    },
    { type: 'separator' },
    {
      label: 'Выход',
      click: () => {
        (app as any).isQuitting = true
        app.quit()
      }
    }
  ])
  tray?.setContextMenu(contextMenu)
}

function createTrayIcon(size: number): nativeImage {
  const canvas = size
  const bytesPerPixel = 4
  const stride = canvas * bytesPerPixel
  const buffer = Buffer.alloc(canvas * stride)

  for (let y = 0; y < canvas; y++) {
    for (let x = 0; x < canvas; x++) {
      const offset = y * stride + x * bytesPerPixel
      const cx = x - canvas / 2
      const cy = y - canvas / 2
      const dist = Math.sqrt(cx * cx + cy * cy)
      const maxDist = canvas / 2 - 1

      if (dist < maxDist) {
        buffer[offset] = 255      // R
        buffer[offset + 1] = 45   // G
        buffer[offset + 2] = 85   // B
        buffer[offset + 3] = 255  // A
      } else if (dist < maxDist + 1) {
        buffer[offset] = 255
        buffer[offset + 1] = 45
        buffer[offset + 2] = 85
        buffer[offset + 3] = 128
      } else {
        buffer[offset] = 0
        buffer[offset + 1] = 0
        buffer[offset + 2] = 0
        buffer[offset + 3] = 0
      }
    }
  }

  return nativeImage.createFromBuffer(buffer, { width: size, height: size })
}
