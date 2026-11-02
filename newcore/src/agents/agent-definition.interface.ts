// ═══════════════════════════════════════════════════════════════
// KODARA MULTI-AGENT SYSTEM: Interfaces & Definitions
// "Your Code. Your AI. Your Rules."
// Contratos formales para agentes especializados con identidades,
// permisos granulares, herramientas permitidas y límites de ejecución.
// ═══════════════════════════════════════════════════════════════

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

export interface AgentPermissions {
  readFiles: boolean;
  writeFiles: boolean;
  executeCommands: boolean;
  commitGit: boolean;
  accessNetwork: boolean;
}

export interface SpecializedAgentProfile {
  role: AgentRole;
  name: string;
  identity: string;
  objective: string;
  systemInstructions: string;
  defaultModel: string;
  allowedTools: string[];
  permissions: AgentPermissions;
  maxExecutionTokens: number;
  maxIterations: number;
}

export interface AgentExecutionContext {
  agentId: string;
  role: AgentRole;
  workspaceDir: string;
  worktreePath?: string; // Ruta de aislamiento Git worktree (opcional)
  taskId?: string;
  planId?: string;
  sharedState?: Record<string, any>;
}

export interface AgentTaskInput {
  taskDescription: string;
  targetFiles?: string[];
  contextData?: Record<string, any>;
}

export interface AgentTaskOutput {
  agentId: string;
  role: AgentRole;
  success: boolean;
  summary: string;
  producedArtifacts?: string[];
  modifiedFiles?: string[];
  error?: string;
  durationMs: number;
}

export interface WhiteboardNote {
  id: string;
  timestamp: string;
  fromAgentId: string;
  fromRole: AgentRole;
  toAgentId?: string; // Si es undefined, es público (broadcast para todo el enjambre)
  topic: string;
  content: string;
  tags?: string[];
}
