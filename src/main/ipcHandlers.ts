import { BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import { typeAndEnter, typeAndEnterDota, killPowerShell } from './keyboard'

let isSending = false
let shouldStop = false

function generateSequence(): string[] {
  const sequence: string[] = []
  for (let i = 1000; i > 0; i -= 7) {
    sequence.push(`${i}-7`)
  }
  return sequence
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function setupIPCHandlers(mainWindow: BrowserWindow | null, store: Store) {
  ipcMain.handle('start-sending', async () => {
    if (isSending) return { success: false, reason: 'already_running' }

    const sequence = generateSequence()
    isSending = true
    shouldStop = false
    const totalSec = Math.max(25, store.get('totalDuration') as number || 25)
    const delay = Math.round((totalSec * 1000) / sequence.length)
    const dotaMode = store.get('dotaMode') as boolean

    mainWindow?.webContents.send('status-update', 'running', 'ОТПРАВКА...')

    const sendFn = dotaMode ? typeAndEnterDota : typeAndEnter

    for (let i = 0; i < sequence.length && !shouldStop; i++) {
      const text = sequence[i]

      sendFn(text)
      mainWindow?.webContents.send('number-update', text)
      mainWindow?.webContents.send('counter-update', i + 1, sequence.length)
      await sleep(delay)
    }

    isSending = false
    killPowerShell()

    if (shouldStop) {
      mainWindow?.webContents.send('status-update', 'stopped', 'ОСТАНОВЛЕНО')
    } else {
      mainWindow?.webContents.send('status-update', 'done', 'ЗАВЕРШЕНО')
      mainWindow?.webContents.send('counter-update', sequence.length, sequence.length)
    }

    return { success: true }
  })

  ipcMain.handle('stop-sending', async () => {
    if (isSending) {
      shouldStop = true
      killPowerShell()
      return { success: true }
    }
    return { success: false, reason: 'not_running' }
  })
}
