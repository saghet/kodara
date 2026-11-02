// ═══════════════════════════════════════════════════════════════
// KODARA PROJECT MEMORY ENGINE: Interfaces & Types
// "Your Code. Your AI. Your Rules."
// Memoria persistente estructurada en 6 dimensiones con ADRs,
// historial de errores/soluciones, indexación y compactación.
// ═══════════════════════════════════════════════════════════════

export type MemoryTier =
  | 'SESSION'
  | 'PROJECT'
  | 'TECHNICAL'
  | 'ARCHITECTURAL_DECISION'
  | 'TASK'
  | 'ERROR_SOLUTION';

export interface MemoryEntry {
  id: string;
  projectId: string;
  tier: MemoryTier;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ADRStatus = 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'SUPERSEDED';

export interface ArchitecturalDecisionRecord {
  id: string;
  projectId: string;
  adrNumber: number;
  title: string;
  status: ADRStatus;
  context: string;
  decision: string;
  consequences: string;
  authorAgent: string;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorSolutionRecord {
  id: string;
  projectId: string;
  signature: string;
  symptom: string;
  rootCause: string;
  solution: string;
  verified: boolean;
  reusedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContextRetrievalQuery {
  projectId: string;
  query: string;
  tiers?: MemoryTier[];
  limit?: number;
  maxTokens?: number;
}

export interface CompactedSessionResult {
  compactedPrompt: string;
  preservedRecentMessages: any[];
  summary: string;
  tokensEstimated: number;
}
