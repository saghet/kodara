// ═══════════════════════════════════════════════════════════════
// KODARA SYSTEM RUNTIME ENGINE: OSAdapter Interfaces & Contracts
// "Your Code. Your AI. Your Rules."
// Capa universal multiplataforma para interactuar de forma segura
// con Linux (Bash, systemd, /proc) y Windows (PowerShell, WSL).
// ═══════════════════════════════════════════════════════════════

export type OSPlatform = 'linux' | 'win32' | 'darwin';
export type OSArchitecture = 'x64' | 'arm64' | 'arm' | 'ia32' | string;
export type ShellType = 'bash' | 'sh' | 'powershell' | 'cmd' | 'wsl';

export interface EnvironmentInspection {
  platform: OSPlatform;
  architecture: OSArchitecture;
  osRelease: string;
  hostname: string;
  availableShells: ShellType[];
  defaultShell: ShellType;
  installedTools: Record<string, boolean>; // git, docker, bun, node, cargo, python, etc.
  isElevated: boolean;                    // root en Linux / Admin en Windows
  wslAvailable: boolean;                  // Windows Subsystem for Linux
  pathEnv: string;
  uptimeSeconds: number;
}

export interface CommandExecutionOptions {
  command: string;
  cwd?: string;
  shell?: ShellType;
  timeoutMs?: number;
  env?: Record<string, string>;
  signal?: AbortSignal;
  onChunk?: (chunk: string, streamType: 'stdout' | 'stderr') => void;
}

export interface CommandExecutionResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
  killed: boolean;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpuPercent?: number;
  memoryMb?: number;
  commandLine?: string;
}

export interface ServiceStatus {
  name: string;
  exists: boolean;
  active: boolean;
  running: boolean;
  enabled: boolean;
  statusDescription?: string;
}

export interface OSAdapter {
  readonly platform: OSPlatform;
  readonly name: string;

  /** Inspecciona a fondo el entorno del sistema operativo anfitrión */
  inspect(): Promise<EnvironmentInspection>;

  /** Ejecuta un comando de forma asíncrona sin bloquear el Event Loop */
  execute(options: CommandExecutionOptions): Promise<CommandExecutionResult>;

  /** Termina un proceso por PID de forma segura */
  killProcess(pid: number, signal?: 'SIGTERM' | 'SIGKILL' | 'SIGINT'): Promise<boolean>;

  /** Lista los procesos activos con consumo de recursos */
  listProcesses(filter?: string): Promise<ProcessInfo[]>;

  /** Consulta el estado de un servicio del sistema operativo */
  getServiceStatus(serviceName: string): Promise<ServiceStatus>;

  /** Comprueba si una herramienta o binario CLI está instalado y disponible en PATH */
  isToolInstalled(toolBinary: string): Promise<boolean>;
}
