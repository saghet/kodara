// ═══════════════════════════════════════════════════════════════
// KODARA EVOLUTION ENGINE — Módulo 5: Kodara Learning Agent
// Analiza la secuencia completa de cada incidente, bloquea estrategias
// que fallan reiteradamente (Negative Knowledge), crea experiencias
// reutilizables verificadas y recomienda mejoras de prompts y tests.
// ═══════════════════════════════════════════════════════════════

import {
  DiagnosticReport,
  ExperienceRecord,
  RepairExecutionSummary,
  StrategyOutcomeRecord,
} from './types.js';
import { KodaraEvolutionDB } from './evolution-db.js';
import { KodaraOpenTelemetry } from './telemetry-otel.js';

export class KodaraLearningAgent {
  /**
   * Ejecuta el análisis post-incidente (7 pasos del Módulo 5)
   */
  public static async analyzeIncidentSequence(
    diagnosis: DiagnosticReport,
    repairSummary: RepairExecutionSummary
  ): Promise<{
    experienceRecord: ExperienceRecord | null;
    strategyOutcomes: StrategyOutcomeRecord[];
    promptImprovement: string;
    recommendedTest: string;
  }> {
    const strategyOutcomes: StrategyOutcomeRecord[] = [];

    // 1, 2 y 3. Analizar qué decisiones funcionaron y cuáles empeoraron o fallaron
    for (const step of repairSummary.steps) {
      const strategyHash = this.computeStrategyHash(step.hypothesis, step.patch_summary);
      const worked = step.accepted && step.compile_exit_code === 0 && step.test_exit_code === 0;

      const promptImprovement = worked
        ? `Priorizar el patrón "${step.patch_summary}" ante la firma ${diagnosis.error_signature} en el contexto de los agentes.`
        : `Evitar la transformación "${step.patch_summary}" para ${diagnosis.error_signature}; causó fallo de verificación (compile=${step.compile_exit_code}, test=${step.test_exit_code}).`;

      const recommendedTest = `Crear test unitario de regresión que verifique invariantes para ${diagnosis.error_signature} tras aplicar "${step.patch_summary}".`;

      const outcomeRecord = await KodaraEvolutionDB.recordStrategyOutcome({
        strategy_id: `STRAT-${Date.now()}-${step.attempt_number}`,
        error_signature: diagnosis.error_signature,
        strategy_hash: strategyHash,
        strategy_description: `${step.hypothesis} -> ${step.patch_summary}`,
        outcome: worked ? 'WORKED' : 'WORSENED',
        failure_count: worked ? 0 : 1,
        success_count: worked ? 1 : 0,
        blocked: false,
        recommended_prompt_improvement: promptImprovement,
        recommended_test_case: recommendedTest,
        updated_at: new Date().toISOString(),
      });

      strategyOutcomes.push(outcomeRecord);
    }

    // 4. Crear experiencia reutilizable SOLO si fue verificada con compilación + pruebas,
    // o registrarla explícitamente como FAILED para no tratar hipótesis no verificadas como conocimiento confirmado.
    const winningStep = repairSummary.steps.find(
      (s) => s.accepted && s.compile_exit_code === 0 && s.test_exit_code === 0
    );

    let savedExperience: ExperienceRecord | null = null;
    if (winningStep) {
      savedExperience = {
        incident_id: repairSummary.incident_id,
        error_signature: diagnosis.error_signature,
        error_category: diagnosis.error_category,
        technical_context: `Proyecto: ${repairSummary.project_path} | Firma: ${diagnosis.error_signature}`,
        root_cause_hypothesis: winningStep.hypothesis,
        applied_solution: winningStep.patch_summary,
        compilation_result: 'PASS',
        test_result: 'PASS',
        attempts_count: repairSummary.attempts_made,
        affected_versions: KodaraOpenTelemetry.getToolVersions(),
        confidence_score: 0.95,
        verification_status: 'VERIFIED',
        verified_at: new Date().toISOString(),
      };
      await KodaraEvolutionDB.saveExperience(savedExperience);
    } else if (repairSummary.steps.length > 0) {
      const lastStep = repairSummary.steps[repairSummary.steps.length - 1];
      savedExperience = {
        incident_id: repairSummary.incident_id,
        error_signature: diagnosis.error_signature,
        error_category: diagnosis.error_category,
        technical_context: `Proyecto: ${repairSummary.project_path} | Firma: ${diagnosis.error_signature}`,
        root_cause_hypothesis: lastStep.hypothesis,
        applied_solution: lastStep.patch_summary,
        compilation_result: lastStep.compile_exit_code === 0 ? 'PASS' : 'FAIL',
        test_result: lastStep.test_exit_code === 0 ? 'PASS' : 'FAIL',
        attempts_count: repairSummary.attempts_made,
        affected_versions: KodaraOpenTelemetry.getToolVersions(),
        confidence_score: 0.2,
        verification_status: 'FAILED',
        verified_at: new Date().toISOString(),
      };
      await KodaraEvolutionDB.saveExperience(savedExperience);
    }

    const lastOutcome = strategyOutcomes[strategyOutcomes.length - 1];
    return {
      experienceRecord: savedExperience,
      strategyOutcomes,
      promptImprovement:
        lastOutcome?.recommended_prompt_improvement ||
        `Incluir validación previa de tipos y dependencias para ${diagnosis.error_signature}.`,
      recommendedTest:
        lastOutcome?.recommended_test_case ||
        `Añadir prueba automatizada de borde para ${diagnosis.error_signature}.`,
    };
  }

  public static computeStrategyHash(hypothesis: string, patchSummary: string): string {
    const raw = `${hypothesis.toLowerCase().trim()}|${patchSummary.toLowerCase().trim()}`;
    let hash = 2166136261;
    for (let i = 0; i < raw.length; i++) {
      hash ^= raw.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `SHASH_${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
  }
}
