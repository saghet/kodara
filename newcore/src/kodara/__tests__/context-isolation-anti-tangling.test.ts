// ═══════════════════════════════════════════════════════════════
// KODARA CONTEXT ISOLATION & ZERO-BLEED ANTI-TANGLING SUITE
// Certifica la erradicación del enredo de temas, la independencia
// estricta de cada conversación en SQLite, el scoping de proyectos
// y la supresión de órdenes y flechas fantasma.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { KodaraOrderCompiler } from '../order-compiler.js';
import { KodaraPlanExecutor } from '../plan-executor.js';

describe('🥋 Auditoría de Aislamiento de Contexto y Desenredo Lógico de Kodara (Zero-Bleed)', () => {
  const serverTsPath = resolve(__dirname, '../../server.ts');
  const dashboardHtmlPath = resolve(__dirname, '../../web/dashboard.html');

  it('1. Aislamiento de Conversación: Una nueva conversación no arrastra historial de SamuLibre ni órdenes fantasma', async () => {
    const cleanConvId = `conv_test_isolation_${Date.now()}`;
    const compiled = await KodaraOrderCompiler.compileFromConversation({
      conversationId: cleanConvId,
      currentMessage: 'Hola Kodara, explícame la diferencia entre una función pura y una impura en TypeScript.',
    });

    // Sin órdenes de mutación de software heredadas
    expect(compiled.orders).toHaveLength(0);
    expect(compiled.conversation_id).toBe(cleanConvId);

    // El ledger de contexto no debe forzar la directriz destructiva ni mencionar SamuLibre
    expect(compiled.history_ledger_prompt_block).not.toContain('ORD-VERSION-BUMP');
    expect(compiled.history_ledger_prompt_block).not.toContain('ORD-COMPILE-SOFTWARE');
    expect(compiled.history_ledger_prompt_block).not.toContain('ORD-UI-CPU-GPU-ARROW');
    expect(compiled.history_ledger_prompt_block).not.toContain('[▶ Proceed]');
  });

  it('2. Supresión de Detección Fantasma: Sin imágenes adjuntas en el turno, no busca flechas en el disco', async () => {
    const freshConvId = `conv_fresh_text_${Date.now()}`;
    const compiled = await KodaraOrderCompiler.compileFromConversation({
      conversationId: freshConvId,
      currentMessage: '¿Cuál es la función del registro RAX en arquitectura x86-64?',
      // No se pasa explicitImagePath
    });

    // No debe inventar flechas ni asumir que apuntan a la RAM
    expect(compiled.arrow_target.detected).toBe(false);
    expect(compiled.arrow_target.quadrant_label).toBe('');
    expect(compiled.arrow_target.target_ocr_text).toBe('');
    expect(compiled.history_ledger_prompt_block).not.toContain('Objetivo Geométrico de la Flecha');
  });

  it('3. Scoping Estricto de Proyectos: Una consulta sobre WiSharkOpen u Ollama respeta su propio entorno', async () => {
    const wisharkConvId = `conv_wishark_${Date.now()}`;
    const compiled = await KodaraOrderCompiler.compileFromConversation({
      conversationId: wisharkConvId,
      projectId: 'proj_wishark',
      projectName: 'WiSharkOpen',
      projectPath: '/home/saghet/Documents/WiSharkOpen',
      currentMessage: 'Analiza los paquetes DNS capturados en la interfaz eth0 y busca anomalías.',
    });

    expect(compiled.project_id).toBe('proj_wishark');
    expect(compiled.project_name).toBe('WiSharkOpen');
    expect(compiled.project_path).toBe('/home/saghet/Documents/WiSharkOpen');
    expect(compiled.orders).toHaveLength(0);
    expect(compiled.history_ledger_prompt_block).toContain('WiSharkOpen');
    expect(compiled.history_ledger_prompt_block).not.toContain('SamulibreLinux');
  });

  it('4. PlanExecutor.shouldAttachExecutablePlan: Discrimina consultas conceptuales de planes ejecutables reales', () => {
    // Consultas ordinarias, conceptuales o explicativas (NO deben generar plan ejecutable)
    expect(KodaraPlanExecutor.shouldAttachExecutablePlan('analiza cómo se calcula un hash SHA-256', '### Explicación del algoritmo SHA-256\n1. Padding\n2. Bloques')).toBe(false);
    expect(KodaraPlanExecutor.shouldAttachExecutablePlan('revisa qué puertos suele escanear Nmap por defecto', 'Nmap escanea los 1000 puertos más comunes.')).toBe(false);
    expect(KodaraPlanExecutor.shouldAttachExecutablePlan('crea un ejemplo didáctico de bucle for en Rust', '```rust\nfor i in 0..10 {}\n```')).toBe(false);
    expect(KodaraPlanExecutor.shouldAttachExecutablePlan('explícame qué es una cookie HTTP', 'Una cookie es un encabezado HTTP de estado.')).toBe(false);

    // Peticiones explícitas de plan de trabajo (SÍ deben generar plan ejecutable)
    expect(KodaraPlanExecutor.shouldAttachExecutablePlan('arma plan de trabajo para auditar la seguridad de la API', 'Plan propuesto.')).toBe(true);
    expect(KodaraPlanExecutor.shouldAttachExecutablePlan('arma un plan de acción para el sistema', 'Plan de 4 fases.')).toBe(true);
    expect(KodaraPlanExecutor.shouldAttachExecutablePlan('/plan migración de base de datos a SQLite', 'Detalle de fases.')).toBe(true);
    expect(KodaraPlanExecutor.shouldAttachExecutablePlan('crea un plan ejecutable para compilar el proyecto', 'Fases listas.')).toBe(true);
    expect(KodaraPlanExecutor.shouldAttachExecutablePlan('procede con las modificaciones de código', 'Procediendo.')).toBe(true);
  });

  it('5. Servidor server.ts: No contamina el mensaje del usuario con ledgers y scoping seguro de sesión', () => {
    expect(existsSync(serverTsPath)).toBe(true);
    const code = readFileSync(serverTsPath, 'utf-8');

    // No inyecta history_ledger_prompt_block en el contenido del usuario
    expect(code).not.toContain('${compiledOrders.history_ledger_prompt_block}\\n\\n${contextText ? `${contextText}');
    expect(code).toContain('compiledOrders.orders.length > 0 ? `${compiledOrders.history_ledger_prompt_block}\\n` : \'\'');

    // Manejo de convId sin forzar conv_samu_1
    expect(code).toContain('effectiveConvId');
    expect(code).not.toContain("const effectiveConvId = conversationId || 'conv_samu_1';");
  });

  it('6. Frontend dashboard.html: Resetea chatHistory al cambiar de conversación y evita fugas entre chats', () => {
    expect(existsSync(dashboardHtmlPath)).toBe(true);
    const html = readFileSync(dashboardHtmlPath, 'utf-8');

    // Reseteo estricto de chatHistory
    expect(html).toContain('chatHistory = [];');
    expect(html).toContain('createNewProjectConversation');
    expect(html).toContain('createConversationInProject');
    expect(html).toContain('renderProjectWorkspaceCleanState');
  });
});
