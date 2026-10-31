// ═══════════════════════════════════════════════════════════════
// KODARA EVOLUTION ENGINE — Orquestador Unificado (Módulos 1 al 8)
// + Dos Memorias Independientes:
//   1. Kodara Project Memory (Aprendizaje de Aplicaciones/Proyectos)
//   2. Kodara Core Memory (Problemas Internos del IDE & Mejoras Supervisadas)
// "Your Code. Your AI. Your Rules."
// ═══════════════════════════════════════════════════════════════

import { KodaraEvolutionDB } from './evolution-db.js';
import { KodaraOpenTelemetry } from './telemetry-otel.js';
import { KodaraDiagnosticAgent } from './diagnostic-agent.js';
import { KodaraRepairAgent } from './repair-agent.js';
import { KodaraLearningAgent } from './learning-agent.js';
import { KodaraSelfImprovementAgent } from './self-improvement-agent.js';
import { KodaraProjectMemory, ProjectMemoryEntry } from './project-memory.js';
import { KodaraCoreMemory, CoreMemoryEntry } from './core-memory.js';
import { PrivacyScrubber } from './privacy-scrubber.js';
import {
  DiagnosticReport,
  ErrorCategory,
  KodaraTelemetryEvent,
  RepairExecutionSummary,
  SelfImprovementProposal,
} from './types.js';

export class KodaraEvolutionEngine {
  /**
   * Ejecuta el flujo operativo extremo a extremo ante un incidente o compilación/prueba,
   * enrutando el aprendizaje hacia Kodara Project Memory o Kodara Core Memory según su dominio.
   */
  public static async processOperationOrIncident(params: {
    projectId: string;
    projectName?: string;
    component: string;
    operation: string;
    rawLog: string;
    stackTrace?: string;
    brokenSourceCode?: string;
    sourceFileName?: string;
    autoRepair?: boolean;
  }): Promise<{
    event: KodaraTelemetryEvent;
    diagnosis: DiagnosticReport | null;
    repairSummary: RepairExecutionSummary | null;
    selfImprovementProposal: SelfImprovementProposal | null;
    projectMemoryEntry: ProjectMemoryEntry | null;
    coreMemoryEntry: CoreMemoryEntry | null;
  }> {
    await Promise.all([
      KodaraEvolutionDB.init(),
      KodaraProjectMemory.init(),
      KodaraCoreMemory.init(),
    ]);
    const cfg = await KodaraEvolutionDB.getConfig();

    // 1. Captura de Telemetría OpenTelemetry Local
    const event = await KodaraOpenTelemetry.emitEvent({
      projectId: params.projectId,
      agentId: 'kodara-diagnostic-agent',
      component: params.component,
      operation: params.operation,
      rawLog: params.rawLog,
      stackTrace: params.stackTrace || '',
    });

    if (event.error_category === 'NONE') {
      return {
        event,
        diagnosis: null,
        repairSummary: null,
        selfImprovementProposal: null,
        projectMemoryEntry: null,
        coreMemoryEntry: null,
      };
    }

    // 2. Clasificar incidente, consultar experiencias y formular hipótesis (Módulo 2)
    const diagnosis = await KodaraDiagnosticAgent.diagnoseEvent(event);

    // 3. Si es un fallo interno de Kodara (KODARA_ENGINE_ERROR) -> Enrutar a KODARA CORE MEMORY
    if (event.error_category === 'KODARA_ENGINE_ERROR') {
      const proposal = await KodaraSelfImprovementAgent.evaluateInternalEngineFault(
        event,
        diagnosis
      );
      const coreEntry = await KodaraCoreMemory.recordInternalIdeIssue({
        ideComponent: params.component,
        issueSignature: diagnosis.error_signature,
        telemetrySummary: event.sanitized_log,
        rootCause: diagnosis.root_cause_hypothesis,
        supervisedProposal: diagnosis.proposed_remediation,
        candidatePatchDiff: proposal?.candidate_patch_diff,
      });

      return {
        event,
        diagnosis,
        repairSummary: null,
        selfImprovementProposal: proposal,
        projectMemoryEntry: null,
        coreMemoryEntry: coreEntry,
      };
    }

    // 4. Si es un error de aplicación/proyecto -> Reparar en Sandbox y registrar en KODARA PROJECT MEMORY
    let repairSummary: RepairExecutionSummary | null = null;
    const shouldRepair =
      (params.autoRepair ?? cfg.autonomous_repair_enabled) &&
      event.error_category === 'PROJECT_CODE_ERROR';

    if (shouldRepair) {
      repairSummary = await KodaraRepairAgent.runRepairCycle({
        event,
        diagnosis,
        projectPath: params.projectId,
        sourceFileName: params.sourceFileName || 'lib.rs',
        brokenSourceCode: params.brokenSourceCode,
      });
    }

    const winningStep = repairSummary?.steps.find((s) => s.accepted);
    const projectName =
      params.projectName ||
      (params.projectId.includes('Samulibre')
        ? 'SamulibreLinux'
        : params.projectId.includes('WiShark')
        ? 'WiSharkOpen'
        : params.projectId.includes('Ollama')
        ? 'Ollama'
        : 'Aplicación Activa');

    const projectMemEntry = await KodaraProjectMemory.recordApplicationLearning({
      projectId: params.projectId,
      projectName,
      language: params.component.includes('rust') ? 'rust' : 'typescript',
      errorSignature: diagnosis.error_signature,
      errorContext: event.sanitized_log,
      rootCause: diagnosis.root_cause_hypothesis,
      verifiedFix: winningStep?.patch_summary || diagnosis.proposed_remediation,
      compileStatus:
        !repairSummary || repairSummary.final_status === 'VERIFIED_FIXED' ? 'PASS' : 'FAIL',
      testStatus:
        !repairSummary || repairSummary.final_status === 'VERIFIED_FIXED' ? 'PASS' : 'FAIL',
      confidence: diagnosis.confidence_score,
    });

    return {
      event,
      diagnosis,
      repairSummary,
      selfImprovementProposal: null,
      projectMemoryEntry: projectMemEntry,
      coreMemoryEntry: null,
    };
  }

