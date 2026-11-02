// ═══════════════════════════════════════════════════════════════
// KODARA TEST SUITE: Multi-Agent System (Fase 6)
// "Your Code. Your AI. Your Rules."
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import { resolve } from 'path';
import { existsSync } from 'fs';
import {
  SPECIALIZED_AGENT_PROFILES,
  SpecializedAgent,
  SwarmCoordinator,
  AgentWhiteboard,
  GitWorktreeManager,
  AgentRole,
} from '../index.js';

describe('Multi-Agent System & Specialized Swarms (Fase 6)', () => {
  const coordinator = SwarmCoordinator.getInstance();
  const whiteboard = AgentWhiteboard.getInstance();
  const repoRoot = resolve(process.cwd(), '..'); // Repositorio Git principal

  it('1. Define formalmente los 10 agentes especializados con identidades completas', () => {
    const roles: AgentRole[] = [
      'ORCHESTRATOR',
      'ARCHITECT',
      'PLANNER',
      'DEVELOPER',
      'DEBUGGER',
      'TESTER',
      'SECURITY',
      'REVIEWER',
      'DOCUMENTATION',
      'SYSTEM_OPERATOR',
    ];

    expect(Object.keys(SPECIALIZED_AGENT_PROFILES).length).toBe(10);

    for (const role of roles) {
      const profile = SPECIALIZED_AGENT_PROFILES[role];
      expect(profile).toBeDefined();
      expect(profile.role).toBe(role);
      expect(profile.name.length).toBeGreaterThan(5);
      expect(profile.identity.length).toBeGreaterThan(10);
      expect(profile.objective.length).toBeGreaterThan(10);
      expect(profile.systemInstructions.length).toBeGreaterThan(20);
      expect(profile.defaultModel).toContain('deepseek-r1');
      expect(Array.isArray(profile.allowedTools)).toBe(true);
      expect(profile.permissions).toBeDefined();
    }
  });

  it('2. Aplica el principio de mínimo privilegio y restricción de herramientas por rol', () => {
    // REVIEWER no puede modificar archivos ni ejecutar comandos
    const reviewer = new SpecializedAgent('REVIEWER', {
      agentId: 'rev-01',
      role: 'REVIEWER',
      workspaceDir: '/tmp',
    });
    expect(reviewer.canUseTool('write_file').allowed).toBe(false);
    expect(reviewer.canUseTool('run_command').allowed).toBe(false);
    expect(reviewer.canUseTool('read_file').allowed).toBe(true);

    // DEVELOPER puede leer, escribir y ejecutar comandos
    const developer = new SpecializedAgent('DEVELOPER', {
      agentId: 'dev-01',
      role: 'DEVELOPER',
      workspaceDir: '/tmp',
    });
    expect(developer.canUseTool('write_file').allowed).toBe(true);
    expect(developer.canUseTool('run_command').allowed).toBe(true);
    expect(developer.canUseTool('git_operation').allowed).toBe(true);

    // SECURITY no puede escribir archivos pero sí ejecutar comandos (escáneres SAST)
    const security = new SpecializedAgent('SECURITY', {
      agentId: 'sec-01',
      role: 'SECURITY',
      workspaceDir: '/tmp',
    });
    expect(security.canUseTool('write_file').allowed).toBe(false);
    expect(security.canUseTool('run_command').allowed).toBe(true);
  });

  it('3. AgentWhiteboard: Soporta publicación de notas, filtrado y bloqueos exclusivos de archivos', () => {
    whiteboard.clearNotes();

    const note1 = whiteboard.postNote({
      fromAgentId: 'dev-01',
      fromRole: 'DEVELOPER',
      topic: 'INTERFACE_DESIGN',
      content: 'Contrato de UserProfile completado.',
    });
    expect(note1.id).toContain('note-');

    const note2 = whiteboard.postNote({
      fromAgentId: 'sec-01',
      fromRole: 'SECURITY',
      toAgentId: 'dev-01',
      topic: 'VULNERABILITY_ALERT',
      content: 'Detectado potencial SQLi en consulta de login.',
    });

    // Filtros
    const devNotes = whiteboard.getNotes({ toAgentId: 'dev-01' });
    expect(devNotes.some((n) => n.id === note2.id)).toBe(true);

    const secNotes = whiteboard.getNotes({ fromRole: 'SECURITY' });
    expect(secNotes.length).toBe(1);

    // Sistema de Bloqueo Exclusivo de Archivos
    const acquired = whiteboard.acquireFileLock('src/auth.ts', 'dev-01');
    expect(acquired).toBe(true);

    // Otro agente intenta bloquear el mismo archivo
    const collision = whiteboard.acquireFileLock('src/auth.ts', 'dev-02');
    expect(collision).toBe(false);

    const lockStatus = whiteboard.isFileLocked('src/auth.ts');
    expect(lockStatus.locked).toBe(true);
    expect(lockStatus.heldBy).toBe('dev-01');

    // Liberar bloqueo
    const released = whiteboard.releaseFileLock('src/auth.ts', 'dev-01');
    expect(released).toBe(true);
    expect(whiteboard.isFileLocked('src/auth.ts').locked).toBe(false);
  });

  it('4. GitWorktreeManager: Gestiona worktrees aislados y detecta el repositorio', async () => {
    const worktrees = GitWorktreeManager.listWorktrees(repoRoot);
    expect(Array.isArray(worktrees)).toBe(true);
    expect(worktrees.length).toBeGreaterThanOrEqual(1);

    // Crear un worktree temporal aislado
    const testAgentId = `test_agent_${Date.now()}`;
    const wt = await GitWorktreeManager.createWorktree(repoRoot, testAgentId);

    expect(wt.worktreePath).toBeDefined();
    expect(existsSync(wt.worktreePath)).toBe(true);

    // Limpiar worktree
    await GitWorktreeManager.removeWorktree(repoRoot, wt.worktreePath, true, wt.branch);
    expect(existsSync(wt.worktreePath)).toBe(false);
  });

  it('5. SwarmCoordinator: Despliega agentes especializados y ejecuta tareas concurrentes sin colisión', async () => {
    const tasks = [
      {
        id: 'T1',
        title: 'Diseño de Módulo A',
        description: '',
        assignedAgent: 'ARCHITECT' as const,
        status: 'PENDING' as const,
        dependencies: [],
        affectedFiles: ['src/a.ts'],
        acceptanceCriteria: [],
      },
      {
        id: 'T2',
        title: 'Implementación de Módulo B',
        description: '',
        assignedAgent: 'DEVELOPER' as const,
        status: 'PENDING' as const,
        dependencies: [],
        affectedFiles: ['src/b.ts'],
        acceptanceCriteria: [],
      },
    ];

    // Ejecutar concurrentemente con simulador de ejecución para pruebas rápidas
    const results = await coordinator.executeConcurrentTasks(tasks, repoRoot, async (agent, task) => {
      return {
        agentId: agent.agentId,
        role: agent.profile.role,
        success: true,
        summary: `Ejecutada tarea ${task.id} por ${agent.profile.role}`,
        durationMs: 5,
      };
    });

    expect(results.length).toBe(2);
    expect(results.map((r) => r.role).sort()).toEqual(['ARCHITECT', 'DEVELOPER']);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(true);

    // Verificar que los agentes se limpiaron adecuadamente
    expect(coordinator.getActiveAgents().length).toBe(0);
  });
});
