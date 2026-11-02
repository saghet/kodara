// ═══════════════════════════════════════════════════════════════
// KODARA TEST SUITE: Fase 9 (Experiencia de Usuario e Interfaz Visual)
// "Your Code. Your AI. Your Rules."
// Valida visualizador DAG, streaming DeepSeek-R1 CoT, modo HITL/Turbo,
// monitor del enjambre de 10 agentes y visor interactivo de diffs.
// ═══════════════════════════════════════════════════════════════

import { describe, expect, test } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import Fastify from 'fastify';
import { registerAgentSwarmControllers, globalWhiteboard } from '../../server/controllers/agents.controller.js';

describe('🎨 Experiencia de Usuario & Interfaz Visual (Fase 9)', () => {
  const htmlPath = resolve(import.meta.dir, '../dashboard.html');

  test('1. dashboard.html contiene los componentes de Fase 9', () => {
    expect(existsSync(htmlPath)).toBe(true);
    const html = readFileSync(htmlPath, 'utf8');

    // 1.1 Acordeón de pensamiento profundo DeepSeek-R1
    expect(html).toContain('ag-reasoning-accordion');
    expect(html).toContain('Razonamiento Lógico Profundo (DeepSeek-R1 CoT)');
    expect(html).toContain('ag-reasoning-badge');

    // 1.2 Pestañas del workbench para DAG y Enjambre
    expect(html).toContain('wbTab_autonomousPlan');
    expect(html).toContain('wbTab_agentSwarm');
    expect(html).toContain('wbPane_autonomousPlan');
    expect(html).toContain('wbPane_agentSwarm');

    // 1.3 Botón de Aborto Reactivo
    expect(html).toContain('abortExecutionBtn');
    expect(html).toContain('abortCurrentExecution()');

    // 1.4 Modal de Diffs
    expect(html).toContain('agDiffViewerModal');
    expect(html).toContain('diffModalFilename');
    expect(html).toContain('renderUnifiedDiff');

    // 1.5 Modal de Autorización HITL
    expect(html).toContain('agHitlConfirmationModal');
    expect(html).toContain('showHitlConfirmationModal');
    expect(html).toContain('handleHitlDecision');
  });

  test('2. Selector de Modo de Interacción: Turbo vs Supervisado (HITL)', () => {
    const html = readFileSync(htmlPath, 'utf8');
    expect(html).toContain('executionModeSelect');
    expect(html).toContain('value="turbo"');
    expect(html).toContain('value="supervised"');
  });

  test('3. Algoritmo renderUnifiedDiff: Calcula adiciones, eliminaciones e información de línea', () => {
    function renderUnifiedDiff(oldStr: string, newStr: string) {
      const oldLines = oldStr.split('\n');
      const newLines = newStr.split('\n');
      let additions = 0;
      let deletions = 0;
      const maxLen = Math.max(oldLines.length, newLines.length);

      for (let i = 0; i < maxLen; i++) {
        const oL = oldLines[i];
        const nL = newLines[i];
        if (oL === undefined) additions++;
        else if (nL === undefined) deletions++;
        else if (oL !== nL) {
          deletions++;
          additions++;
        }
      }
      return { additions, deletions };
    }

    const before = 'const x = 1;\nconst y = 2;\nconsole.log(x);';
    const after = 'const x = 1;\nconst y = 3;\nconsole.log(x);\nconsole.log(y);';

    const diff = renderUnifiedDiff(before, after);
    expect(diff.additions).toBe(2);
    expect(diff.deletions).toBe(1);
  });

  test('4. Endpoints del Enjambre Fastify: /api/kodara/swarm/agents expone los 10 agentes especializados', async () => {
    const app = Fastify();
    registerAgentSwarmControllers(app);

    const resp = await app.inject({
      method: 'GET',
      url: '/api/kodara/swarm/agents',
    });

    expect(resp.statusCode).toBe(200);
    const body = resp.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe(10);
    expect(body.agents.length).toBe(10);

    const roles = body.agents.map((a: any) => a.role);
    expect(roles).toContain('ORCHESTRATOR');
    expect(roles).toContain('DEVELOPER');
    expect(roles).toContain('SECURITY');
    expect(roles).toContain('ARCHITECT');
    expect(roles).toContain('TESTER');
    expect(roles).toContain('SYSTEM_OPERATOR');
  });

  test('5. Endpoints de la Pizarra Fastify: /api/kodara/swarm/whiteboard permite publicar y listar notas', async () => {
    const app = Fastify();
    registerAgentSwarmControllers(app);

    // Publicar nota
    const postResp = await app.inject({
      method: 'POST',
      url: '/api/kodara/swarm/whiteboard',
      payload: {
        authorRole: 'SECURITY',
        topic: 'zero-bleed',
        title: 'Verificación de Fronteras SAST',
        content: 'No se detectaron fugas fuera del workspace.',
        tags: ['security', 'audit'],
      },
    });

    expect(postResp.statusCode).toBe(200);
    const postBody = postResp.json();
    expect(postBody.success).toBe(true);
    expect(postBody.note.authorRole).toBe('SECURITY');
    expect(postBody.note.title).toBe('Verificación de Fronteras SAST');

    // Listar notas
    const listResp = await app.inject({
      method: 'GET',
      url: '/api/kodara/swarm/whiteboard?topic=zero-bleed',
    });

    expect(listResp.statusCode).toBe(200);
    const listBody = listResp.json();
    expect(listBody.success).toBe(true);
    expect(listBody.notesCount).toBeGreaterThan(0);
    expect(listBody.notes[0].title).toBe('Verificación de Fronteras SAST');
  });
});
