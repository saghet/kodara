// ═══════════════════════════════════════════════════════════════
// KODARA AUTONOMOUS PLANNING ENGINE: DAG Dependency Orchestrator
// "Your Code. Your AI. Your Rules."
// Resuelve dependencias en Grafos Acíclicos Dirigidos (DAG), detecta
// ciclos, calcula tareas ejecutables y aísla modificaciones de archivos.
// ═══════════════════════════════════════════════════════════════

import { PlanTask } from './plan.interface.js';

export interface DAGValidationResult {
  isValid: boolean;
  cycle?: string[];
  error?: string;
}

export class DAGOrchestrator {
  /**
   * Valida que el conjunto de tareas forme un Grafo Acíclico Dirigido (DAG) válido,
   * sin ciclos ni referencias a dependencias inexistentes.
   */
  public static validateDAG(tasks: PlanTask[]): DAGValidationResult {
    const taskMap = new Map<string, PlanTask>();
    for (const t of tasks) {
      taskMap.set(t.id, t);
    }

    // 1. Validar que todas las dependencias declaradas existan
    for (const t of tasks) {
      for (const depId of t.dependencies) {
        if (!taskMap.has(depId)) {
          return {
            isValid: false,
            error: `La tarea "${t.id}" depende de una tarea inexistente: "${depId}".`,
          };
        }
      }
    }

    // 2. Detección de ciclos mediante algoritmo de 3 colores (0 = Blanco, 1 = Gris, 2 = Negro)
    const visited = new Map<string, number>();
    const stack: string[] = [];

    const hasCycle = (taskId: string): boolean => {
      visited.set(taskId, 1); // Gris (en exploración actual)
      stack.push(taskId);

      const task = taskMap.get(taskId)!;
      for (const depId of task.dependencies) {
        const state = visited.get(depId) || 0;
        if (state === 1) {
          // Ciclo detectado
          stack.push(depId);
          return true;
        }
        if (state === 0 && hasCycle(depId)) {
          return true;
        }
      }

      visited.set(taskId, 2); // Negro (completamente explorado)
      stack.pop();
      return false;
    };

    for (const t of tasks) {
      if ((visited.get(t.id) || 0) === 0) {
        if (hasCycle(t.id)) {
          return {
            isValid: false,
            cycle: [...stack],
            error: `Ciclo detectado en las dependencias del plan: ${stack.join(' -> ')}`,
          };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Obtiene la lista de tareas listas para ser ejecutadas en este momento
   * (aquellas cuyas dependencias hayan alcanzado el estado 'COMPLETED').
   */
  public static getReadyTasks(tasks: PlanTask[]): PlanTask[] {
    const completedTaskIds = new Set(
      tasks.filter((t) => t.status === 'COMPLETED').map((t) => t.id)
    );

    return tasks.filter((task) => {
      if (task.status !== 'PENDING' && task.status !== 'READY') {
        return false;
      }
      return task.dependencies.every((depId) => completedTaskIds.has(depId));
    });
  }

  /**
   * Agrupa las tareas listas en ondas de ejecución paralela evitando conflictos
   * en archivos afectados concurrentes.
   */
  public static scheduleParallelWaves(readyTasks: PlanTask[]): PlanTask[][] {
    const waves: PlanTask[][] = [];
    const remaining = [...readyTasks];

    while (remaining.length > 0) {
      const currentWave: PlanTask[] = [];
      const waveFiles = new Set<string>();

      for (let i = remaining.length - 1; i >= 0; i--) {
        const candidate = remaining[i];
        // Verificar si algún archivo de esta tarea entra en colisión con la onda actual
        const hasConflict = candidate.affectedFiles.some((f) => waveFiles.has(f));

        if (!hasConflict) {
          currentWave.push(candidate);
          candidate.affectedFiles.forEach((f) => waveFiles.add(f));
          remaining.splice(i, 1);
        }
      }

      if (currentWave.length > 0) {
        waves.push(currentWave);
      } else {
        // En caso extremo de bloqueo mutuo, tomar al menos 1
        waves.push([remaining.pop()!]);
      }
    }

    return waves;
  }

  /**
   * Propaga el estado 'BLOCKED' a todas las tareas que dependen directa
   * o indirectamente de una tarea que ha fallado.
   */
  public static propagateBlockedStatus(failedTaskId: string, tasks: PlanTask[]): string[] {
    const blockedIds: string[] = [];
    const queue = [failedTaskId];

    while (queue.length > 0) {
      const currentFailed = queue.shift()!;
      for (const t of tasks) {
        if (t.dependencies.includes(currentFailed) && t.status !== 'FAILED' && t.status !== 'BLOCKED') {
          t.status = 'BLOCKED';
          t.errorDetails = `Bloqueada debido a falla en la dependencia previa: "${currentFailed}".`;
          blockedIds.push(t.id);
          queue.push(t.id);
        }
      }
    }

    return blockedIds;
  }

  /**
   * Genera el orden topológico completo de ejecución (Algoritmo de Kahn).
   */
  public static getTopologicalOrder(tasks: PlanTask[]): PlanTask[] {
    const validation = this.validateDAG(tasks);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();
    const taskMap = new Map<string, PlanTask>();

    for (const t of tasks) {
      taskMap.set(t.id, t);
      inDegree.set(t.id, t.dependencies.length);
      graph.set(t.id, []);
    }

    for (const t of tasks) {
      for (const depId of t.dependencies) {
        graph.get(depId)!.push(t.id);
      }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    const order: PlanTask[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(taskMap.get(current)!);

      for (const next of graph.get(current)!) {
        const deg = inDegree.get(next)! - 1;
        inDegree.set(next, deg);
        if (deg === 0) queue.push(next);
      }
    }

    return order;
  }
}
