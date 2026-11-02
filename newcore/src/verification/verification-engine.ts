// ═══════════════════════════════════════════════════════════════
// KODARA VERIFICATION ENGINE: Central Facade & Pipeline Orchestrator
// "Your Code. Your AI. Your Rules."
// Ejecuta el pipeline completo de 4 etapas y coordina el ciclo
// autónomo de auto-reparación ante fallos.
// ═══════════════════════════════════════════════════════════════

import {
  VerificationReport,
  VerificationOptions,
  StageResult,
  AutoRepairResult,
} from './verification.interface.js';
import { FileIntegrityStage } from './stages/file-integrity.stage.js';
import { StaticAnalysisStage } from './stages/static-analysis.stage.js';
import { BuildTestStage } from './stages/build-test.stage.js';
import { RuntimeHealthStage } from './stages/runtime-health.stage.js';
import { AutoRepairLoop, RepairPatchHandler } from './auto-repair-loop.js';
import { CoreEventHub } from '../core/core-event-hub.js';

export class VerificationEngine {
  private static instance: VerificationEngine;

  private constructor() {}

  public static getInstance(): VerificationEngine {
    if (!VerificationEngine.instance) {
      VerificationEngine.instance = new VerificationEngine();
    }
    return VerificationEngine.instance;
  }

  /**
   * Ejecuta el pipeline completo de verificación en 4 fases sobre el workspace.
   */
  public async verifyWorkspace(options: VerificationOptions): Promise<VerificationReport> {
    const start = Date.now();
    const verificationId = `VERIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const stages: StageResult[] = [];
    const targetFiles = options.targetFiles || [];

    // Fase 1: Integridad de Archivos
    const integrityRes = await FileIntegrityStage.execute(options.workspaceDir, targetFiles);
    stages.push(integrityRes);

    // Fase 2: Análisis Estático y SAST
    const sastRes = await StaticAnalysisStage.execute(options.workspaceDir, targetFiles);
    stages.push(sastRes);

    // Fase 3: Compilación y Pruebas Unitarias
    if (options.testCommand || options.buildCommand) {
      const buildTestRes = await BuildTestStage.execute(
        options.workspaceDir,
        options.testCommand,
        options.buildCommand
      );
      stages.push(buildTestRes);
    }

    // Fase 4: Salud en Tiempo de Ejecución (opcional)
    if (!options.skipRuntimeHealth) {
      const healthRes = await RuntimeHealthStage.execute(options.workspaceDir);
      stages.push(healthRes);
    }

    const allPassed = stages.every((s) => s.passed);
    const passedCount = stages.filter((s) => s.passed).length;

    const report: VerificationReport = {
      verificationId,
      projectId: options.projectId,
      workspaceDir: options.workspaceDir,
      passed: allPassed,
      stages,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - start,
      summary: allPassed
        ? `Verificación aprobada exitosamente (${passedCount}/${stages.length} etapas pasadas al 100%).`
        : `Verificación fallida (${passedCount}/${stages.length} etapas pasadas). Se detectaron fallas en: ${stages.filter((s) => !s.passed).map((s) => s.stage).join(', ')}.`,
    };

    try {
      CoreEventHub.getInstance().publish({
        type: allPassed ? 'TASK_COMPLETED' : 'TASK_FAILED',
        data: {
          verificationId,
          projectId: options.projectId,
          passed: allPassed,
          summary: report.summary,
        },
      });
    } catch {}

    return report;
  }

  /**
   * Ejecuta la verificación y, si falla, activa inmediatamente el
   * bucle de auto-reparación iterativa con límite de reintentos.
   */
  public async verifyAndAutoRepair(
    options: VerificationOptions,
    patchHandler?: RepairPatchHandler
  ): Promise<AutoRepairResult> {
    const initialReport = await this.verifyWorkspace(options);
    if (initialReport.passed) {
      return {
        success: true,
        attemptsCount: 0,
        attempts: [],
        finalReport: initialReport,
      };
    }

    return await AutoRepairLoop.executeLoop(
      initialReport,
      options,
      (opts) => this.verifyWorkspace(opts),
      patchHandler
    );
  }
}
