export const SEQUENCE_START = 1000
export const SEQUENCE_STEP = 7
export const SEQUENCE_END = 0

export const DEFAULT_DELAY_MS = 85
export const ENTER_DELAY_MS = 50

export const DEFAULT_START_HOTKEY = 'F1'
export const DEFAULT_STOP_HOTKEY = 'F2'

export const TOTAL_COUNT = Math.floor((SEQUENCE_START - SEQUENCE_END) / SEQUENCE_STEP)

export const STATUS_LABELS: Record<string, string> = {
  idle: 'ОЖИДАНИЕ',
  running: 'ОТПРАВКА...',
  stopped: 'ОСТАНОВЛЕНО',
  done: 'ЗАВЕРШЕНО'
}
