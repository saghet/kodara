// ═══════════════════════════════════════════════════════════════
// KODARA SYSTEM RUNTIME ENGINE: Linux OS Adapter
// "Your Code. Your AI. Your Rules."
// Implementación nativa para entornos Linux (Bash, systemd, /proc).
// ═══════════════════════════════════════════════════════════════

import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
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

export class LinuxAdapter implements OSAdapter {
  public readonly platform: OSPlatform = 'linux';
  public readonly name = 'Linux Native Runtime (Bash / systemd / procfs)';

  public async inspect(): Promise<EnvironmentInspection> {
    const isWsl = this.checkWsl();
    const availableShells: ShellType[] = [];

    if (existsSync('/bin/bash') || existsSync('/usr/bin/bash')) {
      availableShells.push('bash');
    }
    if (existsSync('/bin/sh')) {
      availableShells.push('sh');
    }

    const commonTools = ['git', 'docker', 'cargo', 'bun', 'node', 'python3', 'systemctl', 'curl'];
    const installedTools: Record<string, boolean> = {};

    for (const tool of commonTools) {
      installedTools[tool] = await this.isToolInstalled(tool);
    }

    const isElevated = typeof process.getuid === 'function' ? process.getuid() === 0 : false;

    return {
      platform: 'linux',
      architecture: process.arch,
      osRelease: release(),
      hostname: hostname(),
      availableShells,
      defaultShell: availableShells.includes('bash') ? 'bash' : 'sh',
      installedTools,
      isElevated,
      wslAvailable: isWsl,
      pathEnv: process.env.PATH || '',
      uptimeSeconds: uptime(),
    };
  }

  public async execute(options: CommandExecutionOptions): Promise<CommandExecutionResult> {
    const start = Date.now();
    const timeoutMs = options.timeoutMs ?? 60000;
    const cwd = options.cwd || process.cwd();
    const shellBin = options.shell === 'sh' ? '/bin/sh' : '/bin/bash';

    return new Promise<CommandExecutionResult>((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let killed = false;

      const child = spawn(shellBin, ['-c', options.command], {
        cwd,
        env: { ...process.env, ...options.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Manejo de Timeout
      const timer = setTimeout(() => {
        timedOut = true;
        killed = true;
        child.kill('SIGTERM');
        setTimeout(() => {
          if (!child.killed) child.kill('SIGKILL');
        }, 1000);
      }, timeoutMs);

      // Manejo de AbortSignal
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          killed = true;
          child.kill('SIGTERM');
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
          exitCode: code ?? (killed ? 130 : 1),
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

  public async killProcess(pid: number, signal: 'SIGTERM' | 'SIGKILL' | 'SIGINT' = 'SIGTERM'): Promise<boolean> {
    try {
      process.kill(pid, signal);
      return true;
    } catch {
      return false;
    }
  }

  public async listProcesses(filter?: string): Promise<ProcessInfo[]> {
    try {
      const res = await this.execute({
        command: 'ps -eo pid,comm,%cpu,rss --no-headers --sort=-%cpu | head -n 40',
        timeoutMs: 3000,
      });

      if (res.exitCode !== 0) return [];

      const lines = res.stdout.trim().split('\n');
      const processes: ProcessInfo[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const parts = trimmed.split(/\s+/);
        if (parts.length < 4) continue;

        const pid = parseInt(parts[0], 10);
        const name = parts[1];
        const cpuPercent = parseFloat(parts[2]);
        const memoryMb = Math.round(parseInt(parts[3], 10) / 1024);

        if (filter && !name.toLowerCase().includes(filter.toLowerCase())) {
          continue;
        }

        processes.push({ pid, name, cpuPercent, memoryMb });
      }

      return processes;
    } catch {
      return [];
    }
  }

  public async getServiceStatus(serviceName: string): Promise<ServiceStatus> {
    try {
      // 1. Probar servicio del sistema
      let res = await this.execute({
        command: `systemctl is-active ${serviceName}`,
        timeoutMs: 2000,
      });

      let isActive = res.stdout.trim() === 'active';

      // 2. Probar como servicio de usuario (--user) si no está activo a nivel de sistema
      if (!isActive) {
        const userRes = await this.execute({
          command: `systemctl --user is-active ${serviceName}`,
          timeoutMs: 2000,
        });
        if (userRes.stdout.trim() === 'active') {
          isActive = true;
        }
      }

      const enabledRes = await this.execute({
        command: `systemctl is-enabled ${serviceName} || systemctl --user is-enabled ${serviceName}`,
        timeoutMs: 2000,
      });
      const isEnabled = enabledRes.stdout.trim() === 'enabled';

      return {
        name: serviceName,
        exists: isActive || isEnabled || res.exitCode === 0,
        active: isActive,
        running: isActive,
        enabled: isEnabled,
        statusDescription: isActive ? 'active (running)' : 'inactive / stopped',
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
        command: `command -v ${toolBinary}`,
        timeoutMs: 1500,
      });
      return res.exitCode === 0 && res.stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  private checkWsl(): boolean {
    if (existsSync('/proc/version')) {
      try {
        const version = readFileSync('/proc/version', 'utf-8').toLowerCase();
        return version.includes('microsoft') || version.includes('wsl');
      } catch {
        return false;
      }
    }
    return false;
  }
}
