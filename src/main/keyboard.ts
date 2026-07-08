import { spawn } from 'child_process'

let psProcess: ReturnType<typeof spawn> | null = null

function getPowerShell(): ReturnType<typeof spawn> {
  if (psProcess && !psProcess.killed) return psProcess

  psProcess = spawn('powershell', [
    '-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', '-'
  ], {
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true
  })

  psProcess.stdin!.write(
    'Add-Type -AssemblyName System.Windows.Forms; ' +
    'function Send-Keys { param($k) [System.Windows.Forms.SendKeys]::SendWait($k) }\r\n'
  )

  psProcess.on('exit', () => { psProcess = null })

  return psProcess
}

function psk(keys: string): void {
  try {
    const ps = getPowerShell()
    const escaped = keys.replace(/'/g, "''")
    ps.stdin!.write(`Send-Keys '${escaped}'\r\n`)
  } catch {
    // ignore
  }
}

function escapeKeys(text: string): string {
  return text
    .replace(/\+/g, '{+}')
    .replace(/\^/g, '{^}')
    .replace(/%/g, '{%}')
    .replace(/~/g, '{~}')
    .replace(/\(/g, '{(}')
    .replace(/\)/g, '{)}')
    .replace(/\{/g, '{{}')
    .replace(/\}/g, '{}}')
    .replace(/\[/g, '{[}')
    .replace(/\]/g, '{]}')
}

export function typeAndEnter(text: string): void {
  psk(`${escapeKeys(text)}{ENTER}`)
}

export function typeAndEnterDota(text: string): void {
  try {
    const ps = getPowerShell()
    const escaped = escapeKeys(text).replace(/'/g, "''")
    ps.stdin!.write(
      `Send-Keys '{ENTER}'; Start-Sleep -Milliseconds 45; ` +
      `Send-Keys '${escaped}'; Start-Sleep -Milliseconds 45; Send-Keys '{ENTER}'\r\n`
    )
  } catch {
    // ignore
  }
}

export function killPowerShell(): void {
  if (psProcess && !psProcess.killed) {
    try {
      psProcess.stdin!.end()
      psProcess.kill()
    } catch {
      // ignore
    }
    psProcess = null
  }
}
