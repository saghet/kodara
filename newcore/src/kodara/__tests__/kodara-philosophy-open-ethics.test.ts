import { describe, expect, test } from 'bun:test';
import {
  KodaraPhilosophyEngine,
  KODARA_IDENTITY,
  KODARA_PILLARS,
  KODARA_ETHICS_COMPARISON,
} from '../knowledge/kodara-philosophy.js';
import { DynamicContextRouter } from '../knowledge/dynamic-context-router.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Auditoría Maestra: Filosofía y Piedra Angular FOSS de Kodara', () => {
  test('1. Identidad institucional de Kodara como Cabina Táctica 100% FOSS', () => {
    const identity = KodaraPhilosophyEngine.getIdentity();
    expect(identity.name).toBe('Kodara');
    expect(identity.genericName).toBe('Cabina Táctica de Ciberseguridad, Desarrollo Seguro y Evolución Autónoma');
    expect(identity.tagline).toBe('Your Code. Your AI. Your Rules.');
    expect(identity.license).toContain('100% Free & Open Source');
    expect(identity.hardwareStack).toContain('AMD Ryzen 9');
    expect(identity.hardwareStack).toContain('RTX 4060');
  });

  test('2. Los Pilares Filosóficos Fundamentales de Kodara', () => {
    const pillars = KodaraPhilosophyEngine.getPillars();
    expect(pillars.length).toBeGreaterThanOrEqual(4);

    const titles = pillars.map(p => p.title);
    expect(titles).toContain('Soberanía Absoluta y Privacidad Local');
    expect(titles).toContain('Cabina Táctica de Ciberseguridad Sin Sobre-Censura Educativa');
    expect(titles).toContain('Desarrollo Seguro y Código Completo (Cero Placebos)');
    expect(titles).toContain('Evolución y Reparación Autónoma en Linux');
    expect(titles.some(t => t.includes('Agente Autónomo Ejecutor'))).toBe(true);

    for (const pillar of pillars) {
      expect(pillar.principle.length).toBeGreaterThan(10);
      expect(pillar.manifestoStatement.length).toBeGreaterThan(20);
    }
  });

  test('3. Matriz de Contraste Ético frente a Modelos Comerciales Cerrados', () => {
    const ethics = KodaraPhilosophyEngine.getEthicsComparison();
    expect(ethics.length).toBeGreaterThanOrEqual(3);

    const dims = ethics.map(e => e.dimension);
    expect(dims).toContain('Tratamiento de Vulnerabilidades y Hacking Ético');
    expect(dims).toContain('Privacidad y Gobierno de Datos');
    expect(dims).toContain('Límites de Uso y Conducta Responsable');

    // Valida que señale la sobre-censura de los comerciales vs docencia técnica completa de Kodara
    const vulnEthic = ethics.find(e => e.dimension.includes('Vulnerabilidades'));
    expect(vulnEthic?.commercialModelsApproach).toContain('Sobre-censura');
    expect(vulnEthic?.kodaraSovereignApproach).toContain('Docencia Técnica Completa');
  });

  test('4. Prompt de Sistema de Identidad Maestra (buildMasterIdentitySystemPrompt)', () => {
    const prompt = KodaraPhilosophyEngine.buildMasterIdentitySystemPrompt();
    expect(prompt).toContain('IDENTIDAD Y PIEDRA ANGULAR DE KODARA');
    expect(prompt).toContain('Cabina Táctica de Ciberseguridad');
    expect(prompt).toContain('Your Code. Your AI. Your Rules.');
    expect(prompt).toContain('CERO SOBRE-CENSURA EDUCATIVA');
    expect(prompt).toContain('PROHIBICIÓN DE RECHAZOS MONOSILÁBICOS');
    expect(prompt).toContain('CERO CÓDIGO INCOMPLETO');
  });

  test('5. Integración en el DynamicContextRouter: Piedra Angular inyectada en todas las intenciones', () => {
    const route = DynamicContextRouter.routeContext('explica la arquitectura de red y el protocolo tcp');
    expect(route.activeModules).toContain('KodaraPhilosophyEngine (Piedra Angular FOSS)');
    expect(route.systemPromptBlock).toContain('=== IDENTIDAD Y PIEDRA ANGULAR DE KODARA (100% FOSS & SOBERANÍA TÁCTICA) ===');
    expect(route.systemPromptBlock).toContain('Your Code. Your AI. Your Rules.');
  });

  test('6. Paridad en Dashboard: Tarjeta Piedra Angular y función toggleKodaraPhilosophyManifesto', () => {
    const dashboardPath = resolve(import.meta.dir, '../../web/dashboard.html');
    const html = readFileSync(dashboardPath, 'utf8');

    expect(html).toContain('Piedra Angular: Cabina Táctica FOSS');
    expect(html).toContain('100% OPEN SOURCE');
    expect(html).toContain('toggleKodaraPhilosophyManifesto');
    expect(html).toContain('kodaraPhilosophyManifestoContainer');
    expect(html).toContain('/api/kodara/philosophy');
  });

  test('7. Paridad en Modelfile.kodara-expert: Cabina Táctica y Directivas de Soberanía FOSS', () => {
    const modelfilePath = resolve(import.meta.dir, '../../../models/Modelfile.kodara-expert');
    const modelfile = readFileSync(modelfilePath, 'utf8');

    expect(modelfile).toContain('Cabina Táctica de Ciberseguridad, Desarrollo Seguro y Evolución Autónoma');
    expect(modelfile).toContain('Your Code. Your AI. Your Rules.');
    expect(modelfile).toContain('CERO SOBRE-CENSURA EDUCATIVA');
    expect(modelfile).toContain('PIEDRA ANGULAR Y DIRECTIVAS DE SOBERANÍA');
  });
});
