// ═══════════════════════════════════════════════════════════════
// KODARA MULTI-AGENT SYSTEM: Specialized Agent Execution Unit
// "Your Code. Your AI. Your Rules."
// Instancia un agente especializado, confina sus permisos de
// ejecución y herramientas, y administra su ciclo de vida.
// ═══════════════════════════════════════════════════════════════

import {
  SpecializedAgentProfile,
  AgentExecutionContext,
  AgentTaskInput,
  AgentTaskOutput,
  AgentRole,
} from './agent-definition.interface.js';
import { SPECIALIZED_AGENT_PROFILES } from './roles/profiles.js';
import { AgentWhiteboard } from './coordination/agent-whiteboard.js';
import { AIProviderEngine, AIChatMessage } from '../ai/index.js';
import { SystemRuntimeEngine } from '../runtime/index.js';

export type SpecializedAgentStatus = 'IDLE' | 'RUNNING' | 'WAITING' | 'COMPLETED' | 'FAILED';

export class SpecializedAgent {
  public readonly agentId: string;
  public readonly profile: SpecializedAgentProfile;
  public readonly context: AgentExecutionContext;
  private status: SpecializedAgentStatus = 'IDLE';
  private iterationCount = 0;
  private messageHistory: AIChatMessage[] = [];

  constructor(role: AgentRole, context: AgentExecutionContext, customProfile?: Partial<SpecializedAgentProfile>) {
    this.agentId = context.agentId;
    this.context = context;
    const baseProfile = SPECIALIZED_AGENT_PROFILES[role];
    if (!baseProfile) {
      throw new Error(`Rol de agente desconocido: "${role}".`);
    }
    this.profile = { ...baseProfile, ...customProfile };
  }

  public getStatus(): SpecializedAgentStatus {
    return this.status;
  }

  public getIterationCount(): number {
    return this.iterationCount;
  }

  /**
   * Valida si el agente tiene autorización para invocar una herramienta específica.
   */
  public canUseTool(toolName: string): { allowed: boolean; reason?: string } {
    if (!this.profile.allowedTools.includes(toolName)) {
      return {
        allowed: false,
        reason: `La herramienta "${toolName}" no está en la lista de herramientas permitidas para el rol ${this.profile.role}.`,
      };
    }

    if (toolName === 'write_file' && !this.profile.permissions.writeFiles) {
      return { allowed: false, reason: `El rol ${this.profile.role} no tiene permisos de modificación de archivos (writeFiles: false).` };
    }

    if (toolName === 'run_command' && !this.profile.permissions.executeCommands) {
      return { allowed: false, reason: `El rol ${this.profile.role} no tiene permisos de ejecución de comandos (executeCommands: false).` };
    }

    if (toolName === 'git_operation' && !this.profile.permissions.commitGit) {
      return { allowed: false, reason: `El rol ${this.profile.role} no tiene permisos para realizar operaciones de Git (commitGit: false).` };
    }

    return { allowed: true };
  }

  /**
   * Ejecuta una tarea encomendada al agente.
   */
  public async executeTask(input: AgentTaskInput): Promise<AgentTaskOutput> {
    const start = Date.now();
    this.status = 'RUNNING';
    this.iterationCount = 0;

    const whiteboard = AgentWhiteboard.getInstance();
    whiteboard.postNote({
      fromAgentId: this.agentId,
      fromRole: this.profile.role,
      topic: 'TASK_STARTED',
      content: `Iniciando tarea: ${input.taskDescription}`,
    });

    const systemPrompt = `[IDENTIDAD DEL AGENTE KODARA]:
Rol: ${this.profile.role} (${this.profile.name})
Objetivo: ${this.profile.objective}
Identidad: ${this.profile.identity}

[INSTRUCCIONES ESPECÍFICAS DEL ROL]:
${this.profile.systemInstructions}

[LIMITACIONES Y PERMISOS]:
- Modificación de archivos: ${this.profile.permissions.writeFiles ? 'PERMITIDO' : 'DENEGADO'}
- Ejecución de comandos: ${this.profile.permissions.executeCommands ? 'PERMITIDO' : 'DENEGADO'}
- Herramientas autorizadas: ${this.profile.allowedTools.join(', ')}
- Directorio de trabajo: ${this.context.worktreePath || this.context.workspaceDir}
`;

    this.messageHistory = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Tarea a realizar:\n${input.taskDescription}` },
    ];

    try {
      const aiEngine = AIProviderEngine.getInstance();
      const response = await aiEngine.chatComplete({
        model: this.profile.defaultModel,
        messages: this.messageHistory,
        temperature: 0.35,
      });

      this.iterationCount++;
      this.status = 'COMPLETED';

      whiteboard.postNote({
        fromAgentId: this.agentId,
        fromRole: this.profile.role,
        topic: 'TASK_COMPLETED',
        content: `Tarea finalizada con éxito. Resumen de ejecución: ${response.content.slice(0, 150)}...`,
      });

      return {
        agentId: this.agentId,
        role: this.profile.role,
        success: true,
        summary: response.content,
        modifiedFiles: input.targetFiles || [],
        durationMs: Date.now() - start,
      };
    } catch (err: any) {
      this.status = 'FAILED';

      whiteboard.postNote({
        fromAgentId: this.agentId,
        fromRole: this.profile.role,
        topic: 'TASK_FAILED',
        content: `Falla en ejecución de tarea: ${err.message}`,
      });

      return {
        agentId: this.agentId,
        role: this.profile.role,
        success: false,
        summary: '',
        error: err.message,
        durationMs: Date.now() - start,
      };
    }
  }
}
