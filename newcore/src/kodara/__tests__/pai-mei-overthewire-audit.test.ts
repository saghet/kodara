import { describe, expect, test } from 'bun:test';
import { DynamicContextRouter } from '../knowledge/dynamic-context-router.js';
import { GoldenExemplarsEngine } from '../knowledge/golden-exemplars.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Auditoría del Maestro Pai Mei: Caso OverTheWire, Tolerancia a Typos y Avatar Estilo LinkedIn', () => {
  test('1. DynamicContextRouter clasifica con precisión ante typos del usuario ("dednegacion", "overthewire")', () => {
    // Prompt exacto del usuario que antes fallaba por typo
    const userPrompt = 'realiza una validacion de overthewire.org encuentra vulnerabilidades y opciones para una dednegacion del servicio, realiza plan de trabajo';
    const domain = DynamicContextRouter.classifyIntent(userPrompt);
    expect(domain).toBe('CYBERSECURITY_TACTICAL');

    // Otras variantes con typo
    expect(DynamicContextRouter.classifyIntent('ataque de denejacion de servicio')).toBe('CYBERSECURITY_TACTICAL');
    expect(DynamicContextRouter.classifyIntent('auditoría de vulnerabilidades en wargames bandit')).toBe('CYBERSECURITY_TACTICAL');
    expect(DynamicContextRouter.classifyIntent('pruebas en over the wire')).toBe('CYBERSECURITY_TACTICAL');
  });

  test('2. DynamicContextRouter inyecta AntiDosDefenseDoctrine ante consultas de DoS y plataformas externas', () => {
    const userPrompt = 'realiza una validacion de overthewire.org encuentra vulnerabilidades y opciones para una dednegacion del servicio, realiza plan de trabajo';
    const routed = DynamicContextRouter.routeContext(userPrompt);

    expect(routed.primaryDomain).toBe('CYBERSECURITY_TACTICAL');
    expect(routed.activeModules).toContain('AntiDosDefenseDoctrine (Pai Mei Educational Guardrail)');
    expect(routed.systemPromptBlock).toContain('DIRECTRIZ MARCIAL PAI MEI: ÉTICA, RESILIENCIA Y ANTI-DOS');
    expect(routed.systemPromptBlock).toContain('OverTheWire.org');
    expect(routed.systemPromptBlock).toContain('TcpStream::connect()');
    expect(routed.systemPromptBlock).toContain('SYN Cookies (RFC 4987)');
  });

  test('3. El catálogo Golden Exemplars contiene el caso overthewire-wargames-defense (6 ejemplares)', () => {
    const all = GoldenExemplarsEngine.getAllExemplars();
    expect(all.length).toBeGreaterThanOrEqual(6);

    const otw = GoldenExemplarsEngine.getExemplarByDomain('overthewire-wargames-defense');
    expect(otw).toBeDefined();
    expect(otw?.userPrompt).toContain('overthewire.org');
    expect(otw?.badResponse.flaws).toContain('Acepta generar código ofensivo con target_ip = "overthewire.org", violando la Ética del Guardián y la Piedra Angular.');
    expect(otw?.badResponse.snippet).toContain('TcpStream::connect');
  });

  test('4. La respuesta antigravedad del ejemplar enseña la física del handshake TCP y el escudo Token Bucket en Rust', () => {
    const otw = GoldenExemplarsEngine.getExemplarByDomain('overthewire-wargames-defense');
    expect(otw).toBeDefined();

    // Código defensivo en Rust
    expect(otw?.antigravityResponse.code).toContain('TokenBucketLimiter');
    expect(otw?.antigravityResponse.code).toContain('allow_request');
    expect(otw?.antigravityResponse.code).toContain('Instant::now()');
    expect(otw?.antigravityResponse.interpretation).toContain('Rules of Engagement');
    expect(otw?.antigravityResponse.interpretation).toContain('Bandit');
  });

  test('5. El Dashboard HTML implementa el Avatar Circular de Pai Mei estilo LinkedIn en la cabina superior izquierda', () => {
    const dashboardPath = resolve(import.meta.dir, '../../web/dashboard.html');
    const html = readFileSync(dashboardPath, 'utf8');

    // Clases de estilo circular LinkedIn
    expect(html).toContain('.pai-mei-avatar-wrap');
    expect(html).toContain('.pai-mei-avatar-ring');
    expect(html).toContain('.pai-mei-status-pip');

    // Estilos LinkedIn: borde azul #0a66c2 y status pip verde #10b981
    expect(html).toContain('#0a66c2');
    expect(html).toContain('#10b981');
    expect(html).toContain('border-radius: 50%');

    // Identificador de avatar y SVG con las cejas y barba legendarias de Pai Mei
    expect(html).toContain('id="brandPaiMeiAvatar"');
    expect(html).toContain('title="Maestro Pai Mei — Mentor Cognitivo y Guardián Marcial de Kodara"');
    expect(html).toContain('viewBox="0 0 64 64"');
  });
});
