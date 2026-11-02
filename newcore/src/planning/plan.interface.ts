// ═══════════════════════════════════════════════════════════════
// KODARA AUTONOMOUS PLANNING ENGINE: Interfaces & Types
// "Your Code. Your AI. Your Rules."
// Modelo formal de planificación jerárquica con dependencias DAG,
// agentes responsables, criterios de aceptación y replanificación.
// ═══════════════════════════════════════════════════════════════

export type PlanStatus =
  | 'PENDING'
  | 'ANALYZING'
  | 'PLANNED'
  | 'AWAITING_APPROVAL'
  | 'IN_PROGRESS'
  | 'TESTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED';

export type TaskStatus =
  | 'PENDING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'SKIPPED';

export type AgentRole =
  | 'ORCHESTRATOR'
  | 'ARCHITECT'
  | 'PLANNER'
  | 'DEVELOPER'
  | 'DEBUGGER'
  | 'TESTER'
  | 'SECURITY'
  | 'REVIEWER'
  | 'DOCUMENTATION'
  | 'SYSTEM_OPERATOR';

export interface PlanSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface PlanTask {
  id: string;
  title: string;
  description: string;
  assignedAgent: AgentRole;
  status: TaskStatus;
  dependencies: string[];        // IDs de tareas requeridas previas (Estructura DAG)
  affectedFiles: string[];       // Rutas relativas de archivos a crear o modificar
  acceptanceCriteria: string[];  // Criterios de verificación indispensables
  subtasks?: PlanSubtask[];
  outputResult?: string;
  errorDetails?: string;
  durationMs?: number;
}

export interface ReplanningEvent {
  id: string;
  timestamp: string;
  failedTaskId: string;
  triggerReason: string;
  remediationAction: string;
  addedTaskIds?: string[];
}

export interface HierarchicalPlan {
  id: string;
  title: string;
  objective: string;
  projectAnalysis: string;
  requirements: string[];
  proposedArchitecture: string;
  tasks: PlanTask[];
  risks: string[];
  acceptanceCriteria: string[];
  requiredTests: string[];
  complexityEstimation: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: PlanStatus;
  projectId: string;
  projectName: string;
  projectPath: string;
  createdAt: string;
  updatedAt: string;
  explanation: string;            // Razonamiento explícito de qué se pretende hacer y por qué
  replanningHistory?: ReplanningEvent[];
}

export interface PlanCreationInput {
  projectId: string;
  projectName: string;
  projectPath: string;
  title: string;
  objective: string;
  projectAnalysis?: string;
  requirements?: string[];
  proposedArchitecture?: string;
  tasks: Array<Omit<PlanTask, 'status'> & { status?: TaskStatus }>;
  risks?: string[];
  acceptanceCriteria?: string[];
  requiredTests?: string[];
  complexityEstimation?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation?: string;
}
