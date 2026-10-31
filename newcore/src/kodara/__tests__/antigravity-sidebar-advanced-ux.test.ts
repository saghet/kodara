// ═══════════════════════════════════════════════════════════════
// KODARA ANTIGRAVITY SIDEBAR: ADVANCED UX & AUTO-TITLING (TEST SUITE)
// Valida las exigencias de Pai Mei para una verdadera IDE:
// 1. Erradicación de prompt()/confirm() nativos
// 2. Edición Inline In-Situ en el sidebar (Doble clic / Enter / Esc)
// 3. Modal de Confirmación No Bloqueante
// 4. Motor de Auto-Titulado Semántico Inteligente de Conversaciones
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { projectsTable } from '../../db/index.js';

describe('Kodara Antigravity Sidebar: Ergonomía Avanzada de IDE y Auto-Titling', () => {
  const dashboardHtmlPath = resolve(__dirname, '../../web/dashboard.html');
  const serverTsPath = resolve(__dirname, '../../server.ts');

  it('1. El motor de auto-titulado genera títulos concisos y elimina palabras vacías', () => {
    // Caso 1: Prompt largo con fórmulas de cortesía
    const prompt1 = 'Hola, por favor analiza los puertos abiertos del sistema y diagnostica el firewall';
    const title1 = projectsTable.generateSemanticTitleFromPrompt(prompt1);
    expect(title1).not.toContain('hola');
    expect(title1).not.toContain('por');
    expect(title1).not.toContain('favor');
    expect(title1).toContain('Puertos');
    expect(title1.split(' ').length).toBeLessThanOrEqual(4);

    // Caso 2: Prompt con orden directa de memoria
    const prompt2 = 'Quiero auditar la memoria del sistema SamuLibre en Rust';
    const title2 = projectsTable.generateSemanticTitleFromPrompt(prompt2);
    expect(title2).toContain('Memoria');
    expect(title2).toContain('Samulibre');

    // Caso 3: Fallback seguro si no hay contenido semántico
    const prompt3 = '... ???';
    const title3 = projectsTable.generateSemanticTitleFromPrompt(prompt3);
    expect(title3).toBe('Consulta de Desarrollo');
  });

  it('2. getConversationById recupera metadatos completos de una conversación en SQLite', async () => {
    const proj = await projectsTable.createProject('TestAdvUxProj', '/tmp/test_adv_ux');
    const conv = await projectsTable.createConversation(proj.id, 'Nueva Conversación');

    const fetched = await projectsTable.getConversationById(conv.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(conv.id);
    expect(fetched?.title).toBe('Nueva Conversación');
    expect(fetched?.projectId).toBe(proj.id);

    // Limpieza
    await projectsTable.deleteProject(proj.id);
  });

  it('3. El Dashboard HTML implementa Edición Inline In-Situ y modal de confirmación no bloqueante', () => {
    expect(existsSync(dashboardHtmlPath)).toBe(true);
    const html = readFileSync(dashboardHtmlPath, 'utf-8');

    // Cero confirm() del navegador en borrado de conversaciones
    expect(html).not.toContain('if (!confirm(');

    // Edición Inline In-Situ
    expect(html).toContain('startInlineRename');
    expect(html).toContain('saveInlineRename');
    expect(html).toContain('cancelInlineRename');
    expect(html).toContain('ag-conv-inline-input');
    expect(html).toContain('ondblclick="startInlineRename');

    // Modal de Confirmación
    expect(html).toContain('agConfirmDeleteModal');
    expect(html).toContain('executeConfirmedDelete');
    expect(html).toContain('closeConfirmDeleteModal');

    // Ergonomía de Filtro
    expect(html).toContain('btnClearProjectsFilter');
    expect(html).toContain('clearProjectsFilter');
    expect(html).toContain("if(event.key==='Escape')toggleProjectsFilterBar()");
  });

  it('4. El servidor server.ts cuenta con gancho de auto-titulado y emisión de evento conversationRenamed', () => {
    expect(existsSync(serverTsPath)).toBe(true);
    const serverCode = readFileSync(serverTsPath, 'utf-8');

    expect(serverCode).toContain('conversationRenamed');
    expect(serverCode).toContain('projectsTable.generateSemanticTitleFromPrompt');
    expect(serverCode).toContain('projectsTable.getConversationById');
    expect(serverCode).toContain('projectsTable.renameConversation');
  });
});
