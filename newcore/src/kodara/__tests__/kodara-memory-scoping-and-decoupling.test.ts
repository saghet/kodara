// ═══════════════════════════════════════════════════════════════
// KODARA TEST SUITE: DEPURACIÓN DE CABINA, DESACOPLAMIENTO Y MEMORIA
// Certificación de:
// 1. Aislamiento Estricto de KodaraProjectMemory (Strict Zero-Bleed)
// 2. Erradicación de Fallbacks Residuales a SamuLibre
// 3. Desacoplamiento de Reinicios Incondicionales en Fase 4
// 4. Cabina Limpia sin Botones de Entrenamiento Obsoletos
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { KodaraProjectMemory } from '../evolution/project-memory.js';
import { KodaraOrderCompiler } from '../order-compiler.js';

describe('🥋 Auditoría de Desacoplamiento de SamuLibre y Persistencia Estricta de Memoria', () => {
  const dashboardHtmlPath = resolve(__dirname, '../../web/dashboard.html');
  const serverTsPath = resolve(__dirname, '../../server.ts');
  const planExecutorTsPath = resolve(__dirname, '../plan-executor.ts');
  const orderCompilerTsPath = resolve(__dirname, '../order-compiler.ts');

  it('1. buildProjectMemoryPromptBlock no filtra lecciones globales si projectId es nulo o vacío', async () => {
    // Si no hay projectId activo, debe devolver estrictamente cadena vacía
    const empty1 = await KodaraProjectMemory.buildProjectMemoryPromptBlock(undefined);
    expect(empty1).toBe('');

    const empty2 = await KodaraProjectMemory.buildProjectMemoryPromptBlock('');
    expect(empty2).toBe('');

    const empty3 = await KodaraProjectMemory.buildProjectMemoryPromptBlock('   ');
    expect(empty3).toBe('');
  });

  it('2. KodaraProjectMemory aísla estrictamente lecciones por projectId', async () => {
    const testProjId = 'proj_isolated_test_' + Date.now();
    await KodaraProjectMemory.recordApplicationLearning({
      projectId: testProjId,
      projectName: 'IsolatedTestProject',
      language: 'typescript',
      errorSignature: 'TYPE_MISMATCH_ISOLATED',
      errorContext: 'Prueba de aislamiento de memoria entre proyectos',
      rootCause: 'Verificación estricta de scoping en SQLite',
      verifiedFix: 'Tipado explícito con ProjectMemoryEntry',
      compileStatus: 'PASS',
      testStatus: 'PASS',
    });

    // Consultar solo para este proyecto
    const promptBlock = await KodaraProjectMemory.buildProjectMemoryPromptBlock(testProjId);
    expect(promptBlock).toContain('TYPE_MISMATCH_ISOLATED');
    expect(promptBlock).toContain('IsolatedTestProject');
    // No debe contener lecciones de otros proyectos dentro del bloque específico
    expect(promptBlock).not.toContain('WiSharkOpen');

    // Consultar para otro proyecto no debe ver las lecciones de testProjId
    const otherPromptBlock = await KodaraProjectMemory.buildProjectMemoryPromptBlock('proj_another_test');
    expect(otherPromptBlock).not.toContain('TYPE_MISMATCH_ISOLATED');
  });

  it('3. executeApplicationRestart es seguro: no reinicia nada si no hay orden explícita o el proyecto es ajeno', () => {
    // Caso A: Sin orden de reinicio
    const resultNoRestart = KodaraOrderCompiler.executeApplicationRestart({
      arrow_target: { detected: false, color: 'NONE', tip_x: 0, tip_y: 0, tip_x_percent: 0, tip_y_percent: 0, quadrant_label: '', target_ocr_text: '' },
      orders: [],
      project_path: '/home/saghet/Documents/WiSharkOpen',
      project_name: 'WiSharkOpen',
      total_history_messages: 1,
    });
    expect(resultNoRestart.order_id).toBe('ORD-NO-RESTART');
    expect(resultNoRestart.success).toBe(true);
    expect(resultNoRestart.summary).toContain('No se requirió reinicio de aplicación');

    // Caso B: Con orden de reinicio pero proyecto ajeno a SamuLibre (ej. Ollama o WiShark)
    const resultGeneric = KodaraOrderCompiler.executeApplicationRestart({
      arrow_target: { detected: false, color: 'NONE', tip_x: 0, tip_y: 0, tip_x_percent: 0, tip_y_percent: 0, quadrant_label: '', target_ocr_text: '' },
      orders: [
        {
          order_id: 'ORD-RESTART-APP',
          intent_type: 'RESTART_APPLICATION',
          description: 'Reinicio genérico',
          status: 'PENDING',
        },
      ],
      project_path: '/home/saghet/Documents/Ollama',
      project_name: 'Ollama',
      total_history_messages: 1,
    });
    expect(resultGeneric.order_id).toBe('ORD-RESTART-APP');
    expect(resultGeneric.success).toBe(true);
    expect(resultGeneric.summary).toContain('Reinicio omitido de forma segura');
  });

  it('4. server.ts, plan-executor.ts y order-compiler.ts no contienen fallbacks ciegos a SamuLibre', () => {
    const serverCode = readFileSync(serverTsPath, 'utf-8');
    const executorCode = readFileSync(planExecutorTsPath, 'utf-8');
    const compilerCode = readFileSync(orderCompilerTsPath, 'utf-8');

    // En server.ts
    expect(serverCode).not.toContain("projectId === 'proj_samulibre' ? '/home/saghet/Documents/SamulibreLinux'");
    expect(serverCode).not.toContain("projectId: effectiveProjectId || 'proj_samulibre'");

    // En plan-executor.ts
    expect(executorCode).toContain('hasRestartOrder');
    expect(executorCode).not.toContain('Reiniciando SamuLibre para visualizar los cambios en vivo');

    // En order-compiler.ts
    expect(compilerCode).not.toContain("projId === 'proj_samulibre' ? '/home/saghet/Documents/SamulibreLinux'");
  });

  it('5. dashboard.html eliminó los 8 botones de entrenamiento y dinamizó los chips de Project Memory', () => {
    const html = readFileSync(dashboardHtmlPath, 'utf-8');

    // Los botones de entrenamiento de la cabina ya no existen
    expect(html).not.toContain('<span>🎓 Academia Ciberseguridad</span>');
    expect(html).not.toContain('<span>🎒 Cimientos Escolares</span>');
    expect(html).not.toContain('<span>⚡ Programación Antigravity</span>');
    expect(html).not.toContain('<span>🦘 Plan Canguro</span>');
    expect(html).not.toContain('<span>🔍 Nmap Directo</span>');
    expect(html).not.toContain('<span>🛡️ SAST Semgrep</span>');
    expect(html).not.toContain('<span>🔧 Auto-Repair Sandbox</span>');
    expect(html).not.toContain('<span>📖 Manual</span>');

    // Chips dinámicos en Project Memory
    expect(html).toContain('id="projectMemoryFilterChips"');
    expect(html).toContain('renderProjectMemoryFilterChips');
    expect(html).not.toContain("onclick=\"loadProjectMemory('proj_samulibre')\"");
  });
});
