// ═══════════════════════════════════════════════════════════════
// KODARA EVOLUTION ENGINE — Módulo 2: Kodara Diagnostic Agent
// Analiza eventos de telemetría, detecta patrones recurrentes,
// distingue determinismo (Determinista / Intermitente / Ambiental),
// consulta Kodara Experience Memory y emite diagnósticos con traza.
// ═══════════════════════════════════════════════════════════════

import {
  DiagnosticReport,
  ErrorCategory,
  ErrorDeterminism,
  KodaraTelemetryEvent,
} from './types.js';
import { KodaraEvolutionDB } from './evolution-db.js';
import { PrivacyScrubber } from './privacy-scrubber.js';

export class KodaraDiagnosticAgent {
  /**
   * Analiza un evento de telemetría con fallo y genera un informe de diagnóstico completo
   */
  public static async diagnoseEvent(event: KodaraTelemetryEvent): Promise<DiagnosticReport> {
    const reasoningTrace: string[] = [];
    reasoningTrace.push(
      `[Paso 1] Inspección de evento ${event.event_id} en componente "${event.component}" (operación: "${event.operation}").`
    );

    // 1. Verificar seguridad contra Prompt Injection en el log antes de diagnosticar
    const injectionCheck = PrivacyScrubber.detectPromptInjection(event.sanitized_log);
    if (injectionCheck.detected) {
      reasoningTrace.push(
        `[ALERTA SEGURIDAD] Detectado patrón de Prompt Injection ("${injectionCheck.matchedPattern}"). Neutralizando instrucciones externas.`
      );
    }

    // 2. Determinar naturaleza del fallo: DETERMINISTIC vs INTERMITTENT vs ENVIRONMENTAL
    const determinism = this.classifyDeterminism(
      event.sanitized_log,
      event.error_category,
      event.error_signature
    );
    reasoningTrace.push(
      `[Paso 2] Clasificación de categoría="${event.error_category}", firma="${event.error_signature}", naturaleza="${determinism}".`
    );

    // 3. Evaluar recurrencia histórica de esta firma normalizada
    const recurrenceCount = Math.max(
      1,
      await KodaraEvolutionDB.getSignatureRecurrenceCount(event.error_signature)
    );
    const isRecurrent = recurrenceCount > 1;
    if (isRecurrent) {
      reasoningTrace.push(
        `[Paso 3] Patrón recurrente detectado: la firma "${event.error_signature}" ha ocurrido ${recurrenceCount} veces.`
      );
    } else {
      reasoningTrace.push(
        `[Paso 3] Primera aparición registrada para la firma normalizada "${event.error_signature}".`
      );
    }

    // 4. Consultar Kodara Experience Memory (exacta o semántica/léxica)
    const matchedExp = await KodaraEvolutionDB.findRelevantExperience(
      event.error_signature,
      `${event.component} ${event.operation} ${event.sanitized_log}`,
      event.environment?.toolVersions
    );

    let rootCause = '';
    let remediation = '';
    let confidence = 0.72;

    if (matchedExp) {
      rootCause = matchedExp.root_cause_hypothesis;
      remediation = matchedExp.applied_solution;
      confidence =
        matchedExp.verification_status === 'VERIFIED'
          ? Math.min(0.99, matchedExp.confidence_score)
          : Math.max(0.65, matchedExp.confidence_score - 0.15);

      reasoningTrace.push(
        `[Paso 4] Experiencia previa encontrada (${matchedExp.incident_id}, estado=${matchedExp.verification_status}, confianza=${confidence}). Reutilizando solución verificada.`
      );
    } else {
      const heuristic = this.deriveHeuristicDiagnosis(
        event.error_category,
        event.error_signature,
        event.sanitized_log,
        determinism
      );
      rootCause = heuristic.rootCause;
      remediation = heuristic.remediation;
      confidence = heuristic.confidence;
      reasoningTrace.push(
        `[Paso 4] Sin experiencia previa idéntica en memoria. Diagnóstico heurístico causal formulado con confianza=${confidence}.`
      );
    }

    // 5. Verificar si existe alguna estrategia bloqueada por fallos repetidos (Módulo 5)
    const strategies = await KodaraEvolutionDB.listStrategyOutcomes();
    const blockedForSig = strategies.filter(
      (s) => s.error_signature === event.error_signature && s.blocked
    );
    if (blockedForSig.length > 0) {
      reasoningTrace.push(
        `[Paso 5] Prevención de bucle: se descartaron ${blockedForSig.length} estrategia(s) previamente bloqueadas por fallos reiterados.`
      );
    }

    const report: DiagnosticReport = {
      diagnosis_id: `DIAG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      event_id: event.event_id,
      error_category: event.error_category,
      error_signature: event.error_signature,
      determinism,
      root_cause_hypothesis: rootCause,
      proposed_remediation: remediation,
      confidence_score: Number(confidence.toFixed(2)),
      matched_experience_id: matchedExp ? matchedExp.incident_id : null,
      is_recurrent: isRecurrent,
      recurrence_count: recurrenceCount,
      reasoning_trace: reasoningTrace,
      created_at: new Date().toISOString(),
    };

    await KodaraEvolutionDB.saveDiagnosis(report);
    return report;
  }

  public static classifyDeterminism(
    log: string,
    category: ErrorCategory,
    signature: string
  ): ErrorDeterminism {
    const lower = log.toLowerCase();

    if (
      lower.includes('timed out') ||
      lower.includes('etimedout') ||
      lower.includes('sqlite_busy') ||
      lower.includes('rate limit') ||
      lower.includes('connection reset') ||
      signature.startsWith('TIMEOUT_')
    ) {
      return 'INTERMITTENT';
    }

    if (
      category === 'CONFIG_DEPENDENCY_ERROR' ||
      category === 'EXTERNAL_TOOL_ERROR' ||
      lower.includes('command not found') ||
      lower.includes('permission denied') ||
      lower.includes('eaddrinuse') ||
      lower.includes('network is unreachable')
    ) {
      return 'ENVIRONMENTAL';
    }

    return 'DETERMINISTIC';
  }

  private static deriveHeuristicDiagnosis(
    category: ErrorCategory,
    signature: string,
    log: string,
    determinism: ErrorDeterminism
  ): { rootCause: string; remediation: string; confidence: number } {
    if (signature === 'RUSTC_E0308') {
      return {
        rootCause: 'Discrepancia de tipos estáticos en Rust (E0308): la expresión evaluada no coincide con la firma esperada.',
        remediation: 'Ajustar conversión de tipo (.to_string(), as_str() o envoltura Ok(...)) en la línea reportada por rustc.',
        confidence: 0.91,
      };
    }
    if (signature === 'RUSTC_E0425') {
      return {
        rootCause: 'Identificador o variable no declarada en el alcance actual (E0425).',
        remediation: 'Importar el símbolo faltante con `use` o corregir el nombre de la variable local.',
        confidence: 0.89,
      };
    }
    if (category === 'CONFIG_DEPENDENCY_ERROR') {
      return {
        rootCause: `Problema ambiental o de dependencias (${signature}): recurso o binario ausente en el sistema.`,
        remediation: 'Verificar instalación del binario en PATH, permisos de ejecución o usar el motor interno de respaldo de Kodara.',
        confidence: 0.86,
      };
    }
    if (category === 'EXTERNAL_TOOL_ERROR') {
      return {
        rootCause: `La herramienta externa finalizó con código de error o timeout (${determinism}).`,
        remediation: 'Reducir alcance/flags de la herramienta externa o activar el pre-procesador seguro de Kodara.',
        confidence: 0.82,
      };
    }
    if (category === 'AI_AGENT_FAILURE') {
      return {
        rootCause: 'Fallo de generación o llamada a herramienta del agente IA (parámetros fuera de esquema o contexto truncado).',
        remediation: 'Asegurar num_ctx=32768, validar parámetros contra JSON Schema del puente MCP y reintentar con temperatura 0.15.',
        confidence: 0.88,
      };
    }
    if (category === 'KODARA_ENGINE_ERROR') {
      return {
        rootCause: 'Defecto interno detectado en un componente del motor Kodara.',
        remediation: 'Generar parche candidato aislado mediante Kodara Self-Improvement Agent y solicitar aprobación humana.',
        confidence: 0.85,
      };
    }

    return {
      rootCause: `Error determinista en el código del proyecto (${signature}): ${log.slice(0, 140)}`,
      remediation: 'Aislar el bloque afectado en un entorno sandbox, aplicar corrección mínima y verificar mediante compilación y tests.',
      confidence: 0.78,
    };
  }
}
