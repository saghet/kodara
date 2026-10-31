// ═══════════════════════════════════════════════════════════════
// KODARA EVOLUTION ENGINE — Contratos y Tipos Base (Módulos 1 al 8)
// "Your Code. Your AI. Your Rules."
// ═══════════════════════════════════════════════════════════════

/**
 * Las 5 categorías estrictas que separan los fallos de proyectos desarrollados
 * de los fallos internos del motor Kodara, herramientas, entorno y agentes IA.
 */
export type ErrorCategory =
  | 'PROJECT_CODE_ERROR'       // 1. Errores introducidos en los proyectos desarrollados
  | 'KODARA_ENGINE_ERROR'      // 2. Errores del propio motor de Kodara
  | 'EXTERNAL_TOOL_ERROR'      // 3. Errores de herramientas externas (nmap, cargo, git, etc.)
  | 'CONFIG_DEPENDENCY_ERROR'  // 4. Problemas de configuración, entorno o dependencias
  | 'AI_AGENT_FAILURE'         // 5. Fallos de los agentes de inteligencia artificial
  | 'NONE';                    // Operación exitosa sin error

export type ErrorDeterminism = 'DETERMINISTIC' | 'INTERMITTENT' | 'ENVIRONMENTAL';

export type TelemetrySeverity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export type ResolutionStatus =
  | 'SUCCESS'
  | 'DETECTED'
  | 'DIAGNOSING'
  | 'REPAIR_IN_PROGRESS'
  | 'VERIFIED_FIXED'
  | 'REVERTED_FAILED'
  | 'ESCALATED_TO_HUMAN';

export interface EnvironmentSnapshot {
  os: string;
  cpuModel: string;
  cpuCores: number;
  cpuUsagePct: number;
  ramUsedMb: number;
  ramTotalMb: number;
  toolVersions: Record<string, string>;
}

export interface TelemetryPerformanceMetrics {
  compileTimeMs: number;
  inferenceLatencyMs: number;
  tokensUsed: number;
  testPassedCount: number;
  testFailedCount: number;
}

/**
 * MÓDULO 1: Evento estructurado basado en OpenTelemetry
 * Incluye los 13 campos obligatorios + métricas operativas y trazas sanitizadas
 */
export interface KodaraTelemetryEvent {
  event_id: string;
  timestamp: string;
  session_id: string;
  project_id: string;
  agent_id: string;
  component: string;
  operation: string;
  error_category: ErrorCategory;
  error_signature: string;
  severity: TelemetrySeverity;
  environment: EnvironmentSnapshot;
  attempt_number: number;
  resolution_status: ResolutionStatus;
  // Campos extendidos de observabilidad
  metrics: TelemetryPerformanceMetrics;
  sanitized_log: string;
  stack_trace: string;
  parent_event_id?: string;
}

/**
 * MÓDULO 2: Resultado de Kodara Diagnostic Agent
 */
export interface DiagnosticReport {
  diagnosis_id: string;
  event_id: string;
  error_category: ErrorCategory;
  error_signature: string;
  determinism: ErrorDeterminism;
  root_cause_hypothesis: string;
  proposed_remediation: string;
  confidence_score: number; // 0.0 a 1.0
  matched_experience_id: string | null;
  is_recurrent: boolean;
  recurrence_count: number;
  reasoning_trace: string[];
  created_at: string;
}

/**
 * MÓDULO 4: Registro en Kodara Experience Memory
 */
export type ExperienceVerificationStatus = 'VERIFIED' | 'FAILED' | 'PENDING_REVALIDATION';

export interface ExperienceRecord {
  incident_id: string;
  error_signature: string;
  error_category: ErrorCategory;
  technical_context: string;
  root_cause_hypothesis: string;
  applied_solution: string;
  compilation_result: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  test_result: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  attempts_count: number;
  affected_versions: Record<string, string>;
  confidence_score: number;
  verification_status: ExperienceVerificationStatus;
  verified_at: string;
}

/**
 * MÓDULO 3: Resultado de un ciclo del Kodara Repair Agent
 */
export interface RepairAttemptStep {
  attempt_number: number;
  hypothesis: string;
  patch_summary: string;
  sandbox_path: string;
  compile_exit_code: number;
  test_exit_code: number;
  compile_output: string;
  test_output: string;
  accepted: boolean;
  reverted: boolean;
  duration_ms: number;
}

export interface RepairExecutionSummary {
  incident_id: string;
  project_path: string;
  error_signature: string;
  error_category: ErrorCategory;
  max_attempts: number;
  attempts_made: number;
  final_status: 'VERIFIED_FIXED' | 'REVERTED_FAILED' | 'ESCALATED_TO_HUMAN' | 'BLOCKED_SECURITY';
  steps: RepairAttemptStep[];
  experience_saved_id: string | null;
  human_intervention_reason?: string;
}

/**
 * MÓDULO 5: Aprendizaje Continuo y Conocimiento Negativo (Anti-Repetición)
 */
export interface StrategyOutcomeRecord {
  strategy_id: string;
  error_signature: string;
  strategy_hash: string;
  strategy_description: string;
  outcome: 'WORKED' | 'WORSENED' | 'NO_EFFECT';
  failure_count: number;
  success_count: number;
  blocked: boolean;
  recommended_prompt_improvement: string;
  recommended_test_case: string;
  updated_at: string;
}

/**
 * MÓDULO 6: Propuesta de Autoevaluación de Kodara (Kodara Self-Improvement Agent)
 */
export interface SelfImprovementProposal {
  proposal_id: string;
  target_component: string;
  detected_defect: string;
  error_signature: string;
  isolated_branch_or_path: string;
  candidate_patch_diff: string;
  regression_test_code: string;
  metrics_before: { latency_ms: number; failure_rate: number };
  metrics_after_estimated: { latency_ms: number; failure_rate: number };
  status: 'PENDING_HUMAN_APPROVAL' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

/**
 * MÓDULO 7: Métricas de Evaluación Continua
 */
export interface EvolutionEvaluationMetrics {
  total_operations: number;
  successful_compilations_rate: number; // 0..100 %
  verified_repairs_rate: number;        // 0..100 %
  recurrent_errors_count: number;
  mttr_ms: number;                      // Mean Time To Recovery en ms
  regressions_introduced: number;
  avg_attempts_per_repair: number;
  avg_cpu_pct: number;
  avg_ram_mb: number;
  total_tokens_used: number;
  avg_inference_latency_ms: number;
  human_interventions_required: number;
  experiences_verified_count: number;
  experiences_failed_count: number;
  experiences_pending_count: number;
  self_improvement_proposals_count: number;
}

export interface PrivacyAndAutonomyConfig {
  telemetry_enabled: boolean;
  redact_secrets: boolean;
  retention_days: number;
  external_export_consent: boolean;
  autonomous_repair_enabled: boolean;
  max_auto_attempts: number; // Por defecto 3
}
