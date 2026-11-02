// ═══════════════════════════════════════════════════════════════
// KODARA AUTONOMOUS PLANNING ENGINE: Core Engine & SQLite Persistence
// "Your Code. Your AI. Your Rules."
// Motor central de planificación jerárquica con dependencias DAG,
// persistencia SQLite, gestión de estados y exportación markdown.
// ═══════════════════════════════════════════════════════════════

import { getDb } from '../db/index.js';
import { CoreEventHub } from '../core/core-event-hub.js';
import {
  HierarchicalPlan,
  PlanCreationInput,
  PlanStatus,
  PlanTask,
} from './plan.interface.js';
import { DAGOrchestrator } from './dag-orchestrator.js';
import { ReplanningEngine } from './replanning-engine.js';

export class AutonomousPlanningEngine {
  private static instance: AutonomousPlanningEngine;
  private initialized = false;

  private constructor() {}

  public static getInstance(): AutonomousPlanningEngine {
    if (!AutonomousPlanningEngine.instance) {
      AutonomousPlanningEngine.instance = new AutonomousPlanningEngine();
    }
    return AutonomousPlanningEngine.instance;
  }

  public async init(): Promise<void> {
    if (this.initialized) return;
    const db = await getDb();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS kodara_hierarchical_plans (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        project_name TEXT NOT NULL,
        project_path TEXT NOT NULL,
        title TEXT NOT NULL,
        objective TEXT NOT NULL,
        complexity TEXT NOT NULL,
        status TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    try {
      await db.execute(
        `CREATE INDEX IF NOT EXISTS idx_kodara_hierarchical_plans_proj ON kodara_hierarchical_plans(project_id)`
      );
    } catch {}
    this.initialized = true;
  }

  /**
   * Crea un nuevo plan de trabajo jerárquico formal y lo persiste en la base de datos.
   */
  public async createPlan(input: PlanCreationInput): Promise<HierarchicalPlan> {
    await this.init();

    const planId = `PLAN-H-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    const tasks: PlanTask[] = input.tasks.map((t, idx) => ({
      id: t.id || `TASK-${idx + 1}`,
      title: t.title,
      description: t.description || '',
      assignedAgent: t.assignedAgent || 'DEVELOPER',
      status: t.status || 'PENDING',
      dependencies: t.dependencies || [],
      affectedFiles: t.affectedFiles || [],
      acceptanceCriteria: t.acceptanceCriteria || [],
      subtasks: t.subtasks || [],
    }));

    // Validar integridad del DAG
    const validation = DAGOrchestrator.validateDAG(tasks);
    if (!validation.isValid) {
      throw new Error(`Grafo de tareas inválido: ${validation.error}`);
    }

    const plan: HierarchicalPlan = {
      id: planId,
      title: input.title,
      objective: input.objective,
      projectAnalysis: input.projectAnalysis || `Análisis inicial del proyecto ${input.projectName} en ${input.projectPath}.`,
      requirements: input.requirements || [input.objective],
      proposedArchitecture: input.proposedArchitecture || 'Arquitectura modular desacoplada con agentes especializados.',
      tasks,
      risks: input.risks || ['Posibles inconsistencias en dependencias externas o APIs locales.'],
      acceptanceCriteria: input.acceptanceCriteria || ['Compilación limpia exitosa', 'Pruebas unitarias aprobadas al 100%'],
      requiredTests: input.requiredTests || ['bun test', 'cargo test'],
      complexityEstimation: input.complexityEstimation || 'MEDIUM',
      status: 'PLANNED',
      projectId: input.projectId,
      projectName: input.projectName,
      projectPath: input.projectPath,
      createdAt: now,
      updatedAt: now,
      explanation: input.explanation || `Este plan descompone el objetivo "${input.objective}" en ${tasks.length} tareas independientes estructuradas en DAG.`,
      replanningHistory: [],
    };

    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO kodara_hierarchical_plans
        (id, project_id, project_name, project_path, title, objective, complexity, status, data_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        plan.id,
        plan.projectId,
        plan.projectName,
        plan.projectPath,
        plan.title,
        plan.objective,
        plan.complexityEstimation,
        plan.status,
        JSON.stringify(plan),
        plan.createdAt,
        plan.updatedAt,
      ],
    });

    try {
      CoreEventHub.getInstance().publish({
        type: 'PLAN_CREATED',
        data: { planId: plan.id, title: plan.title, status: plan.status },
      });
    } catch {}

    return plan;
  }

  public async getPlan(planId: string): Promise<HierarchicalPlan | null> {
    await this.init();
    const db = await getDb();
    const res = await db.execute({
      sql: `SELECT data_json FROM kodara_hierarchical_plans WHERE id = ?`,
      args: [planId],
    });
    if (!res.rows || res.rows.length === 0) return null;
    const row: any = res.rows[0];
    const dataJson = typeof row.data_json === 'string' ? row.data_json : (row[0] as string);
    return JSON.parse(dataJson);
  }

  public async listPlans(projectId?: string): Promise<HierarchicalPlan[]> {
    await this.init();
    const db = await getDb();
    const res = projectId
      ? await db.execute({
          sql: `SELECT data_json FROM kodara_hierarchical_plans WHERE project_id = ? ORDER BY created_at DESC`,
          args: [projectId],
        })
      : await db.execute(`SELECT data_json FROM kodara_hierarchical_plans ORDER BY created_at DESC`);

    return res.rows.map((row: any) => {
      const json = typeof row.data_json === 'string' ? row.data_json : (row[0] as string);
      return JSON.parse(json);
    });
  }

  public async updatePlan(planId: string, updates: Partial<HierarchicalPlan>): Promise<HierarchicalPlan> {
    const existing = await this.getPlan(planId);
    if (!existing) {
      throw new Error(`Plan "${planId}" no encontrado.`);
    }

    const updated: HierarchicalPlan = {
      ...existing,
      ...updates,
      id: existing.id, // Preservar ID
      updatedAt: new Date().toISOString(),
    };

    if (updates.tasks) {
      const validation = DAGOrchestrator.validateDAG(updated.tasks);
      if (!validation.isValid) {
        throw new Error(`Grafo de tareas inválido: ${validation.error}`);
      }
    }

    const db = await getDb();
    await db.execute({
      sql: `UPDATE kodara_hierarchical_plans
       SET title = ?, objective = ?, complexity = ?, status = ?, data_json = ?, updated_at = ?
       WHERE id = ?`,
      args: [
        updated.title,
        updated.objective,
        updated.complexityEstimation,
        updated.status,
        JSON.stringify(updated),
        updated.updatedAt,
        updated.id,
      ],
    });

    return updated;
  }

  public async transitionStatus(planId: string, newStatus: PlanStatus): Promise<HierarchicalPlan> {
    return await this.updatePlan(planId, { status: newStatus });
  }

  public async getReadyTasks(planId: string): Promise<PlanTask[]> {
    const plan = await this.getPlan(planId);
    if (!plan) throw new Error(`Plan "${planId}" no encontrado.`);
    return DAGOrchestrator.getReadyTasks(plan.tasks);
  }

  public async replanOnFailure(planId: string, failedTaskId: string, errorReason: string): Promise<HierarchicalPlan> {
    const plan = await this.getPlan(planId);
    if (!plan) throw new Error(`Plan "${planId}" no encontrado.`);

    const replanned = ReplanningEngine.replanOnTaskFailure(plan, failedTaskId, errorReason);
    await this.updatePlan(planId, replanned);

    try {
      CoreEventHub.getInstance().publish({
        type: 'PLAN_STATUS_CHANGED',
        data: {
          planId,
          status: replanned.status,
          remediationEvent: replanned.replanningHistory?.[replanned.replanningHistory.length - 1],
        },
      });
    } catch {}

    return replanned;
  }

  /**
   * Genera la representación en Markdown profesional del plan de trabajo jerárquico.
   */
  public renderPlanMarkdown(plan: HierarchicalPlan): string {
    const lines: string[] = [];

    lines.push(`# 📋 Plan de Trabajo Autónomo: ${plan.title}`);
    lines.push(`**ID**: \`${plan.id}\` | **Estado**: \`${plan.status}\` | **Complejidad**: \`${plan.complexityEstimation}\``);
    lines.push(`**Proyecto**: *${plan.projectName}* (\`${plan.projectPath}\`)\n`);

    lines.push(`## 🎯 1. Objetivo Principal`);
    lines.push(`${plan.objective}\n`);

    lines.push(`## 💡 2. Explicación y Justificación Técnica`);
    lines.push(`${plan.explanation}\n`);

    lines.push(`## 🔍 3. Análisis del Proyecto y Arquitectura Propuesta`);
    lines.push(`- **Análisis**: ${plan.projectAnalysis}`);
    lines.push(`- **Arquitectura**: ${plan.proposedArchitecture}\n`);

    lines.push(`## 📦 4. Requisitos y Criterios de Aceptación`);
    lines.push(`### Requisitos:`);
    plan.requirements.forEach((req) => lines.push(`- ${req}`));
    lines.push(`\n### Criterios de Aceptación:`);
    plan.acceptanceCriteria.forEach((crit) => lines.push(`- ✅ ${crit}`));
    lines.push('');

    lines.push(`## 🛠️ 5. Grafo de Tareas de Ingeniería (DAG)`);
    plan.tasks.forEach((task, idx) => {
      const statusIcon =
        task.status === 'COMPLETED'
          ? '✅'
          : task.status === 'IN_PROGRESS'
          ? '⏳'
          : task.status === 'FAILED'
          ? '❌'
          : task.status === 'BLOCKED'
          ? '🚫'
          : '⚪';

      lines.push(`### ${idx + 1}. [${task.id}] ${statusIcon} ${task.title}`);
      lines.push(`- **Agente Responsable**: \`${task.assignedAgent}\``);
      lines.push(`- **Estado**: \`${task.status}\``);
      lines.push(`- **Dependencias**: ${task.dependencies.length > 0 ? task.dependencies.map((d) => `\`${d}\``).join(', ') : '*Ninguna (Tarea inicial)*'}`);
      lines.push(`- **Archivos Afectados**: ${task.affectedFiles.length > 0 ? task.affectedFiles.map((f) => `\`${f}\``).join(', ') : '*A determinar*'}`);
      lines.push(`- **Descripción**: ${task.description}`);

      if (task.subtasks && task.subtasks.length > 0) {
        lines.push(`- **Subtareas**:`);
        task.subtasks.forEach((sub) => {
          lines.push(`  - [${sub.completed ? 'x' : ' '}] ${sub.title}`);
        });
      }

      if (task.outputResult) {
        lines.push(`- **Resultado**: ${task.outputResult}`);
      }
      if (task.errorDetails) {
        lines.push(`- **Detalle de Error**: ⚠️ ${task.errorDetails}`);
      }
      lines.push('');
    });

    lines.push(`## ⚠️ 6. Riesgos y Mitigaciones`);
    plan.risks.forEach((risk) => lines.push(`- ⚠️ ${risk}`));
    lines.push('');

    lines.push(`## 🧪 7. Pruebas y Validación Requerida`);
    plan.requiredTests.forEach((test) => lines.push(`- 🧪 \`${test}\``));
    lines.push('');

    if (plan.replanningHistory && plan.replanningHistory.length > 0) {
      lines.push(`## 🔄 8. Historial de Replanificación Adaptativa`);
      plan.replanningHistory.forEach((ev) => {
        lines.push(`- **[${ev.timestamp}]** Tarea fallida: \`${ev.failedTaskId}\` | Causa: *${ev.triggerReason}*`);
        lines.push(`  - **Acción Correctiva**: ${ev.remediationAction}`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Genera de forma inteligente un plan de trabajo jerárquico a partir de
   * un requerimiento en lenguaje natural.
   */
  public async generatePlanFromObjective(params: {
    objective: string;
    projectId: string;
    projectName: string;
    projectPath: string;
    explanation?: string;
  }): Promise<HierarchicalPlan> {
    const tasks: Array<Omit<PlanTask, 'status'>> = [
      {
        id: 'TASK-1-AUDIT',
        title: 'Auditoría del Entorno, Análisis de Dependencias y Mapeo de Archivos',
        description: `Inspeccionar el repositorio en ${params.projectPath} y verificar el estado actual de los archivos y herramientas.`,
        assignedAgent: 'ARCHITECT',
        dependencies: [],
        affectedFiles: [],
        acceptanceCriteria: ['Mapa de arquitectura documentado', 'Sin dependencias rotas'],
        subtasks: [
          { id: 'sub-audit-1', title: 'Explorar árbol de directorios', completed: false },
          { id: 'sub-audit-2', title: 'Verificar compatibilidad de entorno', completed: false },
        ],
      },
      {
        id: 'TASK-2-CODE',
        title: 'Implementación y Modificación de Código Fuente',
        description: `Desarrollar los cambios requeridos para lograr el objetivo: ${params.objective}`,
        assignedAgent: 'DEVELOPER',
        dependencies: ['TASK-1-AUDIT'],
        affectedFiles: [],
        acceptanceCriteria: ['Código desarrollado y tipado sin errores de sintaxis'],
        subtasks: [
          { id: 'sub-code-1', title: 'Escribir modificaciones de código', completed: false },
          { id: 'sub-code-2', title: 'Refactorizar y documentar cambios', completed: false },
        ],
      },
      {
        id: 'TASK-3-SECURITY',
        title: 'Auditoría SAST y Validación de Seguridad Defensiva',
        description: 'Escanear el código en busca de vulnerabilidades, inyecciones y violaciones Zero-Bleed.',
        assignedAgent: 'SECURITY',
        dependencies: ['TASK-2-CODE'],
        affectedFiles: [],
        acceptanceCriteria: ['0 hallazgos HIGH o CRITICAL en análisis estático'],
        subtasks: [
          { id: 'sub-sec-1', title: 'Ejecutar escaneo SAST', completed: false },
          { id: 'sub-sec-2', title: 'Validar confinamiento de paths', completed: false },
        ],
      },
      {
        id: 'TASK-4-VERIFICATION',
        title: 'Compilación y Ejecución de Pruebas Unitarias e Integración',
        description: 'Compilar el proyecto y ejecutar las suites de pruebas para certificar el funcionamiento.',
        assignedAgent: 'TESTER',
        dependencies: ['TASK-3-SECURITY'],
        affectedFiles: [],
        acceptanceCriteria: ['100% de las pruebas aprobadas con código de salida 0'],
        subtasks: [
          { id: 'sub-test-1', title: 'Compilar proyecto', completed: false },
          { id: 'sub-test-2', title: 'Ejecutar suite de pruebas', completed: false },
        ],
      },
      {
        id: 'TASK-5-REVIEW',
        title: 'Revisión Final de Calidad y Consolidación en Memoria del Proyecto',
        description: 'Revisar la entrega de software, registrar lecciones técnicas y cerrar la ejecución.',
        assignedAgent: 'REVIEWER',
        dependencies: ['TASK-4-VERIFICATION'],
        affectedFiles: [],
        acceptanceCriteria: ['Lecciones aprendidas consolidadas en Kodara Project Memory'],
        subtasks: [
          { id: 'sub-rev-1', title: 'Verificar cumplimiento de requisitos', completed: false },
          { id: 'sub-rev-2', title: 'Persistir lección en Project Memory', completed: false },
        ],
      },
    ];

    return await this.createPlan({
      projectId: params.projectId,
      projectName: params.projectName,
      projectPath: params.projectPath,
      title: `Plan Autónomo: ${params.objective.slice(0, 50)}...`,
      objective: params.objective,
      explanation: params.explanation || `Se descompuso el objetivo en 5 tareas encadenadas en un DAG estricto (Auditoría -> Código -> Seguridad -> Pruebas -> Revisión).`,
      tasks,
      complexityEstimation: 'MEDIUM',
    });
  }
}
