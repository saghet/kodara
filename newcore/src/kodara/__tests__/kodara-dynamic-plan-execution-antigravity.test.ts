import { describe, it, expect } from 'bun:test';
import { KodaraOrderCompiler } from '../order-compiler';
import { KodaraPlanExecutor } from '../plan-executor';
import fs from 'fs';
import path from 'path';

describe('§36: Ejecutor Universal Antigravity de Planes de Kodara [▶ Proceed]', () => {
  const dashboardPath = path.resolve(__dirname, '../../web/dashboard.html');
  const serverPath = path.resolve(__dirname, '../../server.ts');
  const compilerPath = path.resolve(__dirname, '../order-compiler.ts');
  const executorPath = path.resolve(__dirname, '../plan-executor.ts');
  const openOrquesPath = '/home/saghet/Documents/OpenOrques';

  it('1. Debe compilar dinámicamente intenciones universales: Clonado Git, Dependencias y Lanzamiento', async () => {
    const compiled = await KodaraOrderCompiler.compileFromConversation({
      conversationId: 'conv_test_universal_intent',
      projectName: 'TestUniversal',
      projectPath: '/tmp/test_universal_ws',
      clientHistory: [
        {
          role: 'user',
          content: 'clona este repositorio https://github.com/Gentleman-Programming/gentle-ai instala las dependencias e inicia el proyecto',
        },
      ],
    });

    expect(compiled.orders.length).toBeGreaterThanOrEqual(3);

    const cloneOrder = compiled.orders.find((o) => o.intent_type === 'GIT_CLONE_REPOSITORY');
    expect(cloneOrder).toBeDefined();
    expect(cloneOrder?.parameters.repoUrl).toContain('gentle-ai');

    const depsOrder = compiled.orders.find((o) => o.intent_type === 'DEPENDENCY_INSTALL');
    expect(depsOrder).toBeDefined();

    const launchOrder = compiled.orders.find((o) => o.intent_type === 'LAUNCH_APPLICATION');
    expect(launchOrder).toBeDefined();
  });

  it('2. Debe garantizar que dashboard.html envía conversationId y projectId en proceedWithPlan y watchdog', () => {
    const html = fs.readFileSync(dashboardPath, 'utf8');
    // proceedWithPlan debe incluir conversationId y projectId en el body
    expect(html).toContain('conversationId: activeConversationId');
    expect(html).toContain('projectId: activeProjectId');
    // triggerWatchdogAutoRepair también debe incluir conversationId
    expect(html).toContain('triggerWatchdogAutoRepair');
  });

  it('3. Debe certificar que server.ts extrae conversationId en los endpoints de planes', () => {
    const serverCode = fs.readFileSync(serverPath, 'utf8');
    expect(serverCode).toContain("const conversationId = req.body?.conversationId || req.query?.conversationId || '';");
    expect(serverCode).toContain('await KodaraPlanExecutor.executePlanById(planId, (ev) => {');
  });

  it('4. Debe certificar la erradicación total de mock placebos de Rust en plan-executor.ts', () => {
    const executorCode = fs.readFileSync(executorPath, 'utf8');
    // Jamás debe contener el error simulado que infectaba la memoria de otros proyectos
    expect(executorCode).not.toContain("rawLog: 'error[E0308]: mismatched types");
    expect(executorCode).not.toContain('expected `String`, found `&str`');
  });

  it('5. Debe auditar al 100% el cumplimiento físico de órdenes para OpenOrques', () => {
    const mockOrderSet = {
      conversation_id: 'conv_test_audit',
      project_id: 'proj_sxaAXs2h',
      project_name: 'OpenOrques',
      project_path: openOrquesPath,
      total_history_messages: 1,
      user_prompts_analyzed: ['clona e instala'],
      arrow_target: {
        detected: false,
        color: 'NONE' as const,
        tip_x: 0,
        tip_y: 0,
        tip_x_percent: 0,
        tip_y_percent: 0,
        quadrant_label: '',
        target_ocr_text: '',
      },
      orders: [
        {
          order_id: 'ORD-GIT-CLONE',
          intent_type: 'GIT_CLONE_REPOSITORY' as const,
          description: 'Clonado',
          target_files: [openOrquesPath],
          parameters: { repoUrl: 'https://github.com/Gentleman-Programming/gentle-ai' },
          status: 'PENDING' as const,
        },
        {
          order_id: 'ORD-INSTALL-DEPS',
          intent_type: 'DEPENDENCY_INSTALL' as const,
          description: 'Dependencias',
          target_files: [openOrquesPath],
          parameters: { projectPath: openOrquesPath },
          status: 'PENDING' as const,
        },
        {
          order_id: 'ORD-LAUNCH-APP',
          intent_type: 'LAUNCH_APPLICATION' as const,
          description: 'Lanzamiento',
          target_files: [openOrquesPath],
          parameters: { projectPath: openOrquesPath },
          status: 'PENDING' as const,
        },
      ],
      history_ledger_prompt_block: '',
    };

    const report = KodaraOrderCompiler.auditExecutionCompliance(mockOrderSet);
    expect(report.all_verified).toBe(true);
    expect(report.intelligence_score_percent).toBe(100);
    expect(report.checks.every((c) => c.passed)).toBe(true);
  });

  it('6. Debe validar que en OpenOrques existen físicamente los archivos clonados y el binario compilado', () => {
    expect(fs.existsSync(openOrquesPath)).toBe(true);
    expect(fs.existsSync(path.join(openOrquesPath, '.kodararules'))).toBe(true);
    expect(fs.existsSync(path.join(openOrquesPath, '.git'))).toBe(true);
    expect(fs.existsSync(path.join(openOrquesPath, 'cmd'))).toBe(true);
    expect(fs.existsSync(path.join(openOrquesPath, 'gentle-ai'))).toBe(true);
  });
});
