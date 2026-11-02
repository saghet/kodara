// ═══════════════════════════════════════════════════════════════
// KODARA TEST SUITE: System Runtime Engine & OSAdapter (Fase 4)
// "Your Code. Your AI. Your Rules."
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import { resolve } from 'path';
import {
  SystemRuntimeEngine,
  SecurityAuthorizer,
  LinuxAdapter,
  WindowsAdapter,
} from '../index.js';

describe('SystemRuntimeEngine & OS Adapters (Fase 4)', () => {
  const runtime = SystemRuntimeEngine.getInstance();
  const workspaceDir = resolve(process.cwd());

  it('1. Inicializa el adaptador correspondiente a la plataforma anfitriona', () => {
    const adapter = runtime.getAdapter();
    expect(adapter).toBeDefined();

    if (process.platform === 'linux') {
      expect(adapter instanceof LinuxAdapter).toBe(true);
      expect(adapter.platform).toBe('linux');
    } else if (process.platform === 'win32') {
      expect(adapter instanceof WindowsAdapter).toBe(true);
      expect(adapter.platform).toBe('win32');
    }
  });

  it('2. Inspecciona el entorno del sistema operativo (arquitectura, shells, herramientas)', async () => {
    const inspection = await runtime.getInspection();
    expect(inspection.platform).toBe(process.platform as any);
    expect(inspection.architecture).toBe(process.arch);
    expect(inspection.availableShells.length).toBeGreaterThan(0);
    expect(typeof inspection.uptimeSeconds).toBe('number');
    expect(inspection.installedTools).toBeDefined();
    expect(inspection.installedTools['git']).toBe(true);
    expect(inspection.installedTools['bun']).toBe(true);
  });

  it('3. SecurityAuthorizer: Permite comandos legítimos dentro de la frontera del workspace', () => {
    const decision = SecurityAuthorizer.authorize({
      command: 'bun test',
      workspaceDir,
      executionMode: 'turbo',
    });

    expect(decision.allowed).toBe(true);
    expect(decision.requiresConfirmation).toBe(false);
  });

  it('4. SecurityAuthorizer: Bloquea comandos catastróficos destructivos (rm -rf /, forkbomb, mkfs)', () => {
    const rmDecision = SecurityAuthorizer.authorize({
      command: 'rm -rf / --no-preserve-root',
      workspaceDir,
      executionMode: 'turbo',
    });
    expect(rmDecision.allowed).toBe(false);
    expect(rmDecision.reason).toContain('patrón catastrófico');

    const forkbombDecision = SecurityAuthorizer.authorize({
      command: ':(){ :|:& };:',
      workspaceDir,
      executionMode: 'turbo',
    });
    expect(forkbombDecision.allowed).toBe(false);

    const mkfsDecision = SecurityAuthorizer.authorize({
      command: 'mkfs.ext4 /dev/sda1',
      workspaceDir,
      executionMode: 'turbo',
    });
    expect(mkfsDecision.allowed).toBe(false);
  });

  it('5. SecurityAuthorizer: Bloquea violaciones de frontera Zero-Bleed (Path Traversal fuera del workspace)', () => {
    const traversalDecision = SecurityAuthorizer.authorize({
      command: 'ls',
      cwd: '../../../../etc',
      workspaceDir,
      executionMode: 'turbo',
    });

    expect(traversalDecision.allowed).toBe(false);
    expect(traversalDecision.reason).toContain('Violación Zero-Bleed');
  });

  it('6. SecurityAuthorizer: Requiere confirmación para comandos sensibles en modo supervisado', () => {
    const sudoDecision = SecurityAuthorizer.authorize({
      command: 'sudo systemctl restart nginx',
      workspaceDir,
      executionMode: 'supervised',
    });

    expect(sudoDecision.allowed).toBe(true);
    expect(sudoDecision.requiresConfirmation).toBe(true);
    expect(sudoDecision.reason).toContain('requiere confirmación');
  });

  it('7. Ejecuta comandos de forma asíncrona sin bloquear el Event Loop', async () => {
    const result = await runtime.executeCommandSafe({
      command: 'echo "KODARA_RUNTIME_OK"',
      workspaceDir,
      timeoutMs: 5000,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('KODARA_RUNTIME_OK');
    expect(result.timedOut).toBe(false);
    expect(result.killed).toBe(false);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('8. Maneja adecuadamente timeouts de comandos de larga duración', async () => {
    const result = await runtime.executeCommandSafe({
      command: 'sleep 3',
      workspaceDir,
      timeoutMs: 150, // Timeout intencionalmente corto
    });

    expect(result.timedOut).toBe(true);
    expect(result.killed).toBe(true);
  });

  it('9. Soporta cancelación reactiva de procesos mediante AbortSignal', async () => {
    const controller = new AbortController();

    setTimeout(() => {
      controller.abort();
    }, 100);

    const result = await runtime.executeCommandSafe({
      command: 'sleep 4',
      workspaceDir,
      signal: controller.signal,
      timeoutMs: 5000,
    });

    expect(result.killed).toBe(true);
  });

  it('10. Inspecciona procesos activos y servicios del sistema operativo', async () => {
    const processes = await runtime.listProcesses();
    expect(Array.isArray(processes)).toBe(true);
    expect(processes.length).toBeGreaterThan(0);

    const isBunInstalled = await runtime.isToolInstalled('bun');
    expect(isBunInstalled).toBe(true);

    if (process.platform === 'linux') {
      const service = await runtime.checkService('open-antigravity.service');
      expect(service.name).toBe('open-antigravity.service');
      expect(service.running).toBe(true);
      expect(service.active).toBe(true);
    }
  });
});
