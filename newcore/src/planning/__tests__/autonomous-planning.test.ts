// ═══════════════════════════════════════════════════════════════
// KODARA TEST SUITE: Autonomous Planning Engine (Fase 5)
// "Your Code. Your AI. Your Rules."
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import {
  AutonomousPlanningEngine,
  DAGOrchestrator,
  ReplanningEngine,
  PlanTask,
  PlanStatus,
} from '../index.js';

describe('Autonomous Planning Engine & DAG Orchestrator (Fase 5)', () => {
  const planner = AutonomousPlanningEngine.getInstance();
  const testProjectId = `proj_test_${Date.now()}`;

  it('1. Crea un plan jerárquico formal con validación DAG y persistencia en SQLite', async () => {
    const plan = await planner.createPlan({
      projectId: testProjectId,
      projectName: 'TestProject',
      projectPath: '/tmp/test-project',
      title: 'Plan de Refactorización de Arquitectura',
      objective: 'Modularizar el núcleo y desacoplar controladores',
      complexityEstimation: 'HIGH',
      explanation: 'El sistema requiere modularización para soportar múltiples agentes autónomos.',
      tasks: [
        {
          id: 'T1',
          title: 'Auditoría y Mapeo de Componentes',
          description: 'Identificar acoplamientos en server.ts',
          assignedAgent: 'ARCHITECT',
          dependencies: [],
          affectedFiles: ['src/server.ts'],
          acceptanceCriteria: ['Documento de arquitectura completado'],
        },
        {
          id: 'T2',
          title: 'Implementación de Controladores',
          description: 'Extraer lógica a controladores dedicados',
          assignedAgent: 'DEVELOPER',
          dependencies: ['T1'],
          affectedFiles: ['src/controllers/test.controller.ts'],
          acceptanceCriteria: ['Rutas registradas y funcionales'],
        },
        {
          id: 'T3',
          title: 'Verificación SAST y Pruebas Unitarias',
          description: 'Ejecutar suite de pruebas y escaneo estático',
          assignedAgent: 'TESTER',
          dependencies: ['T2'],
          affectedFiles: [],
          acceptanceCriteria: ['100% de pruebas aprobadas'],
        },
      ],
    });

    expect(plan.id).toContain('PLAN-H-');
    expect(plan.status).toBe('PLANNED');
    expect(plan.tasks.length).toBe(3);
    expect(plan.complexityEstimation).toBe('HIGH');
    expect(plan.explanation).toContain('El sistema requiere modularización');

    const retrieved = await planner.getPlan(plan.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(plan.id);
    expect(retrieved?.tasks.length).toBe(3);
  });

  it('2. Soporta los 9 estados dinámicos del ciclo de vida del plan', async () => {
    const plan = await planner.createPlan({
      projectId: testProjectId,
      projectName: 'StateProject',
      projectPath: '/tmp/state-project',
      title: 'Validación de Estados',
      objective: 'Verificar transición formal de estados',
      tasks: [
        {
          id: 'ST1',
          title: 'Tarea Simple',
          description: '',
          assignedAgent: 'DEVELOPER',
          dependencies: [],
          affectedFiles: [],
          acceptanceCriteria: [],
        },
      ],
    });

    const states: PlanStatus[] = [
      'PENDING',
      'ANALYZING',
      'PLANNED',
      'AWAITING_APPROVAL',
      'IN_PROGRESS',
      'TESTING',
      'COMPLETED',
      'FAILED',
      'BLOCKED',
    ];

    for (const state of states) {
      const updated = await planner.transitionStatus(plan.id, state);
      expect(updated.status).toBe(state);
    }
  });

  it('3. DAGOrchestrator: Detecta ciclos en las dependencias y bloquea la creación', () => {
    const cyclicTasks: PlanTask[] = [
      {
        id: 'A',
        title: 'Tarea A',
        description: '',
        assignedAgent: 'DEVELOPER',
        status: 'PENDING',
        dependencies: ['B'], // Dependencia circular A -> B -> A
        affectedFiles: [],
        acceptanceCriteria: [],
      },
      {
        id: 'B',
        title: 'Tarea B',
        description: '',
        assignedAgent: 'DEVELOPER',
        status: 'PENDING',
        dependencies: ['A'],
        affectedFiles: [],
        acceptanceCriteria: [],
      },
    ];

    const validation = DAGOrchestrator.validateDAG(cyclicTasks);
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('Ciclo detectado');
  });

  it('4. DAGOrchestrator: Detecta dependencias inexistentes', () => {
    const brokenTasks: PlanTask[] = [
      {
        id: 'T1',
        title: 'Tarea 1',
        description: '',
        assignedAgent: 'DEVELOPER',
        status: 'PENDING',
        dependencies: ['NON_EXISTENT_TASK'],
        affectedFiles: [],
        acceptanceCriteria: [],
      },
    ];

    const validation = DAGOrchestrator.validateDAG(brokenTasks);
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('depende de una tarea inexistente');
  });

  it('5. DAGOrchestrator: Calcula el orden topológico y las tareas listas para ejecución', () => {
    const tasks: PlanTask[] = [
      { id: 'T3', title: 'Paso 3', description: '', assignedAgent: 'TESTER', status: 'PENDING', dependencies: ['T2'], affectedFiles: [], acceptanceCriteria: [] },
      { id: 'T1', title: 'Paso 1', description: '', assignedAgent: 'ARCHITECT', status: 'COMPLETED', dependencies: [], affectedFiles: [], acceptanceCriteria: [] },
      { id: 'T2', title: 'Paso 2', description: '', assignedAgent: 'DEVELOPER', status: 'PENDING', dependencies: ['T1'], affectedFiles: [], acceptanceCriteria: [] },
    ];

    const topo = DAGOrchestrator.getTopologicalOrder(tasks);
    expect(topo.map((t) => t.id)).toEqual(['T1', 'T2', 'T3']);

    // Ya que T1 está COMPLETED, T2 debe estar lista (READY), pero T3 aún no (depende de T2)
    const ready = DAGOrchestrator.getReadyTasks(tasks);
    expect(ready.map((t) => t.id)).toEqual(['T2']);
  });

  it('6. DAGOrchestrator: Agrupa tareas concurrentes evitando colisiones de archivos', () => {
    const readyTasks: PlanTask[] = [
      { id: 'A', title: 'Task A', description: '', assignedAgent: 'DEVELOPER', status: 'PENDING', dependencies: [], affectedFiles: ['src/a.ts'], acceptanceCriteria: [] },
      { id: 'B', title: 'Task B', description: '', assignedAgent: 'DEVELOPER', status: 'PENDING', dependencies: [], affectedFiles: ['src/b.ts'], acceptanceCriteria: [] },
      { id: 'C', title: 'Task C', description: '', assignedAgent: 'DEVELOPER', status: 'PENDING', dependencies: [], affectedFiles: ['src/a.ts'], acceptanceCriteria: [] }, // Colisiona con A
    ];

    const waves = DAGOrchestrator.scheduleParallelWaves(readyTasks);
    expect(waves.length).toBe(2);
    // Onda 1 puede ejecutar C y B (o A y B) en paralelo
    expect(waves[0].length).toBe(2);
    // Onda 2 ejecuta la que tenía colisión de archivo
    expect(waves[1].length).toBe(1);
  });

  it('7. ReplanningEngine: Replanifica adaptativamente ante fallos e inyecta tareas de remediación', async () => {
    const plan = await planner.createPlan({
      projectId: testProjectId,
      projectName: 'ReplanProject',
      projectPath: '/tmp/replan',
      title: 'Plan de Replanificación',
      objective: 'Verificar auto-reparación y reconexión DAG',
      tasks: [
        { id: 'SETUP', title: 'Preparación', description: '', assignedAgent: 'ARCHITECT', status: 'COMPLETED', dependencies: [], affectedFiles: [], acceptanceCriteria: [] },
        { id: 'COMPILE', title: 'Compilación', description: '', assignedAgent: 'DEVELOPER', status: 'IN_PROGRESS', dependencies: ['SETUP'], affectedFiles: ['main.rs'], acceptanceCriteria: [] },
        { id: 'DEPLOY', title: 'Despliegue', description: '', assignedAgent: 'SYSTEM_OPERATOR', status: 'PENDING', dependencies: ['COMPILE'], affectedFiles: ['main.rs'], acceptanceCriteria: [] },
      ],
    });

    const replanned = await planner.replanOnFailure(plan.id, 'COMPILE', 'error[E0425]: cannot find value `config` in this scope');

    expect(replanned.status).toBe('IN_PROGRESS');
    const failedTask = replanned.tasks.find((t) => t.id === 'COMPILE');
    expect(failedTask?.status).toBe('FAILED');
    expect(failedTask?.errorDetails).toContain('error[E0425]');

    // Se debe haber creado una tarea de remediación asignada a DEBUGGER
    const remediationTask = replanned.tasks.find((t) => t.id.startsWith('REMEDIATION-COMPILE'));
    expect(remediationTask).toBeDefined();
    expect(remediationTask?.assignedAgent).toBe('DEBUGGER');

    // La tarea DEPLOY ahora debe depender de la remediación, no de la tarea fallida
    const deployTask = replanned.tasks.find((t) => t.id === 'DEPLOY');
    expect(deployTask?.dependencies).toContain(remediationTask!.id);
    expect(deployTask?.dependencies).not.toContain('COMPILE');

    // El evento quedó registrado en replanningHistory
    expect(replanned.replanningHistory?.length).toBe(1);
    expect(replanned.replanningHistory?.[0].failedTaskId).toBe('COMPILE');
  });

  it('8. Renderiza el plan completo en Markdown estructurado profesional', async () => {
    const plan = await planner.createPlan({
      projectId: testProjectId,
      projectName: 'MarkdownProject',
      projectPath: '/workspace',
      title: 'Plan de Demostración Markdown',
      objective: 'Generar documentación visual completa',
      tasks: [
        {
          id: 'MD-1',
          title: 'Tarea con Subtareas',
          description: 'Verificar checklist',
          assignedAgent: 'DEVELOPER',
          dependencies: [],
          affectedFiles: ['src/index.ts'],
          acceptanceCriteria: ['Subtareas verificadas'],
          subtasks: [
            { id: 's1', title: 'Paso 1', completed: true },
            { id: 's2', title: 'Paso 2', completed: false },
          ],
        },
      ],
    });

    const md = planner.renderPlanMarkdown(plan);
    expect(md).toContain('# 📋 Plan de Trabajo Autónomo:');
    expect(md).toContain('## 🎯 1. Objetivo Principal');
    expect(md).toContain('## 💡 2. Explicación y Justificación Técnica');
    expect(md).toContain('## 🛠️ 5. Grafo de Tareas de Ingeniería (DAG)');
    expect(md).toContain('[x] Paso 1');
    expect(md).toContain('[ ] Paso 2');
  });

  it('9. generatePlanFromObjective: Descompone requerimientos en 5 etapas jerárquicas automáticas', async () => {
    const autoPlan = await planner.generatePlanFromObjective({
      objective: 'Implementar autenticación JWT con refresh tokens',
      projectId: testProjectId,
      projectName: 'AuthApp',
      projectPath: '/home/saghet/AuthApp',
    });

    expect(autoPlan.tasks.length).toBe(5);
    const agents = autoPlan.tasks.map((t) => t.assignedAgent);
    expect(agents).toEqual(['ARCHITECT', 'DEVELOPER', 'SECURITY', 'TESTER', 'REVIEWER']);

    // Verificar que el encadenamiento DAG sea estricto
    expect(autoPlan.tasks[0].dependencies).toEqual([]);
    expect(autoPlan.tasks[1].dependencies).toEqual(['TASK-1-AUDIT']);
    expect(autoPlan.tasks[2].dependencies).toEqual(['TASK-2-CODE']);
    expect(autoPlan.tasks[3].dependencies).toEqual(['TASK-3-SECURITY']);
    expect(autoPlan.tasks[4].dependencies).toEqual(['TASK-4-VERIFICATION']);
  });
});
