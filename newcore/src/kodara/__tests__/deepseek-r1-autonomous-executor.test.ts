import { describe, it, expect } from 'bun:test';
import { loadConfig } from '../../config/index.js';
import { KodaraPhilosophyEngine, KODARA_PILLARS } from '../knowledge/kodara-philosophy.js';
import { ANTIGRAVITY_PRINCIPLES } from '../knowledge/autonomous-programming.js';
import { DynamicContextRouter } from '../knowledge/dynamic-context-router.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('§35: Integración de DeepSeek-R1 por Defecto & Pilar Agente Autónomo Ejecutor (No-Chatbot)', () => {
  const dashboardPath = path.resolve(__dirname, '../../web/dashboard.html');
  const serverPath = path.resolve(__dirname, '../../server.ts');

  it('1. Debe certificar que loadConfig() tiene defaultModel configurado en deepseek-r1', () => {
    const cfg = loadConfig();
    expect(cfg.defaultModel).toBe('deepseek-r1');
  });

  it('2. Debe validar que server.ts resuelve deepseek-r1 como perfil predeterminado con rol de ejecutor autónomo', () => {
    const serverCode = fs.readFileSync(serverPath, 'utf8');
    expect(serverCode).toContain("requestedProfile?.replace(/^ollama:/, '') || 'deepseek-r1'");
    expect(serverCode).toContain("raw === 'deepseek-r1' || raw.includes('deepseek')");
    expect(serverCode).toContain("DeepSeek-R1 — Agente Autónomo Ejecutor & Razonamiento Profundo (Predeterminado)");
    expect(serverCode).toContain("NO actúas como un chatbot conversacional pasivo");
  });

  it('3. Debe certificar que KODARA_PILLARS contiene el Pilar VI: Agente Autónomo Ejecutor', () => {
    const pillars = KodaraPhilosophyEngine.getPillars();
    expect(pillars.length).toBeGreaterThanOrEqual(6);

    const pillar6 = pillars.find(p => p.pillarNumber === 6);
    expect(pillar6).toBeDefined();
    expect(pillar6?.title).toContain('Agente Autónomo Ejecutor');
    expect(pillar6?.principle).toContain('ejecutor y forjador');
    expect(pillar6?.manifestoStatement).toContain('Prohibición estricta de actuar como un chatbot');

    const prompt = KodaraPhilosophyEngine.buildMasterIdentitySystemPrompt();
    expect(prompt).toContain('DOCTRINA DEL AGENTE AUTÓNOMO EJECUTOR (NO-CHATBOT)');
    expect(prompt).toContain('planes ejecutables nativos [▶ Proceed]');
  });

  it('4. Debe verificar que AutonomousProgrammingEngine incluye el principio de Ejecutor Autónomo', () => {
    const executorPrinciple = ANTIGRAVITY_PRINCIPLES.find(p => p.id === 'autonomous-executor-no-chatbot');
    expect(executorPrinciple).toBeDefined();
    expect(executorPrinciple?.name).toContain('Ejecutor Autónomo de Primera Intención');
    expect(executorPrinciple?.rules.some(r => r.includes('tutoriales de texto'))).toBe(true);
  });

  it('5. DynamicContextRouter: Debe inyectar la directiva No-Chatbot en el prompt reflexivo', () => {
    const routed = DynamicContextRouter.routeContext('Crea una función de hashing criptográfico');
    expect(routed.systemPromptBlock).toContain('PILAR VI: AGENTE AUTÓNOMO EJECUTOR (DOCTRINA NO-CHATBOT)');
    expect(routed.systemPromptBlock).toContain('Prohibido actuar como un chatbot pasivo');
  });

  it('6. dashboard.html: Debe tener deepseek-r1 seleccionado por defecto en modelSelect y en el consejero', () => {
    const html = fs.readFileSync(dashboardPath, 'utf8');
    expect(html).toContain('<option value="deepseek-r1" selected>🧠 DeepSeek-R1 (Razonamiento Lógico Profundo & Agente Autónomo) — Predeterminado</option>');
    expect(html).toContain('DeepSeek-R1 — Razonamiento analítico profundo, agente ejecutor autónomo y forja de código sin fricción (Predeterminado)');
  });

  it('7. Ollama Local: Debe tener registrado deepseek-r1:latest en la instancia local', () => {
    const output = execSync('ollama list', { encoding: 'utf-8' });
    expect(output).toContain('deepseek-r1');
  });
});
