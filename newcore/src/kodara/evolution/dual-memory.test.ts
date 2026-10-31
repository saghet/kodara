// ═══════════════════════════════════════════════════════════════
// KODARA DUAL MEMORY ARCHITECTURE — Suite de Pruebas Automatizadas
// Verifica la separación física y lógica entre:
//   1. Kodara Project Memory (errores de desarrollo de aplicaciones)
//   2. Kodara Core Memory (problemas internos del IDE y mejoras supervisadas)
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import {
  KodaraProjectMemory,
  KodaraCoreMemory,
  KodaraEvolutionEngine,
} from './index.js';

describe('Kodara Dual Memory Architecture (Project Memory vs Core Memory)', () => {
  it('Kodara Project Memory: debe almacenar aprendizajes de aplicaciones, incrementar reutilización y rechazar errores internos del IDE', async () => {
    const entry1 = await KodaraProjectMemory.recordApplicationLearning({
      projectId: 'proj_samulibre',
      projectName: 'SamulibreLinux',
      language: 'rust',
      errorSignature: 'RUSTC_E0502_BORROW_CONFLICT',
      errorContext: 'Conflicto de préstamo mutable e inmutable en bucle de samulibre-scanner.',
      rootCause: 'Se mantenía referencia &self.rules activa mientras se invocaba self.record_hit().',
      verifiedFix: 'Clonar el identificador de regla antes de invocar el método mutable.',
    });

    expect(entry1.memory_id).toContain('PMEM-');
    expect(entry1.verification_status).toBe('VERIFIED');
    expect(entry1.times_reused).toBe(1);

    // Segunda aparición del mismo error en el proyecto -> debe incrementar times_reused
    const entry2 = await KodaraProjectMemory.recordApplicationLearning({
      projectId: 'proj_samulibre',
      projectName: 'SamulibreLinux',
      language: 'rust',
      errorSignature: 'RUSTC_E0502_BORROW_CONFLICT',
      errorContext: 'Conflicto repetido en segundo módulo.',
      rootCause: 'Se mantenía referencia &self.rules activa.',
      verifiedFix: 'Clonar el identificador de regla antes de invocar el método mutable.',
    });
    expect(entry2.times_reused).toBe(2);

    const promptBlock = await KodaraProjectMemory.buildProjectMemoryPromptBlock('proj_samulibre');
    expect(promptBlock).toContain('KODARA PROJECT MEMORY');
    expect(promptBlock).toContain('SamulibreLinux');

    // Debe rechazar tajantemente errores internos del IDE
    let threwIsolationError = false;
    try {
      await KodaraProjectMemory.recordApplicationLearning({
        projectId: 'proj_samulibre',
        projectName: 'SamulibreLinux',
        errorSignature: 'KODARA_ENGINE_INTERNAL_CRASH',
        errorContext: 'Fallo interno',
        rootCause: 'Fallo interno',
        verifiedFix: 'Parche IDE',
        isInternalIdeError: true,
      });
    } catch {
      threwIsolationError = true;
    }
    expect(threwIsolationError).toBe(true);
  });

  it('Kodara Core Memory: debe registrar problemas internos del IDE en aislamiento y rechazar errores de proyectos de usuario', async () => {
    const coreEntry = await KodaraCoreMemory.recordInternalIdeIssue({
      ideComponent: 'kodara-core:stream-dispatcher',
      issueSignature: 'CORE_SSE_FLUSH_LATENCY',
      telemetrySummary: 'Retraso de 120ms al vaciar chunks SSE en respuestas largas.',
      rootCause: 'Falta de flush explícito tras escribir cada chunk.',
      supervisedProposal: 'Activar tcpNoDelay y vaciado inmediato del stream en server.ts.',
    });

    expect(coreEntry.core_entry_id).toContain('CMEM-');
    expect(coreEntry.approval_status).toBe('SUPERVISED_PENDING');
    expect(coreEntry.isolated_branch).toContain('.local/share/kodara/self-patches');

    await KodaraCoreMemory.updateApprovalStatus(coreEntry.core_entry_id, 'APPROVED');
    const allCore = await KodaraCoreMemory.listCoreMemories();
    const updated = allCore.find((c) => c.core_entry_id === coreEntry.core_entry_id);
    expect(updated?.approval_status).toBe('APPROVED');

    // Debe rechazar tajantemente errores de aplicaciones de usuario
    let threwCoreIsolation = false;
    try {
      await KodaraCoreMemory.recordInternalIdeIssue({
        ideComponent: 'user-app',
        issueSignature: 'RUSTC_E0308',
        telemetrySummary: 'Error de usuario',
        rootCause: 'Error de usuario',
        supervisedProposal: 'Fix de usuario',
        isUserProjectError: true,
      });
    } catch {
      threwCoreIsolation = true;
    }
    expect(threwCoreIsolation).toBe(true);
  });

  it('Orquestador: debe enrutar automáticamente errores de código a Project Memory y fallos del IDE a Core Memory', async () => {
    const appIncident = await KodaraEvolutionEngine.processOperationOrIncident({
      projectId: 'proj_samulibre',
      projectName: 'SamulibreLinux',
      component: 'rustc',
      operation: 'cargo build',
      rawLog: 'error[E0308]: mismatched types expected String, found &str',
      autoRepair: true,
    });
    expect(appIncident.projectMemoryEntry).not.toBeNull();
    expect(appIncident.coreMemoryEntry).toBeNull();

    const ideIncident = await KodaraEvolutionEngine.processOperationOrIncident({
      projectId: 'proj_samulibre',
      component: 'kodara-engine:router',
      operation: 'internal-dispatch',
      rawLog: 'KODARA_INTERNAL: route timeout warning',
      autoRepair: false,
    });
    expect(ideIncident.coreMemoryEntry).not.toBeNull();
    expect(ideIncident.projectMemoryEntry).toBeNull();
  });
});
