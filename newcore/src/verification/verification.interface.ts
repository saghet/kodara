// ═══════════════════════════════════════════════════════════════
// KODARA VERIFICATION ENGINE: Interfaces & Types
// "Your Code. Your AI. Your Rules."
// Pipeline de verificación autónoma en 4 fases y bucle de auto-reparación
// para garantizar que ninguna tarea se dé por concluida sin validación física.
// ═══════════════════════════════════════════════════════════════

export type VerificationStageType =
  | 'FILE_INTEGRITY'
  | 'STATIC_ANALYSIS'
  | 'BUILD_AND_TEST'
  | 'RUNTIME_HEALTH';

export interface StageResult {
  stage: VerificationStageType;
  passed: boolean;
  durationMs: number;
  findings: string[];
  errorDetails?: string;
  commandRun?: string;
}

export interface VerificationReport {
  verificationId: string;
  projectId: string;
  workspaceDir: string;
  passed: boolean;
  stages: StageResult[];
  timestamp: string;
  durationMs: number;
  summary: string;
}

export interface AutoRepairAttempt {
  attemptNumber: number;
  timestamp: string;
  failingStage: VerificationStageType;
  diagnosis: string;
  remediationApplied: string;
  verifiedSuccess: boolean;
  durationMs: number;
}

export interface AutoRepairResult {
  success: boolean;
  attemptsCount: number;
  attempts: AutoRepairAttempt[];
  finalReport: VerificationReport;
  recordedErrorSolutionId?: string;
}

export interface VerificationOptions {
  projectId: string;
  workspaceDir: string;
  targetFiles?: string[];
  testCommand?: string;
  buildCommand?: string;
  skipRuntimeHealth?: boolean;
  maxRepairAttempts?: number;
}
