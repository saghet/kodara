// ═══════════════════════════════════════════════════════════════
// KODARA EXECUTABLE PLAN ENGINE — Pruebas Automatizadas del Pilar "[▶ Proceed]"
// Verifica la eliminación de botones simbólicos falsos y la ejecución
// física de las 4 fases de un Plan Ejecutable en Linux.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import { KodaraPlanExecutor } from '../plan-executor.js';

describe('Kodara Executable Plan Engine ("[▶ Proceed]" Real Execution)', () => {
  it('debe eliminar por completo alucinaciones de botones simbólicos del LLM', () => {
    const hallucinated = [
      '7. **Pruebas Automatizadas Extensas**',
      '- Ampliar los conjuntos de pruebas.',
      '',
      '**Botón "Proceder"**',
      'Para proceder al plan propuesto:',
      '[![Antigraviti](https://i.imgur.com/2ZJLwzQ.png)](javascript:void(0);alert("Plan de trabajo iniciado"))',
      '**Nota:** Este botón es una representación simbólica y no ejecuta ninguna acción específica dentro del entorno actual.',
    ].join('\n');

    const cleaned = KodaraPlanExecutor.stripSymbolicButtonHallucinations(hallucinated);
    expect(cleaned).not.toContain('imgur.com');
    expect(cleaned).not.toContain('javascript:void');
    expect(cleaned).not.toContain('representación simbólica');
    expect(cleaned).toContain('Pruebas Automatizadas Extensas');
  });

  it('debe crear un Artefacto de Plan Ejecutable en SQLite y ejecutar sus 4 fases reales al invocar Proceed', async () => {
    const created = await KodaraPlanExecutor.createExecutablePlan({
      projectId: 'proj_samulibre',
      projectName: 'SamulibreLinux',
      projectPath: '/home/saghet/Documents/SamulibreLinux',
      title: 'Plan de Prueba Integral: SamuLibre EDR',
      summary: 'Verificación de las 4 fases reales del botón Proceed.',
      markdownContent: '1. Fase 1\n2. Fase 2\nNota: Este botón es una representación simbólica.',
    });

    expect(created.plan_id).toContain('PLAN-');
    expect(created.status).toBe('READY_TO_PROCEED');
    expect(created.phases.length).toBe(4);
    expect(created.markdown_content).not.toContain('representación simbólica');

    // Simular clic en el botón real [▶ Proceed] con streaming de porcentaje (0% -> 100%)
    const progressEvents: number[] = [];
    const actionsLog: string[] = [];
    const executed = await KodaraPlanExecutor.executePlanById(created.plan_id, (ev) => {
      progressEvents.push(ev.percent);
      actionsLog.push(ev.currentAction);
    });

    expect(executed.status).toBe('COMPLETED');
    expect(executed.phases.every((p) => p.status === 'COMPLETED')).toBe(true);
    expect(progressEvents.length).toBeGreaterThanOrEqual(8);
    expect(progressEvents[progressEvents.length - 1]).toBe(100);
    expect(actionsLog.some((a) => a.includes('Indexando'))).toBe(true);
    expect(actionsLog.some((a) => a.includes('SAST'))).toBe(true);
    expect(actionsLog.some((a) => a.includes('rustc'))).toBe(true);
    expect(executed.execution_report_md).toContain('Ejecución Completada');
    expect(executed.execution_report_md).toContain('Fase 1:');
    expect(executed.execution_report_md).toContain('Fase 2:');
    expect(executed.execution_report_md).toContain('Fase 3:');
    expect(executed.execution_report_md).toContain('Fase 4:');
  });

  it('debe auto-reparar y recuperar la ejecución si el ID del plan caducó o fue reemplazado', async () => {
    const recovered = await KodaraPlanExecutor.executePlanById('PLAN-STALE-NONEXISTENT-ID');
    expect(recovered.status).toBe('COMPLETED');
    expect(recovered.phases.every((p) => p.status === 'COMPLETED')).toBe(true);
  });
});