  /**
   * MÓDULO 7: Conjunto de evaluación reproducible con proyectos de prueba independientes
   */
  public static async runReproducibleBenchmarkSuite() {
    await KodaraEvolutionDB.init();

    const case1 = await this.processOperationOrIncident({
      projectId: '/tmp/kodara-eval-suite/rust-auth-service',
      projectName: 'SamulibreLinux',
      component: 'rustc',
      operation: 'cargo check',
      rawLog: 'error[E0308]: mismatched types\n --> src/lib.rs:3:9\n expected `String`, found `&str`',
      autoRepair: true,
    });

    const case2 = await this.processOperationOrIncident({
      projectId: '/tmp/kodara-eval-suite/net-audit',
      projectName: 'WiSharkOpen',
      component: 'tool:nmap',
      operation: 'nmap scan',
      rawLog: 'nmap: QUITTING! Host seems down or firewalled',
      autoRepair: false,
    });

    const case3 = await this.processOperationOrIncident({
      projectId: '/tmp/kodara-eval-suite/external-project',
      component: 'kodara-engine:parser',
      operation: 'preprocess-output',
      rawLog: 'KODARA_INTERNAL: buffer threshold warning in parser stream',
      autoRepair: false,
    });

    const results = [
      {
        caseId: 'BENCH-01-RUST-E0308',
        description: 'Autocorrección en sandbox de discrepancia de tipos Rust (E0308) -> Kodara Project Memory',
        expectedCategory: 'PROJECT_CODE_ERROR' as ErrorCategory,
        actualCategory: case1.event.error_category,
        repairStatus: case1.repairSummary?.final_status || 'NONE',
        passed:
          case1.event.error_category === 'PROJECT_CODE_ERROR' &&
          case1.repairSummary?.final_status === 'VERIFIED_FIXED' &&
          case1.projectMemoryEntry !== null,
      },
      {
        caseId: 'BENCH-02-TOOL-ISOLATION',
        description: 'Distinción de error de herramienta externa (nmap) sin modificar código de proyecto',
        expectedCategory: 'EXTERNAL_TOOL_ERROR' as ErrorCategory,
        actualCategory: case2.event.error_category,
        repairStatus: 'ISOLATED_NO_CODE_MUTATION',
        passed: case2.event.error_category === 'EXTERNAL_TOOL_ERROR' && case2.repairSummary === null,
      },
      {
        caseId: 'BENCH-03-SELF-IMPROVEMENT',
        description: 'Detección de defecto interno del IDE -> Kodara Core Memory en rama aislada',
        expectedCategory: 'KODARA_ENGINE_ERROR' as ErrorCategory,
        actualCategory: case3.event.error_category,
        repairStatus: case3.selfImprovementProposal?.status || 'NONE',
        passed:
          case3.event.error_category === 'KODARA_ENGINE_ERROR' &&
          case3.coreMemoryEntry !== null,
      },
    ];

    const passedCount = results.filter((r) => r.passed).length;
    return {
      suiteName: 'Kodara Evolution Reproducible Benchmark v1.0',
      executedAt: new Date().toISOString(),
      casesRun: results.length,
      casesPassed: passedCount,
      regressionsDetected: results.length - passedCount,
      results,
    };
  }

