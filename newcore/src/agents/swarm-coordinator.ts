// ═══════════════════════════════════════════════════════════════
// KODARA MULTI-AGENT SYSTEM: Swarm Coordinator
// "Your Code. Your AI. Your Rules."
// Orquesta el despliegue de enjambres de agentes especializados,
// coordina la ejecución concurrente y administra el aislamiento Git.
// ═══════════════════════════════════════════════════════════════

import {
  AgentRole,
  AgentTaskInput,
  AgentTaskOutput,
  AgentExecutionContext,
} from './agent-definition.interface.js';
import { SpecializedAgent } from './specialized-agent.js';
import { GitWorktreeManager } from './isolation/git-worktree.manager.js';
import { AgentWhiteboard } from './coordination/agent-whiteboard.js';
import { CoreEventHub } from '../core/core-event-hub.js';
import { PlanTask } from '../planning/plan.interface.js';
import { DAGOrchestrator } from '../planning/dag-orchestrator.js';

export class SwarmCoordinator {
  private static instance: SwarmCoordinator;
  private activeAgents = new Map<string, SpecializedAgent>();
  private activeWorktrees = new Map<string, { worktreePath: string; branch: string; repoPath: string }>();

  private constructor() {}

  public static getInstance(): SwarmCoordinator {
    if (!SwarmCoordinator.instance) {
      SwarmCoordinator.instance = new SwarmCoordinator();
    }
    return SwarmCoordinator.instance;
  }

  /**
   * Despliega un agente especializado en el enjambre con su contexto de ejecución.
   */
  public async spawnAgent(
    role: AgentRole,
    workspaceDir: string,
    options?: {
      useGitWorktree?: boolean;
      taskId?: string;
      planId?: string;
    }
  ): Promise<SpecializedAgent> {
    const agentId = `${role.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    let worktreePath: string | undefined = undefined;

    if (options?.useGitWorktree) {
      try {
        const wt = await GitWorktreeManager.createWorktree(workspaceDir, agentId);
        worktreePath = wt.worktreePath;
        this.activeWorktrees.set(agentId, { ...wt, repoPath: workspaceDir });
      } catch (err) {
        // Fallback a ejecución en workspace si el repositorio no admite worktree
        worktreePath = undefined;
      }
    }

    const context: AgentExecutionContext = {
      agentId,
      role,
      workspaceDir,
      worktreePath,
      taskId: options?.taskId,
      planId: options?.planId,
    };

    const agent = new SpecializedAgent(role, context);
    this.activeAgents.set(agentId, agent);

    try {
      CoreEventHub.getInstance().publish({
        type: 'AGENT_STATE_CHANGED',
        data: {
          agentId,
          role,
          status: agent.getStatus(),
          worktreePath,
        },
      });
    } catch {}

    return agent;
  }

  /**
   * Ejecuta una tarea única asignada al rol idóneo en el enjambre.
   */
  public async executeTaskWithRole(
    role: AgentRole,
    input: AgentTaskInput,
    workspaceDir: string,
    useGitWorktree = false
  ): Promise<AgentTaskOutput> {
    const agent = await this.spawnAgent(role, workspaceDir, { useGitWorktree });
    try {
      const output = await agent.executeTask(input);
      return output;
    } finally {
      await this.terminateAgent(agent.agentId);
    }
  }

  /**
   * Ejecuta un conjunto de tareas independientes en ondas paralelas concurrentes,
   * asignando a cada una su agente especializado correspondiente y evitando
   * colisiones de archivos.
   */
  public async executeConcurrentTasks(
    tasks: PlanTask[],
    workspaceDir: string,
    customExecutor?: (agent: SpecializedAgent, task: PlanTask) => Promise<AgentTaskOutput>
  ): Promise<AgentTaskOutput[]> {
    const waves = DAGOrchestrator.scheduleParallelWaves(tasks);
    const results: AgentTaskOutput[] = [];

    for (const wave of waves) {
      const wavePromises = wave.map(async (task) => {
        // Si la tarea modifica archivos, habilitar worktree aislado
        const requiresIsolation = task.affectedFiles.length > 0;
        const agent = await this.spawnAgent(task.assignedAgent, workspaceDir, {
          useGitWorktree: requiresIsolation,
          taskId: task.id,
        });

        try {
          if (customExecutor) {
            return await customExecutor(agent, task);
          } else {
            return await agent.executeTask({
              taskDescription: `${task.title}\n${task.description}`,
              targetFiles: task.affectedFiles,
            });
          }
        } finally {
          await this.terminateAgent(agent.agentId);
        }
      });

      const waveResults = await Promise.all(wavePromises);
      results.push(...waveResults);
    }

    return results;
  }

  /**
   * Da de baja un agente y limpia sus recursos y worktrees asociados.
   */
  public async terminateAgent(agentId: string): Promise<void> {
    this.activeAgents.delete(agentId);

    const wt = this.activeWorktrees.get(agentId);
    if (wt) {
      await GitWorktreeManager.removeWorktree(wt.repoPath, wt.worktreePath, true, wt.branch);
      this.activeWorktrees.delete(agentId);
    }
  }

  public getActiveAgents(): SpecializedAgent[] {
    return Array.from(this.activeAgents.values());
  }

  public getWhiteboard(): AgentWhiteboard {
    return AgentWhiteboard.getInstance();
  }
}
