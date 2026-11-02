// ═══════════════════════════════════════════════════════════════
// KODARA AUTONOMOUS PLANNING ENGINE: Adaptive Replanning Engine
// "Your Code. Your AI. Your Rules."
// Diagnostica fallas en la ejecución de tareas, inyecta tareas de
// remediación dinámica y reconecta el grafo de dependencias DAG.
// ═══════════════════════════════════════════════════════════════

import {
  HierarchicalPlan,
  PlanTask,
  ReplanningEvent,
} from './plan.interface.js';
import { DAGOrchestrator } from './dag-orchestrator.js';

export class ReplanningEngine {
  /**
   * Ejecuta una replanificación adaptativa sobre un plan ante el fallo de una tarea.
   */
  public static replanOnTaskFailure(
    plan: HierarchicalPlan,
    failedTaskId: string,
    errorReason: string
  ): HierarchicalPlan {
    const failedTask = plan.tasks.find((t) => t.id === failedTaskId);
    if (!failedTask) {
      throw new Error(`Tarea con ID "${failedTaskId}" no encontrada en el plan.`);
    }

    failedTask.status = 'FAILED';
    failedTask.errorDetails = errorReason;

    // 1. Marcar tareas dependientes como bloqueadas inicialmente
    DAGOrchestrator.propagateBlockedStatus(failedTaskId, plan.tasks);

    // 2. Generar tarea de remediación adaptativa
    const fixTaskId = `REMEDIATION-${failedTaskId}-${Date.now().toString(36).substring(2, 6).toUpperCase()}`;
    const remediationTask: PlanTask = {
      id: fixTaskId,
      title: `Remediación Automática: Corregir falla en [${failedTask.title}]`,
      description: `Diagnóstico y reparación ante el error: ${errorReason}. Diseñado por el motor de replanificación de Kodara.`,
      assignedAgent: 'DEBUGGER',
      status: 'PENDING',
      dependencies: [...failedTask.dependencies],
      affectedFiles: [...failedTask.affectedFiles],
      acceptanceCriteria: [
        `Resolver la causa raíz: ${errorReason}`,
        `Superar las pruebas de regresión asociadas a ${failedTask.title}`,
      ],
      subtasks: [
        { id: `${fixTaskId}-sub1`, title: 'Inspección forense de logs y código fuente', completed: false },
        { id: `${fixTaskId}-sub2`, title: 'Aplicación de parche correctivo', completed: false },
        { id: `${fixTaskId}-sub3`, title: 'Verificación en sandbox', completed: false },
      ],
    };

    // 3. Reconectar dependencias en el grafo: las tareas bloqueadas ahora dependen de la tarea de remediación
    for (const t of plan.tasks) {
      if (t.dependencies.includes(failedTaskId)) {
        t.dependencies = t.dependencies.map((dep) => (dep === failedTaskId ? fixTaskId : dep));
        t.status = 'PENDING'; // Desbloquear para que espere la remediación
        t.errorDetails = undefined;
      }
    }

    // 4. Insertar la tarea de remediación en el plan
    plan.tasks.push(remediationTask);

    // 5. Registrar el evento en el historial de replanificación
    const replanEvent: ReplanningEvent = {
      id: `replan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      failedTaskId,
      triggerReason: errorReason,
      remediationAction: `Inyectada tarea de remediación ${fixTaskId} asignada al agente DEBUGGER con reconexión de dependencias.`,
      addedTaskIds: [fixTaskId],
    };

    if (!plan.replanningHistory) {
      plan.replanningHistory = [];
    }
    plan.replanningHistory.push(replanEvent);

    plan.status = 'IN_PROGRESS';
    plan.updatedAt = new Date().toISOString();

    return plan;
  }
}
