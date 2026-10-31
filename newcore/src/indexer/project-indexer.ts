// ═══════════════════════════════════════════════════════════════
// Kodara — Indexador Inteligente de Código y Workspaces Masivos
// Escanea proyectos complejos (Rust Workspaces, TS Monorepos, Python)
// Extrayendo tipos, structs, traits, funciones y dependencias reales.
// ═══════════════════════════════════════════════════════════════

import { existsSync, statSync, readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';

export interface CrateOverview {
  name: string;
  path: string;
  description?: string;
  dependencies: string[];
  publicSymbols: string[];
  sampleCode?: string;
}

export interface WorkspaceIndex {
  projectPath: string;
  projectName: string;
  type: 'rust-workspace' | 'rust-single' | 'node-monorepo' | 'python-project' | 'general';
  crates: CrateOverview[];
  rootManifestSnippet: string;
  totalFiles: number;
}

export class ProjectIndexer {
  /**
   * Inspecciona en profundidad un proyecto o workspace masivo en disco
   */
  public static index(projectPath: string, maxTokensBudget: number = 14000): string {
    if (!existsSync(projectPath)) return '';
    const stat = statSync(projectPath);
    if (!stat.isDirectory()) return '';

    const projectName = basename(projectPath);
    const cargoTomlPath = join(projectPath, 'Cargo.toml');
    const cratesDirPath = join(projectPath, 'crates');

    // 1. Proyecto Workspace de Rust
    if (existsSync(cargoTomlPath) && existsSync(cratesDirPath)) {
      return this.indexRustWorkspace(projectPath, projectName, maxTokensBudget);
    }

    // 2. Rust Crate Individual
    if (existsSync(cargoTomlPath)) {
      return this.indexRustSingle(projectPath, projectName, maxTokensBudget);
    }

    // 3. Proyecto Genérico
    return this.indexGenericProject(projectPath, projectName, maxTokensBudget);
  }

  private static indexRustWorkspace(projectPath: string, projectName: string, budget: number): string {
    const cargoTomlPath = join(projectPath, 'Cargo.toml');
    const rootCargo = readFileSync(cargoTomlPath, 'utf-8');
    const cratesDirPath = join(projectPath, 'crates');

    const crateNames = readdirSync(cratesDirPath).filter(c => {
      try {
        return statSync(join(cratesDirPath, c)).isDirectory();
      } catch {
        return false;
      }
    });

    let output = `\n════════════════════════════════════════════════════════════════\n`;
    output += `ARQUITECTURA Y CÓDIGO REAL DEL WORKSPACE (INDEXACIÓN PROFUNDA):\n`;
    output += `Proyecto: ${projectName}\n`;
    output += `Ruta: ${projectPath}\n`;
    output += `Total de Crates Activos: ${crateNames.length}\n`;
    output += `════════════════════════════════════════════════════════════════\n\n`;

    output += `### MANIFIESTO PRINCIPAL (Cargo.toml):\n\`\`\`toml\n${rootCargo.slice(0, 1500)}\n\`\`\`\n\n`;
    output += `### DESGLOSE TÉCNICO DE CRATES Y ESTRUCTURAS EN DISCO:\n`;

    for (const cName of crateNames) {
      const cPath = join(cratesDirPath, cName);
      const cCargoPath = join(cPath, 'Cargo.toml');
      const srcPath = join(cPath, 'src');
      let deps: string[] = [];

      if (existsSync(cCargoPath)) {
        try {
          const content = readFileSync(cCargoPath, 'utf-8');
          const depMatches = content.match(/\[(?:workspace\.)?dependencies(?:\.[a-zA-Z0-9_\-]+)?\]([\s\S]*?)(?=\n\[|$)/);
          if (depMatches && depMatches[1]) {
            deps = depMatches[1]
              .split('\n')
              .map(l => l.trim().split('=')[0].trim())
              .filter(l => l && !l.startsWith('#') && !l.startsWith('['));
          }
        } catch {}
      }

      // Inspeccionar símbolos públicos en src/lib.rs o src/main.rs
      let symbols: string[] = [];
      let codeSnippet = '';
      const libPath = join(srcPath, 'lib.rs');
      const mainPath = join(srcPath, 'main.rs');
      const targetSrc = existsSync(libPath) ? libPath : (existsSync(mainPath) ? mainPath : null);

      if (targetSrc) {
        try {
          const srcContent = readFileSync(targetSrc, 'utf-8');
          const lines = srcContent.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (
              trimmed.startsWith('pub struct ') ||
              trimmed.startsWith('pub enum ') ||
              trimmed.startsWith('pub trait ') ||
              trimmed.startsWith('pub fn ') ||
              trimmed.startsWith('pub async fn ') ||
              trimmed.startsWith('pub type ') ||
              trimmed.startsWith('pub mod ')
            ) {
              symbols.push(trimmed.replace(/\{.*$/, '').trim());
            }
          }

          // Adjuntar primeros 400 caracteres del archivo principal del crate
          codeSnippet = srcContent.slice(0, 650);
        } catch {}
      }

      output += `\n📦 Crate: \`${cName}\`\n`;
      if (deps.length > 0) {
        output += `  • Dependencias clave: ${deps.slice(0, 8).join(', ')}\n`;
      }
      if (symbols.length > 0) {
        output += `  • Símbolos públicos exportados:\n`;
        for (const s of symbols.slice(0, 8)) {
          output += `    - ${s}\n`;
        }
      }
      if (codeSnippet) {
        output += `  • Vista previa de código (\`${basename(targetSrc || '')}\`):\n\`\`\`rust\n${codeSnippet}\n\`\`\`\n`;
      }
    }

    output += `\n════════════════════════════════════════════════════════════════\n`;
    output += `INSTRUCCIÓN PARA EL INGENIERO:\n`;
    output += `Utiliza exclusivamente los crates, módulos y structs reales mostrados arriba. Aplica la arquitectura de SamuLibre y Rust asíncrono con Tokio.`;
    output += `\n════════════════════════════════════════════════════════════════\n\n`;

    return output;
  }

  private static indexRustSingle(projectPath: string, projectName: string, budget: number): string {
    const cargoTomlPath = join(projectPath, 'Cargo.toml');
    const rootCargo = readFileSync(cargoTomlPath, 'utf-8');
    let output = `\n════════════════════════════════════════════════════════════════\n`;
    output += `PROYECTO RUST: ${projectName}\n`;
    output += `Ruta: ${projectPath}\n`;
    output += `════════════════════════════════════════════════════════════════\n\n`;
    output += `### Cargo.toml:\n\`\`\`toml\n${rootCargo.slice(0, 2000)}\n\`\`\`\n\n`;

    const srcDir = join(projectPath, 'src');
    if (existsSync(srcDir)) {
      const files = readdirSync(srcDir).filter(f => f.endsWith('.rs'));
      output += `Archivos en src/: ${files.join(', ')}\n\n`;
    }
    return output;
  }

  private static indexGenericProject(projectPath: string, projectName: string, budget: number): string {
    const entries = readdirSync(projectPath).slice(0, 30);
    let output = `\n════════════════════════════════════════════════════════════════\n`;
    output += `DIRECTORIO DEL PROYECTO: ${projectName}\n`;
    output += `Ruta: ${projectPath}\n`;
    output += `Archivos:\n${entries.map(e => ` - ${e}`).join('\n')}\n`;
    output += `════════════════════════════════════════════════════════════════\n\n`;
    return output;
  }
}
