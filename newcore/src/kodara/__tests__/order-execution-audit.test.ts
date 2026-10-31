import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'fs';
import { KodaraVisionEngine } from '../vision-engine.js';
import { KodaraOrderCompiler } from '../order-compiler.js';
import { KodaraPlanExecutor } from '../plan-executor.js';

describe('Auditoría de Inteligencia de Kodara: Historial Completo, Detección de Flechas y Ejecución Real de Órdenes', () => {
  const samulibrePath = '/home/saghet/Documents/SamulibreLinux';
  const uploadedArrowImg = '/home/saghet/.local/share/kodara/uploads/IMG-1793469188757-1_image.png';

  test('1. Lee todo el historial persistente del chat desde SQLite y compila las 4 órdenes reales del usuario', async () => {
    const compiled = await KodaraOrderCompiler.compileFromConversation({
      conversationId: 'conv_samu_1',
      projectId: 'proj_samulibre',
      projectName: 'SamulibreLinux',
      projectPath: samulibrePath,
      currentMessage:
        'arma un plan de trabajo para implenetar hacia dodne apunta la flecha el consumo de cpu y gpu, incrementa la version de samulibre a 2.00.31, realiza los cambios en el software y compila la mnueva version, cierra y abre samulibre para visualizar los cambios solicitados',
      explicitImagePath: existsSync(uploadedArrowImg) ? uploadedArrowImg : undefined,
    });

    expect(compiled.total_history_messages).toBeGreaterThan(0);
    const intentTypes = compiled.orders.map((o) => o.intent_type);
    expect(intentTypes).toContain('VERSION_BUMP');
    expect(intentTypes).toContain('UI_TELEMETRY_INJECTION');
    expect(intentTypes).toContain('COMPILE_PROJECT');
    expect(intentTypes).toContain('RESTART_APPLICATION');

    const verOrder = compiled.orders.find((o) => o.intent_type === 'VERSION_BUMP');
    expect(verOrder?.parameters.uiVersion).toBe('v2.00.31');
    expect(verOrder?.parameters.cargoVersion).toBe('2.0.31');
  });

  test('2. Detecta geométricamente hacia dónde apunta la flecha azul en la captura de SamuLibre', () => {
    if (!existsSync(uploadedArrowImg)) return;
    const arrow = KodaraVisionEngine.detectArrowTarget(uploadedArrowImg, samulibrePath);
    expect(arrow.detected).toBe(true);
    expect(arrow.color).toBe('BLUE');
    // Debe apuntar a la esquina inferior izquierda (x < 30%, y > 65%) junto a Memoria RAM
    expect(arrow.tip_x_percent).toBeLessThan(30);
    expect(arrow.tip_y_percent).toBeGreaterThan(65);
    expect(arrow.target_ocr_text.toLowerCase()).toContain('memoria ram');
  });

  test('3. Ejecuta las órdenes con [▶ Proceed], modifica SamuLibre a v2.00.31 con CPU/GPU, compila, reinicia y aprueba la auditoría al 100%', async () => {
    const plan = await KodaraPlanExecutor.createExecutablePlan({
      projectId: 'proj_samulibre',
      projectName: 'SamulibreLinux',
      projectPath: samulibrePath,
      title: 'Plan Ejecutable: SamuLibre v2.00.31 + Telemetría CPU/GPU en Sidebar + Compilación y Reinicio',
      summary:
        'Implementación de consumo de CPU y GPU hacia donde apunta la flecha azul, incremento de versión a 2.00.31, compilación real y reinicio en vivo de SamuLibre.',
      markdownContent:
        'arma un plan de trabajo para implenetar hacia dodne apunta la flecha el consumo de cpu y gpu, incrementa la version de samulibre a 2.00.31, realiza los cambios en el software y compila la mnueva version, cierra y abre samulibre para visualizar los cambios solicitados',
    });

    const events: number[] = [];
    const executed = await KodaraPlanExecutor.executePlanById(
      plan.plan_id,
      (ev) => {
        events.push(ev.percent);
      },
      'conv_samu_1'
    );

    expect(executed.status).toBe('COMPLETED');
    expect(events[events.length - 1]).toBe(100);
    expect(executed.phases.every((p) => p.status === 'COMPLETED')).toBe(true);

    // Verificar en disco que Cargo.toml y data/ui/index.html tienen v2.00.31 / 2.0.31 y Consumo CPU / GPU
    const cargoToml = readFileSync(`${samulibrePath}/Cargo.toml`, 'utf-8');
    const uiHtml = readFileSync(`${samulibrePath}/data/ui/index.html`, 'utf-8');
    expect(cargoToml).toContain('version = "2.0.31"');
    expect(uiHtml).toContain('v2.00.31');
    expect(uiHtml).toContain('Consumo CPU');
    expect(uiHtml).toContain('Consumo GPU');
    expect(uiHtml).toContain('samuSidebarCpuVal');
    expect(uiHtml).toContain('samuSidebarGpuVal');

    // Ejecutar la auditoría post-ejecución y verificar 100% de cumplimiento
    const compiled = await KodaraOrderCompiler.compileFromConversation({
      conversationId: 'conv_samu_1',
      projectPath: samulibrePath,
      currentMessage: plan.markdown_content,
    });
    const audit = KodaraOrderCompiler.auditExecutionCompliance(compiled);
    expect(audit.all_verified).toBe(true);
    expect(audit.intelligence_score_percent).toBe(100);
  }, 120_000);
});
