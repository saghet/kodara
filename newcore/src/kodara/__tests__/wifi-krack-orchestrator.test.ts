import { describe, it, expect, beforeEach } from 'bun:test';
import { DynamicContextRouter } from '../knowledge/dynamic-context-router';
import { KodaraProjectMemory } from '../evolution/project-memory';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('§34: Verificación Integral del Proyecto WiFi (Auditoría WPA2 / KRACK & Orquestador)', () => {
  const wifiDir = '/home/saghet/Documents/wifi';
  const configPath = path.join(wifiDir, 'config.json');
  const dbModulePath = path.join(wifiDir, 'database.py');
  const simModulePath = path.join(wifiDir, 'lab_simulator.py');
  const runScriptPath = path.join(wifiDir, 'run.sh');
  const staticIndexPath = path.join(wifiDir, 'static/index.html');

  it('1. Debe certificar que la estructura física de software existe en /home/saghet/Documents/wifi', () => {
    expect(fs.existsSync(configPath)).toBe(true);
    expect(fs.existsSync(dbModulePath)).toBe(true);
    expect(fs.existsSync(simModulePath)).toBe(true);
    expect(fs.existsSync(runScriptPath)).toBe(true);
    expect(fs.existsSync(staticIndexPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    expect(config.project_name).toBe('wifi');
    expect(config.default_interface).toBe('wlp2s0');
    expect(config.active_mode).toBe('simulated');
  });

  it('2. Debe ejecutar lab_simulator.py en Python 3 y persistir sesiones y hallazgos en SQLite', () => {
    const output = execSync(`python3 ${simModulePath}`, { encoding: 'utf-8' });
    expect(output).toContain('SES-WIFI-');
    expect(output).toContain('CVE-2017-13077');
    expect(output).toContain('02:00:00:11:22:33');
    expect(output).toContain('02:00:00:AA:BB:CC');

    const dbPath = path.join(wifiDir, 'wifi_audit.db');
    expect(fs.existsSync(dbPath)).toBe(true);
  });

  it('3. Debe certificar que run.sh tiene permisos de ejecución y ejecuta en modo demo', () => {
    const stats = fs.statSync(runScriptPath);
    // Verificar que tiene bit de ejecución (0o111)
    expect((stats.mode & 0o111) !== 0).toBe(true);

    const out = execSync(`${runScriptPath} demo`, { encoding: 'utf-8' });
    expect(out).toContain('Kodara WPA2 KRACK Tactical Auditor');
    expect(out).toContain('wlp2s0');
    expect(out).toContain('Auditoría de laboratorio completada');
  });

  it('4. DynamicContextRouter: Debe clasificar peticiones sobre WiFi / KRACK y activar WirelessSecurityEngine', () => {
    const prompt = 'Actúa como especialista en ciberseguridad y ejecuta la auditoría WPA2 KRACK en el proyecto wifi';
    const domain = DynamicContextRouter.classifyIntent(prompt);
    expect(domain).toBe('CYBERSECURITY_TACTICAL');

    const routed = DynamicContextRouter.routeContext(prompt);
    expect(routed.activeModules).toContain('WirelessSecurityEngine (KRACK WPA2 & Lab Simulator)');
    expect(routed.systemPromptBlock).toContain('wlp2s0');
    expect(routed.systemPromptBlock).toContain('CVE-2017-13077');
    expect(routed.systemPromptBlock).toContain('PROHIBICIÓN DE PASIVIDAD DE CHATBOT');
  });

  it('5. KodaraProjectMemory: Debe contener lecciones aisladas para el proyecto wifi (proj_DfEi6_LP)', async () => {
    const memories = await KodaraProjectMemory.listMemories('proj_DfEi6_LP');
    expect(memories.length).toBeGreaterThan(0);
    const hasKrackMemory = memories.some(m => m.error_signature.includes('WPA2_KRACK'));
    expect(hasKrackMemory).toBe(true);

    const promptBlock = await KodaraProjectMemory.buildProjectMemoryPromptBlock('proj_DfEi6_LP');
    expect(promptBlock).toContain('WPA2_KRACK_HANDSHAKE_REPLAY_PARSER');
    expect(promptBlock).toContain('krack_engine.py');
  });
});
