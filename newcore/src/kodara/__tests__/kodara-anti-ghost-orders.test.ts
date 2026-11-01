import { describe, it, expect, beforeEach } from 'bun:test';
import { KodaraOrderCompiler } from '../order-compiler';
import { KodaraPlanExecutor } from '../plan-executor';
import fs from 'fs';
import path from 'path';

describe('§33: Verificación Definitiva Anti-Órdenes Fantasma y Erradicación de SamuLibre', () => {
  const dashboardPath = path.resolve(__dirname, '../../web/dashboard.html');
  const serverPath = path.resolve(__dirname, '../../server.ts');
  const compilerPath = path.resolve(__dirname, '../order-compiler.ts');
  const executorPath = path.resolve(__dirname, '../plan-executor.ts');

  it('1. Debe certificar que dashboard.html no contiene botones de entrenamiento ni ranura por defecto de planes', () => {
    const html = fs.readFileSync(dashboardPath, 'utf8');
    expect(html).not.toContain('id="defaultExecutablePlanSlot"');
    expect(html).not.toContain('loadInitialExecutablePlans()');
    expect(html).not.toContain('🎒 Cimientos Escolares');
    expect(html).not.toContain('🎓 Academia Ciberseguridad');
    expect(html).not.toContain('⚡ Programación Antigravity');
    expect(html).not.toContain('🔧 Auto-Repair Sandbox');
    expect(html).not.toContain('🛡️ SAST Semgrep');
    expect(html).not.toContain('🔍 Nmap Directo');
    expect(html).not.toContain('📋 Generar Plan Ejecutable');
  });

  it('2. Debe certificar que server.ts no posee fallbacks forzados a conv_samu_1 o SamulibreLinux', () => {
    const serverCode = fs.readFileSync(serverPath, 'utf8');
    expect(serverCode).not.toContain("req.params.id || 'conv_samu_1'");
    expect(serverCode).not.toContain("req.body?.conversationId || 'conv_samu_1'");
    expect(serverCode).not.toContain("req.body?.projectPath || '/home/saghet/Documents/SamulibreLinux'");
  });

  it('3. Debe certificar que plan-executor.ts no auto-siembra el plan de SamuLibre en init()', () => {
    const executorCode = fs.readFileSync(executorPath, 'utf8');
    expect(executorCode).not.toContain('seedDefaultExecutablePlan');
    expect(executorCode).not.toContain("conversationId: string = 'conv_samu_1'");
    expect(executorCode).not.toContain('SELECT * FROM kodara_executable_plans ORDER BY created_at DESC LIMIT 1');
  });

  it('4. Debe compilar órdenes neutralmente sin forzar ORD-COMPILE-SOFTWARE de SamuLibre para proyectos genéricos', async () => {
    const compiled = await KodaraOrderCompiler.compileFromConversation({
      conversationId: 'conv_test_clean_workspace',
      projectPath: '/home/saghet/Documents/MiProyectoLimpio',
      clientHistory: [
        { role: 'user', content: 'Crea una función de cálculo de hash en typescript' }
      ]
    });

    const hasSamuCompile = compiled.orders.some(o => o.id === 'ORD-COMPILE-SOFTWARE' && o.target.includes('samulibre'));
    const hasSamuRestart = compiled.orders.some(o => o.id === 'ORD-RESTART-APP' && o.target.includes('samulibre'));
    expect(hasSamuCompile).toBe(false);
    expect(hasSamuRestart).toBe(false);

    const restartRes = KodaraOrderCompiler.executeApplicationRestart(compiled);
    expect(restartRes.order_id).toBe('ORD-NO-RESTART');
    expect(restartRes.summary).toContain('No se requirió reinicio de aplicación');
  });

  it('5. Debe validar que auditExecutionCompliance no falla ni exige samulibre-gui en proyectos limpios', async () => {
    const compiled = await KodaraOrderCompiler.compileFromConversation({
      conversationId: 'conv_audit_clean',
      projectPath: '/home/saghet/Documents/wifi',
      clientHistory: [
        { role: 'user', content: 'Optimiza la conexión de red' }
      ]
    });

    const audit = KodaraOrderCompiler.auditExecutionCompliance(compiled);
    expect(audit.all_verified).toBe(true);
    const hasGhostSamuCheck = audit.checks.some(c => c.evidence.includes('samulibre-gui') && !c.passed);
    expect(hasGhostSamuCheck).toBe(false);
  });
});
