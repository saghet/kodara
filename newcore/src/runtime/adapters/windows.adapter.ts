// ═══════════════════════════════════════════════════════════════
// KODARA SYSTEM RUNTIME ENGINE: Windows OS Adapter
// "Your Code. Your AI. Your Rules."
// Implementación nativa para Windows (PowerShell, CMD, WSL).
// ═══════════════════════════════════════════════════════════════

import { spawn } from 'child_process';
import { release, hostname, uptime } from 'os';
import {
  OSAdapter,
  OSPlatform,
  EnvironmentInspection,
  CommandExecutionOptions,
  CommandExecutionResult,
  ProcessInfo,
  ServiceStatus,
  ShellType,
} from '../os-adapter.interface.js';

export class WindowsAdapter implements OSAdapter {
  public readonly platform: OSPlatform = 'win32';
  public readonly name = 'Windows Native Runtime (PowerShell / CMD / WSL)';

  public async inspect(): Promise<EnvironmentInspection> {
    const availableShells: ShellType[] = ['powershell', 'cmd'];
    const wslAvailable = await this.isToolInstalled('wsl');
    if (wslAvailable) {
      availableShells.push('wsl');
    }

    const commonTools = ['git', 'docker', 'cargo', 'bun', 'node', 'python', 'powershell', 'cmd'];
    const installedTools: Record<string, boolean> = {};

    for (const tool of commonTools) {
      installedTools[tool] = await this.isToolInstalled(tool);
    }

    const isElevated = await this.checkAdminElevation();

    return {
      platform: 'win32',
      architecture: process.arch,
      osRelease: release(),
      hostname: hostname(),
      availableShells,
      defaultShell: 'powershell',
      installedTools,
      isElevated,
      wslAvailable,
      pathEnv: process.env.PATH || '',
      uptimeSeconds: uptime(),
    };
  }

  public async execute(options: CommandExecutionOptions): Promise<CommandExecutionResult> {
    const start = Date.now();
    const timeoutMs = options.timeoutMs ?? 60000;
    const cwd = options.cwd || process.cwd();

    const isCmd = options.shell === 'cmd';
    const shellBinary = isCmd ? 'cmd.exe' : 'powershell.exe';
    const shellArgs = isCmd
      ? ['/d', '/s', '/c', options.command]
      : ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', options.command];

    return new Promise<CommandExecutionResult>((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let killed = false;

      const child = spawn(shellBinary, shellArgs, {
        cwd,
        env: { ...process.env, ...options.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const timer = setTimeout(() => {
        timedOut = true;
        killed = true;
        try {
          spawn('taskkill', ['/F', '/T', '/PID', String(child.pid)]);
        } catch {
          child.kill();
        }
      }, timeoutMs);

      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          killed = true;
          try {
            spawn('taskkill', ['/F', '/T', '/PID', String(child.pid)]);
          } catch {
            child.kill();
          }
        });
      }

      child.stdout.on('data', (data) => {
        const text = data.toString('utf-8');
        stdout += text;
        if (options.onChunk) {
          options.onChunk(text, 'stdout');
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString('utf-8');
        stderr += text;
        if (options.onChunk) {
          options.onChunk(text, 'stderr');
        }
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          command: options.command,
          exitCode: code ?? (killed ? 1 : 0),
          stdout,
          stderr,
          durationMs: Date.now() - start,
          timedOut,
          killed,
        });
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          command: options.command,
          exitCode: 1,
          stdout,
          stderr: `${stderr}\n${err.message}`.trim(),
          durationMs: Date.now() - start,
          timedOut: false,
          killed: true,
        });
      });
    });
  }

  public async killProcess(pid: number): Promise<boolean> {
    try {
      const res = await this.execute({
        command: `taskkill /F /T /PID ${pid}`,
        shell: 'cmd',
        timeoutMs: 3000,
      });
      return res.exitCode === 0;
    } catch {
      return false;
    }
  }

  public async listProcesses(filter?: string): Promise<ProcessInfo[]> {
    try {
      const res = await this.execute({
        command: 'tasklist /FO CSV /NH',
        shell: 'cmd',
        timeoutMs: 4000,
      });

      if (res.exitCode !== 0) return [];

      const lines = res.stdout.trim().split('\n');
      const processes: ProcessInfo[] = [];

      for (const line of lines) {
        const parts = line.split('","').map((s) => s.replace(/^"|"$/g, '').trim());
        if (parts.length < 5) continue;

        const name = parts[0];
        const pid = parseInt(parts[1], 10);
        const memStr = parts[4].replace(/[^\d]/g, '');
        const memoryMb = Math.round(parseInt(memStr, 10) / 1024);

        if (filter && !name.toLowerCase().includes(filter.toLowerCase())) {
          continue;
        }

        processes.push({ pid, name, memoryMb });
      }

      return processes;
    } catch {
      return [];
    }
  }

  public async getServiceStatus(serviceName: string): Promise<ServiceStatus> {
    try {
      const res = await this.execute({
        command: `Get-Service -Name "${serviceName}" -ErrorAction SilentlyContinue | Select-Object -Property Status, StartType | ConvertTo-Json`,
        shell: 'powershell',
        timeoutMs: 3000,
      });

      if (res.exitCode !== 0 || !res.stdout.trim()) {
        return {
          name: serviceName,
          exists: false,
          active: false,
          running: false,
          enabled: false,
          statusDescription: 'service not found',
        };
      }

      const info = JSON.parse(res.stdout.trim());
      const isRunning = info.Status === 4 || info.Status === 'Running';
      const isEnabled = info.StartType !== 4 && info.StartType !== 'Disabled';

      return {
        name: serviceName,
        exists: true,
        active: isRunning,
        running: isRunning,
        enabled: isEnabled,
        statusDescription: isRunning ? 'Running' : 'Stopped',
      };
    } catch {
      return {
        name: serviceName,
        exists: false,
        active: false,
        running: false,
        enabled: false,
        statusDescription: 'unknown',
      };
    }
  }

  public async isToolInstalled(toolBinary: string): Promise<boolean> {
    try {
      const res = await this.execute({
        command: `where.exe ${toolBinary}`,
        shell: 'cmd',
        timeoutMs: 2000,
      });
      return res.exitCode === 0 && res.stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  private async checkAdminElevation(): Promise<boolean> {
    try {
      const res = await this.execute({
        command: 'net session',
        shell: 'cmd',
        timeoutMs: 1500,
      });
      return res.exitCode === 0;
    } catch {
      return false;
    }
  }
}
