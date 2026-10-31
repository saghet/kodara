// ═══════════════════════════════════════════════════════════════
// Kodara — Puente MCP (Model Context Protocol) de Ciberseguridad
// "Your code, Your IA, Your Rules"
// Envuelve binarios nativos de Linux como herramientas JSON Schema
// e incluye el Validador Human-in-the-Loop (HITL).
// ═══════════════════════════════════════════════════════════════

import { execSync } from 'child_process';
import { existsSync } from 'fs';

export type IntrusionLevel = 'Pasivo' | 'Moderado' | 'Agresivo';

export interface ParamExplanation {
  flag: string;
  description: string;
}

export interface MCPToolSchema {
  id: string;
  name: string;
  binary: string;
  category: 'Reconocimiento' | 'Web' | 'Red' | 'OSINT' | 'Auditoría de Código';
  description: string;
  intrusionLevel: IntrusionLevel;
  installed: boolean;
  binaryPath: string | null;
  defaultArgsTemplate: string;
  jsonSchema: Record<string, any>;
}

export interface HITLCommandProposal {
  proposalId: string;
  toolId: string;
  toolName: string;
  category: string;
  target: string;
  command: string;
  intrusionLevel: IntrusionLevel;
  paramExplanations: ParamExplanation[];
  installed: boolean;
  fallbackAvailable: boolean;
  createdAt: string;
}

const FLAG_DICTIONARY: Record<string, string> = {
  '-sV': 'Detección de versiones de servicios activos en los puertos abiertos',
  '-sC': 'Ejecuta scripts predeterminados de NSE (Nmap Scripting Engine) para auditoría básica',
  '-sS': 'Escaneo TCP SYN (Stealth) que no completa el apretón de manos TCP',
  '-sT': 'Escaneo TCP Connect completo (no requiere privilegios root)',
  '-F': 'Modo rápido (Fast): escanea los 100 puertos más comunes',
  '-Pn': 'Omite el descubrimiento de host por ping (asume que el host está activo)',
  '-T4': 'Temporización rápida recomendada para redes locales o enlaces estables',
  '-p': 'Especifica el rango o lista de puertos a analizar',
  '--open': 'Muestra únicamente los puertos con estado abierto (open)',
  '-oX': 'Genera salida estructurada en formato XML para el compresor de Kodara',
  '-u': 'Define la URL o el objetivo principal del análisis',
  '-t': 'Especifica plantillas o número de hilos de ejecución concurrentes',
  '-jsonl': 'Salida estructurada en JSON Lines para parseo automático',
  '-a': 'Nivel de agresividad o captura completa de metadatos',
  '--json': 'Formatea la salida en JSON estructurado para el pre-procesador anti-desbordamiento',
  '--config': 'Define el conjunto de reglas SAST (ej. auto, p/security-audit, p/rust)',
  'fs': 'Escaneo del sistema de archivos local en busca de vulnerabilidades y dependencias',
  '-c': 'Límite de paquetes o peticiones a capturar/enviar',
  '-i': 'Interfaz de red sobre la cual escuchar tráfico',
  '-w': 'Diccionario (wordlist) utilizado para descubrimiento de rutas',
};

