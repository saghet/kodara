import { describe, it, expect, beforeEach } from 'bun:test';
import { KodaraCore, CoreEventHub, CoreSessionManager, CoreSecurityGuard, CoreCheckpointer } from '../index';
import fs from 'fs';
import path from 'path';

describe('§37: Kodara Core v1 — Arquitectura Modular y Separación de Responsabilidades (Fase 2)', () => {
  const testWorkspace = '/tmp/kodara_core_test_ws';

  beforeEach(() => {
    if (!fs.existsSync(testWorkspace)) {
      fs.mkdirSync(testWorkspace, { recursive: true });
    }
  });

  it('1. Debe inicializar KodaraCore como singleton coordinando eventos, sesiones, seguridad y checkpoints', () => {
    const core1 = KodaraCore.getInstance();
    const core2 = KodaraCore.getInstance();

    expect(core1).toBe(core2);
    expect(core1.events).toBeDefined();
    expect(core1.sessions).toBeDefined();
    expect(core1.security).toBeDefined();
    expect(core1.checkpointer).toBeDefined();
  });

  it('2. CoreEventHub: Debe registrar eventos tipados, soportar suscripciones pub/sub y formatear SSE', () => {
    const hub = CoreEventHub.getInstance();
    let receivedPayload: any = null;

    const unsubscribe = hub.on('PLAN_PHASE_PROGRESS', (ev) => {
      receivedPayload = ev.payload;
    });

    const emitted = hub.emit('PLAN_PHASE_PROGRESS', { percent: 45, phase: 2 }, { source: 'test-runner' });
    expect(receivedPayload).toEqual({ percent: 45, phase: 2 });
    expect(emitted.type).toBe('PLAN_PHASE_PROGRESS');

    const sseOutput = hub.formatSSE(emitted);
    expect(sseOutput).toContain('data: {"eventId":');
    expect(sseOutput).toContain('"type":"PLAN_PHASE_PROGRESS"');

    unsubscribe();
  });

  it('3. CoreSecurityGuard: Debe proteger fronteras de workspace (Zero-Bleed) y bloquear path traversal', () => {
    const validPath = path.join(testWorkspace, 'src/main.ts');
    const traversalPath = path.join(testWorkspace, '../../etc/passwd');

    // Dentro del workspace debe ser permitido y canonicalizado
    const resolved = CoreSecurityGuard.assertPathInsideWorkspace(testWorkspace, validPath);
    expect(resolved).toBe(path.resolve(validPath));

    // Fuera del workspace debe ser bloqueado con excepción Zero-Bleed
    expect(() => {
      CoreSecurityGuard.assertPathInsideWorkspace(testWorkspace, traversalPath);
    }).toThrow('[SECURITY ZERO-BLEED]');
  });

  it('4. CoreSecurityGuard: Debe prohibir comandos catastróficos y requerir confirmación en modo supervisado', () => {
    // Comandos destructivos prohibidos
    const rmRfAuth = CoreSecurityGuard.authorizeCommand('rm -rf /', 'turbo');
    expect(rmRfAuth.allowed).toBe(false);
    expect(rmRfAuth.reason).toContain('prohibido');

    // Comandos sensibles en modo supervisado
    const sudoAuth = CoreSecurityGuard.authorizeCommand('sudo systemctl restart nginx', 'supervised');
    expect(sudoAuth.allowed).toBe(true);
    expect(sudoAuth.requiresConfirmation).toBe(true);

    // Comandos seguros en modo turbo
    const buildAuth = CoreSecurityGuard.authorizeCommand('cargo build --release', 'turbo');
    expect(buildAuth.allowed).toBe(true);
    expect(buildAuth.requiresConfirmation).toBe(false);
  });

  it('5. CoreSessionManager: Debe gestionar sesiones activas desacopladas del protocolo HTTP', async () => {
    const sessionMgr = CoreSessionManager.getInstance();

    const session = await sessionMgr.getOrCreateSession({
      sessionId: 'sess_unit_test_01',
      projectName: 'TestProject',
      workspaceDir: testWorkspace,
      executionMode: 'turbo',
      activeModel: 'deepseek-r1',
    });

    expect(session.sessionId).toBe('sess_unit_test_01');
    expect(session.projectName).toBe('TestProject');
    expect(session.executionMode).toBe('turbo');

    const retrieved = sessionMgr.getSession('sess_unit_test_01');
    expect(retrieved).toBeDefined();
    expect(retrieved?.workspaceDir).toBe(testWorkspace);

    const closed = sessionMgr.closeSession('sess_unit_test_01');
    expect(closed).toBe(true);
    expect(sessionMgr.getSession('sess_unit_test_01')).toBeUndefined();
  });

  it('6. CoreCheckpointer: Debe capturar snapshots de archivos y realizar rollback exacto ante fallos', () => {
    const checkpointer = CoreCheckpointer.getInstance();
    const testFile = path.join(testWorkspace, 'test_module.ts');

    fs.writeFileSync(testFile, 'export const version = "1.0.0";', 'utf-8');

    // 1. Crear checkpoint
    const ckp = checkpointer.createCheckpoint('Pre-mutación v2', [testFile]);
    expect(ckp.checkpointId).toBeDefined();

    // 2. Aplicar cambio que rompe el código
    fs.writeFileSync(testFile, 'export const version = "CORRUPTED";', 'utf-8');
    expect(fs.readFileSync(testFile, 'utf-8')).toBe('export const version = "CORRUPTED";');

    // 3. Revertir mediante rollback
    const restored = checkpointer.rollbackCheckpoint(ckp.checkpointId);
    expect(restored).toBe(true);
    expect(fs.readFileSync(testFile, 'utf-8')).toBe('export const version = "1.0.0";');
  });
});
