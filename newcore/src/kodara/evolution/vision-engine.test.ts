// ═══════════════════════════════════════════════════════════════
// KODARA VISION ENGINE — Pruebas Automatizadas de Interpretación
// Multimodal de Imágenes (OCR Bilingüe + Codebase Grounding)
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { KodaraVisionEngine } from '../vision-engine.js';

describe('Kodara Vision Engine (Multimodal Visual Debugging & Screenshot-to-Fix)', () => {
  it('debe analizar una captura de pantalla real con fallo, extraer OCR bilingüe, detectar anomalías y hacer Codebase Grounding', () => {
    const sampleImgPath =
      '/home/saghet/.gemini/antigravity/brain/eb810197-143a-44d5-bb6f-c2b72f6c6c09/captura_proceed_bloqueado.png';
    const base64 = readFileSync(sampleImgPath).toString('base64');

    const report = KodaraVisionEngine.analyzeAttachedImages(
      [
        {
          name: 'captura_proceed_bloqueado.png',
          dataUrl: `data:image/png;base64,${base64}`,
        },
      ],
      '/home/saghet/Documents/SamulibreLinux',
      'Al dar clic en proceder se queda ejecutando y no avanza'
    );

    expect(report.images_count).toBe(1);
    expect(report.analyses[0].ocr_text.length).toBeGreaterThan(50);
    expect(report.analyses[0].ocr_text).toContain('Kodara');
    expect(report.consolidated_anomalies.length).toBeGreaterThan(0);
    expect(report.grounded_files.length).toBeGreaterThan(0);
    expect(report.llm_vision_context).toContain('REPORTE DE INSPECCIÓN MULTIMODAL');
    expect(report.ollama_base64_images.length).toBe(1);
  });
});
