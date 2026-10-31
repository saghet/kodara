// ═══════════════════════════════════════════════════════════════
// Open Antigravity — Sistema de Memoria de Ingeniería Persistente
// Guarda la metodología de trabajo, pautas de código y perfil de proyectos
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir } from 'os';

export interface ProjectProfile {
  name: string;
  path: string;
  type: string;
  version?: string;
  cratesOrModules?: string[];
  notes?: string;
  lastAnalyzed?: string;
}

export interface EngineeringMemory {
  engineerProfile: {
    preferredLanguages: string[];
    workMethodology: string[];
    qualityRules: string[];
  };
  projects: Record<string, ProjectProfile>;
  customRules: string[];
  updatedAt: string;
}

const MEMORY_DIR = resolve(homedir(), '.local/share/open-antigravity');
const MEMORY_FILE = resolve(MEMORY_DIR, 'memory.json');

const DEFAULT_MEMORY: EngineeringMemory = {
  engineerProfile: {
    preferredLanguages: ['Rust', 'Python', 'TypeScript', 'Bash'],
    workMethodology: [
      'Arquitectura modular y limpia por componentes/crates independientes.',
      'Seguridad por diseño (Security by Design) y mínimo privilegio.',
      'Alto rendimiento con manejo asíncrono eficiente (Tokio en Rust).',
      'Explicaciones directas y técnicas, evitando textos genéricos o introducciones vacías.',
      'Propuestas estructuradas en: 1. Diagnóstico, 2. Arquitectura, 3. Seguridad, 4. Código concreto.'
    ],
    qualityRules: [
      'No generar código repetitivo ni bucles redundantes.',
      'Priorizar código seguro en Rust (evitar unsafe innecesario).',
      'Proporcionar siempre ejemplos con sintaxis válida y tipos claros.'
    ]
  },
  projects: {
    'SamulibreLinux': {
      name: 'Antivirus SamuLibre',
      path: '/home/saghet/Documents/SamulibreLinux',
      type: 'Rust Workspace (Antivirus, EDR, Virtual Patcher & Privacy Suite)',
      version: '2.0.30',
      cratesOrModules: [
        'samulibre-types', 'samulibre-patcher', 'samulibre-shield',
        'samulibre-scanner', 'samulibre-vpn', 'samulibre-core',
        'samulibre-cli', 'samulibre-gui', 'samulibre-watcher',
        'samulibre-ai', 'samulibre-android'
      ],
      notes: 'Suite de seguridad modular en Rust con soporte multiplataforma (Linux/Android). Utiliza Tokio, Notify, Sysinfo y Criptografía SHA-2/MD5.',
      lastAnalyzed: new Date().toISOString()
    }
  },
  customRules: [
    'Siempre adaptar las propuestas a la arquitectura de 11 crates de SamuLibre.',
    'Proponer mejoras en rendimiento para escaneo de archivos y monitorización en tiempo real.',
    'Respetar las directivas de ciberseguridad y compatibilidad multiplataforma.'
  ],
  updatedAt: new Date().toISOString()
};

export class EngineeringMemoryManager {
  private memory: EngineeringMemory;

  constructor() {
    this.memory = this.load();
  }

  private load(): EngineeringMemory {
    try {
      if (!existsSync(MEMORY_DIR)) {
        mkdirSync(MEMORY_DIR, { recursive: true });
      }
      if (existsSync(MEMORY_FILE)) {
        const data = readFileSync(MEMORY_FILE, 'utf-8');
        return { ...DEFAULT_MEMORY, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Advertencia al cargar memoria de ingeniería, usando valores por defecto:', e);
    }
    this.save(DEFAULT_MEMORY);
    return DEFAULT_MEMORY;
  }

  public save(data?: EngineeringMemory): void {
    try {
      if (!existsSync(MEMORY_DIR)) {
        mkdirSync(MEMORY_DIR, { recursive: true });
      }
      this.memory = data || this.memory;
      this.memory.updatedAt = new Date().toISOString();
      writeFileSync(MEMORY_FILE, JSON.stringify(this.memory, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error al guardar memoria de ingeniería:', e);
    }
  }

  public getMemory(): EngineeringMemory {
    return this.memory;
  }

  public addRule(rule: string): void {
    if (!this.memory.customRules.includes(rule)) {
      this.memory.customRules.push(rule);
      this.save();
    }
  }

  public registerProject(profile: ProjectProfile): void {
    this.memory.projects[profile.name] = {
      ...this.memory.projects[profile.name],
      ...profile,
      lastAnalyzed: new Date().toISOString()
    };
    this.save();
  }

  /**
   * Genera el bloque de contexto de memoria para enriquecer el prompt del LLM
   */
  public generateSystemContext(targetProject?: string): string {
    let ctx = `\n════════════════════════════════════════════════════════════════\n`;
    ctx += `MEMORIA DE INGENIERÍA Y METODOLOGÍA DEL USUARIO (ACTIVA):\n`;
    ctx += `════════════════════════════════════════════════════════════════\n`;

    ctx += `1. Metodología de Trabajo:\n`;
    for (const m of this.memory.engineerProfile.workMethodology) {
      ctx += `  • ${m}\n`;
    }

    ctx += `\n2. Reglas de Calidad Obligatorias:\n`;
    for (const q of this.memory.engineerProfile.qualityRules) {
      ctx += `  • ${q}\n`;
    }

    if (this.memory.customRules.length > 0) {
      ctx += `\n3. Preferencias Aprendidas del Ingeniero:\n`;
      for (const r of this.memory.customRules) {
        ctx += `  • ${r}\n`;
      }
    }

    // Si coincide con algún proyecto conocido
    if (targetProject) {
      for (const [key, proj] of Object.entries(this.memory.projects)) {
        if (targetProject.includes(key) || (proj.path && targetProject.includes(proj.path))) {
          ctx += `\n4. Proyecto Conocido Enlazado: ${proj.name} (Versión ${proj.version || '2.0.x'})\n`;
          ctx += `  Tipo: ${proj.type}\n`;
          if (proj.cratesOrModules) {
            ctx += `  Crates del workspace: ${proj.cratesOrModules.join(', ')}\n`;
          }
          if (proj.notes) {
            ctx += `  Notas de arquitectura: ${proj.notes}\n`;
          }
        }
      }
    }

    ctx += `════════════════════════════════════════════════════════════════\n\n`;
    return ctx;
  }
}

export const memoryManager = new EngineeringMemoryManager();
