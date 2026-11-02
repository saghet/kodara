// ═══════════════════════════════════════════════════════════════
// KODARA TEST SUITE: Project Memory Engine (Fase 7)
// "Your Code. Your AI. Your Rules."
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import {
  ProjectMemoryEngine,
  ContextIndexer,
  ContextCompactor,
  MemoryTier,
} from '../index.js';

describe('Project Memory Engine & Context Management (Fase 7)', () => {
  const pmem = ProjectMemoryEngine.getInstance();
  const testProjectId = `proj_mem_test_${Date.now()}`;

  it('1. Almacena y recupera entradas en las dimensiones SESSION, PROJECT, TECHNICAL y TASK', async () => {
    // 1. SESSION
    const sessionEntry = await pmem.storeEntry({
      projectId: testProjectId,
      tier: 'SESSION',
      title: 'Intención de Sesión',
      content: 'El usuario desea optimizar el rendimiento del servidor Fastify en Linux.',
      tags: ['session', 'fastify'],
    });
    expect(sessionEntry.id).toContain('MEM-SESSION-');

    // 2. PROJECT
    const projectEntry = await pmem.storeEntry({
      projectId: testProjectId,
      tier: 'PROJECT',
      title: 'Stack Tecnológico Principal',
      content: 'Proyecto construido en Rust (núcleo) y TypeScript (frontend y CLI).',
      tags: ['rust', 'typescript', 'architecture'],
    });
    expect(projectEntry.tier).toBe('PROJECT');

    // 3. TECHNICAL
    const techEntry = await pmem.storeEntry({
      projectId: testProjectId,
      tier: 'TECHNICAL',
      title: 'Comandos de Construcción y Prueba',
      content: 'Compilación: cargo build --release. Pruebas: bun test.',
      tags: ['cargo', 'bun', 'build'],
    });
    expect(techEntry.tier).toBe('TECHNICAL');

    // 4. TASK
    const taskEntry = await pmem.storeEntry({
      projectId: testProjectId,
      tier: 'TASK',
      title: 'Tarea T-12: Refactorización de Controladores',
      content: 'Completada con éxito por el agente DEVELOPER en 140ms.',
      tags: ['task', 'developer', 'completed'],
    });
    expect(taskEntry.tier).toBe('TASK');

    // Listar por tier
    const techList = await pmem.listEntriesByTier(testProjectId, 'TECHNICAL');
    expect(techList.length).toBeGreaterThanOrEqual(1);
    expect(techList.some((t) => t.id === techEntry.id)).toBe(true);
  });

  it('2. Registra y actualiza Architectural Decision Records (ADR)', async () => {
    const adr = await pmem.recordADR({
      projectId: testProjectId,
      adrNumber: 1,
      title: 'Uso de LibSQL/SQLite Local en lugar de PostgreSQL',
      status: 'PROPOSED',
      context: 'Kodara requiere funcionar 100% offline y en local sin levantar contenedores pesados.',
      decision: 'Se adopta SQLite nativo integrado para toda la persistencia de estado y memoria.',
      consequences: 'Cero configuración externa requerida; altísima velocidad en lecturas.',
      authorAgent: 'ARCHITECT',
    });

    expect(adr.id).toContain('ADR-1-');
    expect(adr.status).toBe('PROPOSED');

    // Actualizar estado del ADR
    const accepted = await pmem.updateADRStatus(adr.id, 'ACCEPTED');
    expect(accepted.status).toBe('ACCEPTED');

    const adrs = await pmem.listADRs(testProjectId);
    expect(adrs.length).toBeGreaterThanOrEqual(1);
    expect(adrs.some((a) => a.id === adr.id && a.status === 'ACCEPTED')).toBe(true);
  });

  it('3. Registra memoria de Errores y Soluciones Verificadas con contador de reutilización', async () => {
    const err = await pmem.recordErrorSolution({
      projectId: testProjectId,
      signature: 'RUSTC_E0308_MISMATCHED_TYPES',
      symptom: 'mismatched types: expected `String`, found `&str`',
      rootCause: 'La función compute_banner requería propiedad String.',
      solution: 'Agregar .to_string() en las ramas de retorno.',
      verified: true,
    });

    expect(err.verified).toBe(true);
    expect(err.reusedCount).toBe(1);

    // Si se vuelve a registrar el mismo error, debe incrementar reusedCount
    const reused = await pmem.recordErrorSolution({
      projectId: testProjectId,
      signature: 'RUSTC_E0308_MISMATCHED_TYPES',
      symptom: 'mismatched types',
      rootCause: 'La función compute_banner requería propiedad String.',
      solution: 'Agregar .to_string() en las ramas de retorno.',
      verified: true,
    });

    expect(reused.reusedCount).toBe(2);

    const found = await pmem.findErrorSolution(testProjectId, 'RUSTC_E0308_MISMATCHED_TYPES');
    expect(found).not.toBeNull();
    expect(found?.reusedCount).toBe(2);
  });

  it('4. ContextIndexer: Recupera contexto relevante sin saturar el context window', () => {
    const entries = [
      {
        id: '1',
        projectId: testProjectId,
        tier: 'TECHNICAL' as MemoryTier,
        title: 'Manejo de Tokens JWT en Fastify',
        content: 'Para firmar tokens JWT en Fastify usar fastify-jwt con secreto cargado desde env.',
        tags: ['jwt', 'auth', 'fastify'],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        projectId: testProjectId,
        tier: 'PROJECT' as MemoryTier,
        title: 'Configuración de Estilos CSS',
        content: 'Variables CSS oscuras para el tema Kodara Dark en dashboard.html.',
        tags: ['ui', 'css', 'frontend'],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const results = ContextIndexer.retrieveRelevant(entries, 'como autenticar con jwt en fastify', 1000, 2);
    expect(results.length).toBe(1);
    expect(results[0].entry.id).toBe('1');
    expect(results[0].score).toBeGreaterThan(5.0);
  });

  it('5. ContextCompactor: Compacta sesiones extensas preservando intenciones clave', () => {
    const messages = [
      { role: 'user', content: 'Crea un plan para refactorizar la base de datos' },
      { role: 'assistant', content: 'Fase 1: Mapeo de tablas completado ✅. Fase 2: Índices creados ✅.' },
      { role: 'user', content: 'Agrega pruebas de rendimiento con bun test' },
      { role: 'assistant', content: 'Pruebas agregadas exitosamente ✅.' },
      { role: 'user', content: 'Verifica los puertos locales' },
      { role: 'assistant', content: 'Puerto 3777 abierto y respondiendo ✅.' },
      // Mensajes recientes a preservar:
      { role: 'user', content: '¿Qué falta por hacer?' },
      { role: 'assistant', content: 'Solo falta documentar los cambios.' },
      { role: 'user', content: 'Procede a documentar.' },
      { role: 'assistant', content: 'Comenzando documentación de APIs...' },
    ];

    const compacted = ContextCompactor.compactSession(messages, 4, {
      projectName: 'TestApp',
      activeTasks: ['Documentar APIs en Markdown'],
    });

    expect(compacted.preservedRecentMessages.length).toBe(4);
    expect(compacted.summary).toContain('Resumen Ejecutivo de Sesión Compactada');
    expect(compacted.summary).toContain('Crea un plan para refactorizar');
    expect(compacted.summary).toContain('Documentar APIs en Markdown');
    expect(compacted.compactedPrompt).toContain('Comenzando documentación de APIs...');
  });

  it('6. retrieveRelevantContext: Genera prompt de contexto filtrado dentro del presupuesto', async () => {
    const contextPrompt = await pmem.retrieveRelevantContext({
      projectId: testProjectId,
      query: 'comandos de construccion cargo bun',
      limit: 3,
      maxTokens: 500,
    });

    expect(contextPrompt).toContain('MEMORIA CONTEXTUAL RELEVANTE');
    expect(contextPrompt).toContain('Comandos de Construcción y Prueba');
  });
});