  /**
   * MÓDULO 8: Estado completo para el Panel de Observabilidad y las Dos Memorias Independientes
   */
  public static async getObservabilityDashboardState() {
    await Promise.all([
      KodaraEvolutionDB.init(),
      KodaraProjectMemory.init(),
      KodaraCoreMemory.init(),
    ]);

    const currentEvents = await KodaraEvolutionDB.listTelemetryEvents(25);
    if (currentEvents.length === 0) {
      await this.runReproducibleBenchmarkSuite();
    }

    const [
      config,
      metrics,
      telemetryEvents,
      diagnostics,
      experiences,
      strategyOutcomes,
      selfProposals,
      projectMemories,
      coreMemories,
    ] = await Promise.all([
      KodaraEvolutionDB.getConfig(),
      KodaraEvolutionDB.computeEvaluationMetrics(),
      KodaraEvolutionDB.listTelemetryEvents(25),
      KodaraEvolutionDB.listDiagnostics(20),
      KodaraEvolutionDB.listExperiences(),
      KodaraEvolutionDB.listStrategyOutcomes(),
      KodaraEvolutionDB.listSelfImprovementProposals(),
      KodaraProjectMemory.listMemories(),
      KodaraCoreMemory.listCoreMemories(),
    ]);

    const agentsStatus = [
      {
        id: 'kodara-diagnostic-agent',
        name: 'Kodara Diagnostic Agent',
        module: 'Módulo 2 • Diagnóstico Causal',
        status: 'ACTIVE',
        description: 'Clasifica en 5 categorías, normaliza firmas en Rust y distingue errores deterministas/ambientales.',
        processedCount: diagnostics.length,
      },
      {
        id: 'kodara-repair-agent',
        name: 'Kodara Repair Agent',
        module: 'Módulo 3 • Sandbox Autocorrección',
        status: config.autonomous_repair_enabled ? 'ACTIVE' : 'PAUSED_BY_USER',
        description: `Ejecuta parches mínimos en sandbox aislado (máx. ${config.max_auto_attempts} intentos) validando compilación + tests.`,
        processedCount: experiences.filter((e) => e.verification_status === 'VERIFIED').length,
      },
      {
        id: 'kodara-learning-agent',
        name: 'Kodara Learning Agent',
        module: 'Módulo 4 & 5 • Project Memory',
        status: 'ACTIVE',
        description: 'Aprende de los errores al desarrollar aplicaciones y bloquea estrategias fallidas recurrentes.',
        processedCount: projectMemories.length,
      },
      {
        id: 'kodara-self-improvement-agent',
        name: 'Kodara Self-Improvement Agent',
        module: 'Módulo 6 • Core Memory (IDE)',
        status: 'SUPERVISED_HITL',
        description: 'Registra problemas internos del IDE en Kodara Core Memory y propone mejoras supervisadas.',
        processedCount: coreMemories.length,
      },
    ];

    return {
      config,
      agentsStatus,
      metrics,
      telemetryEvents,
      diagnostics,
      experiences,
      strategyOutcomes,
      selfProposals,
      projectMemories,
      coreMemories,
    };
  }
}

export {
  KodaraEvolutionDB,
  KodaraOpenTelemetry,
  KodaraDiagnosticAgent,
  KodaraRepairAgent,
  KodaraLearningAgent,
  KodaraSelfImprovementAgent,
  KodaraProjectMemory,
  KodaraCoreMemory,
  PrivacyScrubber,
};
