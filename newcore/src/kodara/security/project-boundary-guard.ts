// ═══════════════════════════════════════════════════════════════
// KODARA PROJECT BOUNDARY GUARD — Estándar Google Antigravity
// "Your Code. Your AI. Your Rules."
// Protege el perímetro de ejecución de cada proyecto, impidiendo
// mutaciones cruzadas, compilaciones fuera de la raíz del workspace
// y garantizando el aislamiento estricto de cada dojo.
// ═══════════════════════════════════════════════════════════════

import { resolve, relative, isAbsolute, join } from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

export interface BoundaryCheckResult {
  allowed: boolean;
  normalizedProjectRoot: string;
  normalizedTarget: string;
  reason?: string;
}

export class ProjectBoundaryGuard {
  /**
   * Verifica matemáticamente si una ruta objetivo reside estrictamente
   * dentro de la raíz del workspace activo del proyecto.
   */
  public static validatePathInsideProject(projectRoot: string, targetPath: string): BoundaryCheckResult {
    if (!projectRoot || !projectRoot.trim()) {
      return {
        allowed: false,
        normalizedProjectRoot: '',
        normalizedTarget: targetPath,
        reason: 'No hay una raíz de proyecto activa definida para validar la frontera.',
      };
    }

    const absRoot = resolve(projectRoot);
    const absTarget = resolve(targetPath);

    // Relativa desde absRoot hasta absTarget
    const rel = relative(absRoot, absTarget);

    // Si la ruta relativa empieza por '..' o es una ruta absoluta diferente, está fuera
    const isInside = !rel.startsWith('..') && !isAbsolute(rel);

    if (!isInside) {
      return {
        allowed: false,
        normalizedProjectRoot: absRoot,
        normalizedTarget: absTarget,
        reason: `⛔ [VIOLACIÓN DE FRONTERA DE WORKSPACE]: El proyecto activo en "${absRoot}" no tiene autorización para mutar ni compilar en "${absTarget}". Acción abortada para preservar la integridad del dojo.`,
      };
    }

    return {
      allowed: true,
      normalizedProjectRoot: absRoot,
      normalizedTarget: absTarget,
    };
  }

  /**
   * Lanza una excepción si la ruta objetivo viola el perímetro del workspace
   */
  public static assertPathInsideProject(projectName: string, projectRoot: string, targetPath: string): void {
    const check = this.validatePathInsideProject(projectRoot, targetPath);
    if (!check.allowed) {
      throw new Error(check.reason || `Violación de frontera en proyecto ${projectName}`);
    }
  }

  /**
   * Genera el contenido estándar del manifiesto .kodararules para un workspace nuevo
   */
  public static generateDefaultProjectRules(projectName: string, projectRoot: string): string {
    return `# 🥋 Kodara Project Rules & Sovereign Architecture
# Estándar Google Antigravity — Aislamiento Estricto de Workspaces

ProjectName: ${projectName}
ProjectRoot: ${projectRoot}
IsolationPolicy: STRICT_ZERO_BLEED
SecurityLevel: HIGH

[RULES]:
1. Confinamiento de Ejecución: Todas las compilaciones (cargo, npm, python, etc.) y mutaciones de código fuente deben ejecutarse exclusivamente dentro de esta raíz.
2. Aislamiento de Memoria: Las lecciones aprendidas y memorias tácticas registradas en este espacio pertenecen únicamente a ${projectName}.
3. Prohibición de Contaminación Cruzada: Queda prohibida la invocación de herramientas o scripts que alteren directorios de otros proyectos.
4. Verificación de Integridad: Antes de ejecutar planes físicos, validar siempre que los archivos existan dentro de ${projectRoot}.
`;
  }

  /**
   * Asegura la existencia física de la carpeta del proyecto en Linux y su archivo .kodararules
   */
  public static ensureProjectManifest(projectName: string, projectRoot: string): { createdDir: boolean; createdRules: boolean } {
    let createdDir = false;
    let createdRules = false;

    if (!existsSync(projectRoot)) {
      mkdirSync(projectRoot, { recursive: true });
      createdDir = true;
    }

    const rulesPath = join(projectRoot, '.kodararules');
    if (!existsSync(rulesPath)) {
      writeFileSync(rulesPath, this.generateDefaultProjectRules(projectName, projectRoot), 'utf-8');
      createdRules = true;
    }

    return { createdDir, createdRules };
  }

  /**
   * Carga el archivo .kodararules del proyecto si existe
   */
  public static loadProjectRules(projectRoot: string): string | null {
    if (!projectRoot) return null;
    try {
      const rulesPath = join(projectRoot, '.kodararules');
      if (existsSync(rulesPath)) {
        return readFileSync(rulesPath, 'utf-8');
      }
    } catch {}
    return null;
  }
}
