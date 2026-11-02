// ═══════════════════════════════════════════════════════════════
// KODARA SYSTEM RUNTIME ENGINE: Central Facade & Dispatcher
// "Your Code. Your AI. Your Rules."
// Administra la interacción con el SO (Linux / Windows) bajo
// autorización centralizada estricta y ejecución no bloqueante.
// ═══════════════════════════════════════════════════════════════

import {
  OSAdapter,
  EnvironmentInspection,
  CommandExecutionOptions,
  CommandExecutionResult,
  ProcessInfo,
  ServiceStatus,
} from './os-adapter.interface.js';
import { LinuxAdapter } from './adapters/linux.adapter.js';
import { WindowsAdapter } from './adapters/windows.adapter.js';
import { SecurityAuthorizer, AuthorizationRequest } from './security-authorizer.js';

export class SystemRuntimeEngine {
  private static instance: SystemRuntimeEngine;
  private readonly adapter: OSAdapter;

  private constructor() {
    if (process.platform === 'win32') {
      this.adapter = new WindowsAdapter();
    } else {
      this.adapter = new LinuxAdapter();
    }
  }

  public static getInstance(): SystemRuntimeEngine {
    if (!SystemRuntimeEngine.instance) {
      SystemRuntimeEngine.instance = new SystemRuntimeEngine();
    }
    return SystemRuntimeEngine.instance;
  }

  public getAdapter(): OSAdapter {
    return this.adapter;
  }

  public async getInspection(): Promise<EnvironmentInspection> {
    return await this.adapter.inspect();
  }

  /**
   * Ejecuta un comando en el sistema operativo pasando estrictamente
   * por el filtro de seguridad central, validando límites de workspace y
   * garantizando asincronismo sin bloquear el Event Loop.
   */
  public async executeCommandSafe(
    options: AuthorizationRequest & CommandExecutionOptions
  ): Promise<CommandExecutionResult> {
    const start = Date.now();

    // 1. Autorización central de seguridad
    const authDecision = SecurityAuthorizer.authorize(options);
    if (!authDecision.allowed) {
      return {
        command: options.command,
        exitCode: 126, // Command invoked cannot execute
        stdout: '',
        stderr: `[SecurityAuthorizer] Comando bloqueado: ${authDecision.reason}`,
        durationMs: Date.now() - start,
        timedOut: false,
        killed: true,
      };
    }

    if (authDecision.requiresConfirmation) {
      return {
        command: options.command,
        exitCode: 1,
        stdout: '',
        stderr: `[SecurityAuthorizer] Operación sensible suspendida en modo supervisado: requiere confirmación.`,
        durationMs: Date.now() - start,
        timedOut: false,
        killed: false,
      };
    }

    // 2. Ejecución asíncrona delegada al adaptador de la plataforma
    return await this.adapter.execute({
      ...options,
      command: authDecision.sanitizedCommand,
      cwd: authDecision.effectiveCwd,
    });
  }

  public async listProcesses(filter?: string): Promise<ProcessInfo[]> {
    return await this.adapter.listProcesses(filter);
  }

  public async checkService(serviceName: string): Promise<ServiceStatus> {
    return await this.adapter.getServiceStatus(serviceName);
  }

  public async isToolInstalled(toolBinary: string): Promise<boolean> {
    return await this.adapter.isToolInstalled(toolBinary);
  }

  public async killProcess(pid: number, signal?: 'SIGTERM' | 'SIGKILL' | 'SIGINT'): Promise<boolean> {
    return await this.adapter.killProcess(pid, signal);
  }
}
