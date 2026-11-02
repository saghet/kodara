// ═══════════════════════════════════════════════════════════════
// KODARA VERIFICATION ENGINE: Stage 4 - Runtime Health Check
// "Your Code. Your AI. Your Rules."
// Verifica la salud del entorno en vivo, servicios del SO y
// sondas locales de conectividad sin dependencias externas.
// ═══════════════════════════════════════════════════════════════

import { SystemRuntimeEngine } from '../../runtime/index.js';
import { StageResult } from '../verification.interface.js';

export class RuntimeHealthStage {
  public static async execute(
    workspaceDir: string,
    serviceName?: string
  ): Promise<StageResult> {
    const start = Date.now();
    const runtime = SystemRuntimeEngine.getInstance();
    const findings: string[] = [];
    let passed = true;

    // 1. Si se especificó un servicio del SO, comprobar su estado
    if (serviceName) {
      const status = await runtime.checkService(serviceName);
      if (!status.active && !status.running) {
        passed = false;
        findings.push(`Servicio "${serviceName}" inactivo o detenido (${status.statusDescription}).`);
      } else {
        findings.push(`Servicio "${serviceName}" activo y operando correctamente.`);
      }
    }

    // 2. Comprobación general de recursos del runtime
    try {
      const inspection = await runtime.getInspection();
      findings.push(
        `Runtime verificado: ${inspection.platform} (${inspection.architecture}) • Uptime: ${Math.round(inspection.uptimeSeconds / 60)} min`
      );
    } catch (err: any) {
      passed = false;
      findings.push(`Error al inspeccionar salud del runtime: ${err.message}`);
    }

    return {
      stage: 'RUNTIME_HEALTH',
      passed,
      durationMs: Date.now() - start,
      findings,
      errorDetails: passed ? undefined : findings.join(' | '),
    };
  }
}
