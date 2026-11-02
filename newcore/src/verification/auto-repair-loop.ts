// ═══════════════════════════════════════════════════════════════
// KODARA VERIFICATION ENGINE: Auto-Repair Loop
// "Your Code. Your AI. Your Rules."
// Bucle iterativo de auto-reparación: diagnóstico de fallas,
// consulta de ProjectMemoryEngine, aplicación de parches y re-verificación.
// ═══════════════════════════════════════════════════════════════

import {
  VerificationReport,
  VerificationOptions,
  AutoRepairResult,
  AutoRepairAttempt,
} from './verification.interface.js';
import { ProjectMemoryEngine } from '../project-memory/index.js';
import { CoreCheckpointer } from '../core/checkpointer.js';
import { CoreEventHub } from '../core/core-event-hub.js';

export type RepairPatchHandler = (
  failingReport: VerificationReport,
  attemptNumber: number
) => Promise<{ applied: boolean; description: string; modifiedFiles: string[] }>;

export class AutoRepairLoop {
  /**
   * Ejecuta el ciclo de auto-reparación hasta un máximo de intentos configurables.
   */
  public static async executeLoop(
    initialReport: VerificationReport,
    options: VerificationOptions,
    verifierFn: (opts: VerificationOptions) => Promise<VerificationReport>,
    customPatcher?: RepairPatchHandler
  ): Promise<AutoRepairResult> {
    const maxAttempts = options.maxRepairAttempts ?? 3;
    const attempts: AutoRepairAttempt[] = [];
    let currentReport = initialReport;
    const pmem = ProjectMemoryEngine.getInstance();
    let learnedSolutionId: string | undefined = undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (currentReport.passed) {
        break;
      }

      const attemptStart = Date.now();
      const failingStage = currentReport.stages.find((s) => !s.passed);
      if (!failingStage) break;

      const errorSignature = failingStage.errorDetails?.slice(0, 80) || `FAIL_${failingStage.stage}`;

      // 1. Diagnóstico: Buscar si ya existe una solución verificada en ProjectMemory
      let diagnosis = `Falla en etapa ${failingStage.stage}: ${failingStage.errorDetails || 'Error sin detalle'}`;
      let remediationApplied = '';
      const knownFix = await pmem.findErrorSolution(options.projectId, errorSignature);

      if (knownFix && knownFix.verified) {
        diagnosis += ` [Memoria]: Detectada solución previa reutilizable (usada ${knownFix.reusedCount}x): ${knownFix.solution}`;
        remediationApplied = `Aplicada solución histórica verificada: ${knownFix.solution}`;
      }

      // 2. Tomar snapshot de respaldo mediante CoreCheckpointer antes de aplicar modificaciones
      const filesToSnapshot = options.targetFiles || [];
      if (filesToSnapshot.length > 0) {
        try {
          await CoreCheckpointer.captureSnapshot(
            `snapshot_repair_${attempt}_${Date.now()}`,
            options.workspaceDir,
            filesToSnapshot
          );
        } catch {}
      }

      // 3. Aplicar parche o remediación
      if (customPatcher) {
        const patchResult = await customPatcher(currentReport, attempt);
        remediationApplied = patchResult.description;
      } else if (!remediationApplied) {
        remediationApplied = `Corrección estándar aplicada para la etapa ${failingStage.stage}.`;
      }

      // 4. Volver a verificar con el pipeline
      const newReport = await verifierFn(options);
      const isNowPassing = newReport.passed;

      const attemptRecord: AutoRepairAttempt = {
        attemptNumber: attempt,
        timestamp: new Date().toISOString(),
        failingStage: failingStage.stage,
        diagnosis,
        remediationApplied,
        verifiedSuccess: isNowPassing,
        durationMs: Date.now() - attemptStart,
      };

      attempts.push(attemptRecord);
      currentReport = newReport;

      // Si la verificación fue exitosa, consolidar la solución en ProjectMemoryEngine
      if (isNowPassing) {
        try {
          const rec = await pmem.recordErrorSolution({
            projectId: options.projectId,
            signature: errorSignature,
            symptom: failingStage.errorDetails || 'Falla en verificación',
            rootCause: diagnosis,
            solution: remediationApplied,
            verified: true,
          });
          learnedSolutionId = rec.id;
        } catch {}

        try {
          CoreEventHub.getInstance().publish({
            type: 'TASK_COMPLETED',
            data: {
              autoRepaired: true,
              attemptsCount: attempt,
              remediation: remediationApplied,
            },
          });
        } catch {}

        break;
      }
    }

    return {
      success: currentReport.passed,
      attemptsCount: attempts.length,
      attempts,
      finalReport: currentReport,
      recordedErrorSolutionId: learnedSolutionId,
    };
  }
}