export class CybersecurityMCPBridge {
  private static checkBinary(bin: string): { installed: boolean; path: string | null } {
    try {
      const out = execSync(`command -v ${bin}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (out && existsSync(out)) {
        return { installed: true, path: out };
      }
    } catch {}
    return { installed: false, path: null };
  }

  public static getCatalog(): MCPToolSchema[] {
    const rawTools: Omit<MCPToolSchema, 'installed' | 'binaryPath'>[] = [
      {
        id: 'nmap',
        name: 'Nmap Network Scanner',
        binary: 'nmap',
        category: 'Reconocimiento',
        description: 'Descubrimiento de hosts, puertos abiertos, versiones de servicios y scripts NSE.',
        intrusionLevel: 'Moderado',
        defaultArgsTemplate: 'nmap -sT --open -Pn -p 22,80,443,3000,3777,5432,8000,8080,11434,18888 {target}',
        jsonSchema: {
          type: 'object',
          properties: {
            target: { type: 'string', description: 'IP, rango CIDR o dominio objetivo (ej. 127.0.0.1 o 192.168.1.50)' },
            ports: { type: 'string', description: 'Puertos a escanear (ej. 80,443,8080 o 1-1000)' },
            serviceVersion: { type: 'boolean', description: 'Detectar versiones exactas (-sV)' }
          },
          required: ['target']
        }
      },
      {
        id: 'whois',
        name: 'Whois Domain Intelligence',
        binary: 'whois',
        category: 'OSINT',
        description: 'Consulta pasiva de registros de dominio, bloques ASN y contactos de red.',
        intrusionLevel: 'Pasivo',
        defaultArgsTemplate: 'whois {target}',
        jsonSchema: {
          type: 'object',
          properties: {
            target: { type: 'string', description: 'Dominio o dirección IP pública a consultar' }
          },
          required: ['target']
        }
      },
      {
        id: 'whatweb',
        name: 'WhatWeb Tech Fingerprinter',
        binary: 'whatweb',
        category: 'Web',
        description: 'Identifica tecnologías web, servidores HTTP, CMS, cabeceras de seguridad y frameworks.',
        intrusionLevel: 'Pasivo',
        defaultArgsTemplate: 'whatweb -a 1 {target}',
        jsonSchema: {
          type: 'object',
          properties: {
            target: { type: 'string', description: 'URL o host web objetivo (ej. http://127.0.0.1:3777)' },
            aggression: { type: 'number', description: 'Nivel de intrusión (1: Pasivo/Sigiloso, 3: Agresivo)' }
          },
          required: ['target']
        }
      },
      {
        id: 'nuclei',
        name: 'Nuclei Vulnerability Scanner',
        binary: 'nuclei',
        category: 'Web',
        description: 'Escáner de vulnerabilidades basado en plantillas YAML para CVEs y malas configuraciones.',
        intrusionLevel: 'Agresivo',
        defaultArgsTemplate: 'nuclei -u {target} -jsonl -silent',
        jsonSchema: {
          type: 'object',
          properties: {
            target: { type: 'string', description: 'URL objetivo a auditar' },
            severity: { type: 'string', description: 'Filtro de severidad (critical,high,medium)' }
          },
          required: ['target']
        }
      },
      {
        id: 'ffuf',
        name: 'FFUF Web Fuzzer',
        binary: 'ffuf',
        category: 'Web',
        description: 'Fuzzer web de alta velocidad escrito en Go para descubrimiento de directorios y parámetros.',
        intrusionLevel: 'Agresivo',
        defaultArgsTemplate: 'ffuf -u {target}/FUZZ -w /usr/share/wordlists/dirb/common.txt -mc 200,301,302,403',
        jsonSchema: {
          type: 'object',
          properties: {
            target: { type: 'string', description: 'URL base objetivo' },
            wordlist: { type: 'string', description: 'Ruta al diccionario de palabras' }
          },
          required: ['target']
        }
      },
      {
        id: 'gobuster',
        name: 'Gobuster URI/DNS Bruteforcer',
        binary: 'gobuster',
        category: 'Web',
        description: 'Enumeración de directorios, archivos ocultos y subdominios DNS.',
        intrusionLevel: 'Agresivo',
        defaultArgsTemplate: 'gobuster dir -u {target} -w /usr/share/wordlists/dirb/common.txt -q',
        jsonSchema: {
          type: 'object',
          properties: {
            target: { type: 'string', description: 'URL base objetivo' }
          },
          required: ['target']
        }
      },
      {
        id: 'tshark',
        name: 'TShark Network Analyzer',
        binary: 'tshark',
        category: 'Red',
        description: 'Captura y análisis profundo de paquetes de red e inspección de protocolos en tiempo real.',
        intrusionLevel: 'Pasivo',
        defaultArgsTemplate: 'tshark -i any -c 50 -n',
        jsonSchema: {
          type: 'object',
          properties: {
            interface: { type: 'string', description: 'Interfaz de red (ej. any, lo, wlan0)' },
            packetCount: { type: 'number', description: 'Número máximo de paquetes a inspeccionar' },
            filter: { type: 'string', description: 'Filtro de captura o visualización' }
          }
        }
      },
      {
        id: 'semgrep',
        name: 'Semgrep SAST Code Auditor',
        binary: 'semgrep',
        category: 'Auditoría de Código',
        description: 'Análisis estático de código fuente (SAST) para detectar patrones inseguros, inyecciones y CWEs.',
        intrusionLevel: 'Pasivo',
        defaultArgsTemplate: 'semgrep scan --config=auto --json {target}',
        jsonSchema: {
          type: 'object',
          properties: {
            target: { type: 'string', description: 'Ruta local del directorio o proyecto a auditar (ej. /home/saghet/Documents/SamulibreLinux)' }
          },
          required: ['target']
        }
      },
      {
        id: 'trivy',
        name: 'Trivy SCA & Misconfig Scanner',
        binary: 'trivy',
        category: 'Auditoría de Código',
        description: 'Escáner de vulnerabilidades en dependencias (Cargo.lock, package-lock.json), contenedores e IaC.',
        intrusionLevel: 'Pasivo',
        defaultArgsTemplate: 'trivy fs --scanners vuln,secret --format json {target}',
        jsonSchema: {
          type: 'object',
          properties: {
            target: { type: 'string', description: 'Ruta del proyecto local a inspeccionar' }
          },
          required: ['target']
        }
      }
    ];

    return rawTools.map(t => {
      const check = this.checkBinary(t.binary);
      return {
        ...t,
        installed: check.installed,
        binaryPath: check.path
      };
    });
  }

  /**
   * Sanitiza un objetivo (IP, URL o ruta local) para prevenir inyección de comandos
   */
  public static sanitizeTarget(raw: string): string {
    return raw.replace(/[;&|`$><\n\r]/g, '').trim();
  }

  /**
   * Construye una propuesta Human-in-the-Loop (HITL) explicando cada parámetro antes de ejecutar
   */
  public static createHITLProposal(toolId: string, rawTarget: string, customCommand?: string): HITLCommandProposal {
    const catalog = this.getCatalog();
    const tool = catalog.find(t => t.id === toolId) || catalog[0];
    const target = this.sanitizeTarget(rawTarget || '127.0.0.1');

    const command = customCommand
      ? customCommand.replace(/[;&|`$><\n\r]/g, '').trim()
      : tool.defaultArgsTemplate.replace('{target}', target);

    const tokens = command.split(/\s+/);
    const explanations: ParamExplanation[] = [];

    explanations.push({
      flag: tokens[0],
      description: `Binario principal: ${tool.name} (${tool.installed ? 'Nativo en Linux' : 'Motor integrado Kodara de respaldo'})`
    });

    for (let i = 1; i < tokens.length; i++) {
      const tk = tokens[i];
      if (FLAG_DICTIONARY[tk]) {
        explanations.push({ flag: tk, description: FLAG_DICTIONARY[tk] });
      } else if (tk.startsWith('--config=')) {
        explanations.push({ flag: tk, description: 'Reglas de análisis estático y patrones CWE/OWASP' });
      } else if (tk === target || tk.includes(target)) {
        explanations.push({ flag: tk, description: 'Objetivo (Host / URL / Ruta de código) bajo alcance autorizado' });
      } else if (tk.startsWith('-')) {
        explanations.push({ flag: tk, description: `Parámetro de configuración de ${tool.binary}` });
      }
    }

    return {
      proposalId: 'hitl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      toolId: tool.id,
      toolName: tool.name,
      category: tool.category,
      target,
      command,
      intrusionLevel: tool.intrusionLevel,
      paramExplanations: explanations,
      installed: tool.installed,
      fallbackAvailable: true,
      createdAt: new Date().toISOString()
    };
  }
}
