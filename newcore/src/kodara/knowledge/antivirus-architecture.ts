// ═══════════════════════════════════════════════════════════════
// KODARA KNOWLEDGE ENGINE — Arquitectura Experta de Suites Antivirus (EDR)
// "Your Code. Your AI. Your Rules."
// Corpus ontológico de ingeniería de software en Rust transferido desde
// la suite SamuLibre para que la IA de Kodara comprenda en lenguaje
// natural cómo concebir, diseñar y construir cada subsistema de un antivirus.
// ═══════════════════════════════════════════════════════════════

export interface AntivirusSubsystem {
  id: string;
  name: string;
  summary: string;
  rustConcepts: string[];
  keyLibraries: string[];
  designPatterns: string[];
  naturalLanguageQueries: string[];
  implementationGuide: string;
}

export const SAMULIBRE_ANTIVIRUS_KNOWLEDGE: AntivirusSubsystem[] = [
  {
    id: 'scanner-engine',
    name: 'Motor Multi-Capa de Detección Estática y Heurística',
    summary:
      'Inspección masiva de archivos en paralelo combinando reglas YARA-X, base de firmas ClamAV, cálculo de entropía de Shannon (para detectar payloads comprimidos o empaquetados con UPX) y hashes SHA-256.',
    rustConcepts: [
      'rayon::prelude::* para escaneo multi-hilo paralelo en CPU de alto rendimiento',
      'walkdir::WalkDir con filtrado por profundidad y exclusión de directorios del sistema',
      'std::sync::Arc<std::sync::Mutex<Scanner>> para compartir el motor entre hilos sin copias pesadas',
      'win_eco::set_current_thread_eco_qos() para ejecutar hilos en prioridad baja (nice 19 en Linux) y evitar congelar la PC',
    ],
    keyLibraries: ['yara-x', 'clamav-sys / libclamav', 'rayon', 'sha2', 'walkdir'],
    designPatterns: [
      'Pipeline de filtros en cascada (Filtro por extensión/tamaño -> Hash SHA-256 -> Reglas YARA -> Descompresión recursiva)',
      'Worker Pool con límite de hilos según núcleos físicos libres',
    ],
    naturalLanguageQueries: [
      'haz que el escáner sea más rápido',
      'cómo detectar virus sin bloquear la computadora',
      'analiza si un archivo tiene malware',
      'quiero escanear carpetas completas en segundo plano',
      'agrega soporte para reglas yara',
    ],
    implementationGuide:
      'Para construir un escáner de alta velocidad en Rust, asla la lógica de lectura en un trait `FileInspector`. Mide primero el hash SHA-256 contra una base de datos SQLite indexada en memoria; si no coincide, evalúa las reglas YARA compiladas. Utiliza `rayon::current_num_threads()` acotado a los núcleos disponibles menos dos para preservar la fluidez del entorno gráfico.',
  },
  {
    id: 'anti-ransomware-canaries',
    name: 'Sistema de Trampas Canario (Honeyfiles Tripwire)',
    summary:
      'Mecanismo de detección temprana de ransomware sin falsos positivos: siembra archivos cebo con patrones realistas en carpetas habituales (Documentos, Escritorio, Descargas) y vigila modificaciones de hash o extensiones raras.',
    rustConcepts: [
      'notify::Watcher para vigilancia de eventos de inotify / ReadDirectoryChangesW',
      'Cálculo continuo de hash SHA-256 de los señuelos al recibir eventos de escritura',
      'std::sync::atomic::AtomicBool para pausar procesos sospechosos al detectar cifrado',
    ],
    keyLibraries: ['notify', 'sha2', 'hex'],
    designPatterns: [
      'Tripwire Pattern: Si un canario cambia de hash o es renombrado, se asume ataque en curso',
      'Zero-Latency Alert: Notificación inmediata antes de que el ransomware alcance archivos reales',
    ],
    naturalLanguageQueries: [
      'cómo proteger contra ransomware',
      'quiero detectar secuestros de archivos al instante',
      'pon trampas para ransomware',
      'evita que cifren mis fotos o documentos',
    ],
    implementationGuide:
      'Siembra al menos 4 archivos señuelo distribuidos estratégicamente (`presupuesto_2026.docx`, `respaldo_fotos.zip`). Mantén en memoria un mapa `HashMap<PathBuf, [u8; 32]>` con los hashes SHA-256 originales. Al dispararse un evento `Modify` en cualquiera de los señuelos, valida el nuevo hash; ante cualquier alteración no autorizada, aísla el proceso emisor mediante SIGSTOP/SuspendProcess.',
  },
  {
    id: 'memory-shield-infostealers',
    name: 'Escudo Endpoint y Blindaje de Memoria Anti-InfoStealers',
    summary:
      'Protección contra troyanos ladrones de credenciales (RedLine, Vidar, Lumma, Raccoon) que intentan volcar almacenes DPAPI de navegadores (Chrome, Firefox, Edge, Brave) o extraer memoria LSASS.',
    rustConcepts: [
      'Auditoría de llamadas OpenProcess / PROCESS_VM_READ en Windows y ptrace en Linux',
      'Detección de procesos anómalos leyendo rutas de perfil de usuario (%LOCALAPPDATA%/Google/Chrome/User Data)',
      'Aislamiento de sockets de red sospechosos que transmiten zips con extensiones .sqlite o .cookie',
    ],
    keyLibraries: ['sysinfo', 'libc', 'winapi / windows-sys'],
    designPatterns: [
      'Process Whitelist Enforcement: Solo los binarios firmados del navegador pueden acceder a sus propios archivos de sesión',
      'Decoy Credential Vaults: Base de datos SQLite señuelo para capturar ladrones de tokens',
    ],
    naturalLanguageQueries: [
      'cómo evitar que me roben las contraseñas del navegador',
      'protege mis cookies y sesiones',
      'bloquea troyanos infostealers',
      'evita que lean la memoria de procesos críticos',
    ],
    implementationGuide:
      'Monitorea con un hilo daemon los procesos activos mediante `sysinfo::System`. Si un binario no reconocido intenta acceder a las carpetas `Default/Network/Cookies` o `Login Data`, bloquea el descriptor de archivo, termina el proceso malicioso y traslada el ejecutable a la bóveda de cuarentena cifrada con XOR.',
  },
  {
    id: 'virtual-patcher',
    name: 'Centinela de Vulnerabilidades (Virtual Patching en Memoria)',
    summary:
      'Mitigación en caliente de vulnerabilidades críticas conocidas (CVEs) interceptando vectores de explotación en memoria o en red sin necesidad de reiniciar la máquina ni esperar parches oficiales del sistema operativo.',
    rustConcepts: [
      'Filtrado de patrones de payload en memoria y buffers de red',
      'Desactivación segura de protocolos inseguros (SMBv1, LLMNR, NetBIOS)',
      'Inspección de KBs y boletines de seguridad (ASB / MSRC)',
    ],
    keyLibraries: ['regex', 'serde_json', 'samulibre_types'],
    designPatterns: [
      'Virtual Shielding: Parchear en la capa de transporte o aplicación en lugar de modificar binarios del sistema',
      'Autonomous Sentinel Audit: Ciclos periódicos de auditoría cada 15 minutos en segundo plano',
    ],
    naturalLanguageQueries: [
      'corrige vulnerabilidades sin reiniciar la pc',
      'cómo funciona el parchado virtual',
      'protégeme de vulnerabilidades de día cero',
      'aplica parches de seguridad automáticos',
    ],
    implementationGuide:
      'Crea una estructura `VirtualPatchRule` con campos `cve_id`, `affected_service`, `mitigation_state` y `auto_apply`. En Linux/Android, monitoriza puertos abiertos y reglas iptables/nftables; en Windows, ajusta claves de registro de mitigación Exploit Guard y desactiva superficies de ataque conocidas.',
  },
  {
    id: 'apple-style-gui-rust',
    name: 'Interfaz Nativa Translúcida Estilo macOS/Apple en Rust',
    summary:
      'Diseño visual minimalista, oscuro y elegante con bordes translúcidos (glassmorphism), botones semáforo, Tailwind CSS offline embebido y WebView ultra ligero con consumo de memoria menor a 40 MB.',
    rustConcepts: [
      'tao::window::WindowBuilder con decoraciones y soporte GTK/WebKit en Linux',
      'wry::WebViewBuilder con .with_html() embebiendo CSS y JavaScript localmente',
      'IPC bidireccional mediante with_ipc_handler() y webview.evaluate_script()',
      'win_eco::trim_process_working_set() para devolver la memoria no utilizada al sistema (malloc_trim en Linux)',
    ],
    keyLibraries: ['tao', 'wry', 'serde_json', 'image'],
    designPatterns: [
      'Single Instance Guard: Listener en puerto TCP local para que un segundo clic traiga la ventana al frente',
      'Zero-Dependency Offline Bundle: HTML, iconos PNG y CSS Tailwind embebidos con include_str! / include_bytes!',
    ],
    naturalLanguageQueries: [
      'cómo hacer que la interfaz se vea moderna y bonita',
      'haz una interfaz como la de apple para linux',
      'agrega un recuadro de uso de hardware en el sidebar',
      'muestra la memoria ram y el cpu en tiempo real',
      'conecta la interfaz web con el backend en rust',
    ],
    implementationGuide:
      'Construye la ventana con `tao` configurando un tamaño inicial de 1060x690 y un identificador Freedesktop canónico. Usa `wry` para cargar un template HTML minimalista que incluya Tailwind CSS sin conexión a internet. Para enviar telemetría en vivo, invoca `webview.evaluate_script("window.onTelemetry(...)")` cada pocos segundos desde un hilo de segundo plano.',
  },
];

export class AntivirusKnowledgeEngine {
  /**
   * Genera el bloque de contexto cognitivo que le enseña al LLM (GLM-4.7)
   * cómo razonar y responder con la solvencia técnica de un arquitecto de antivirus.
   */
  public static buildAntivirusArchitecturePromptBlock(userQuery: string = ''): string {
    const lower = userQuery.toLowerCase();
    const relevantSubsystems = SAMULIBRE_ANTIVIRUS_KNOWLEDGE.filter((sub) => {
      if (!userQuery) return true;
      if (
        lower.includes('antivirus') ||
        lower.includes('samulibre') ||
        lower.includes('seguridad') ||
        lower.includes('edr') ||
        lower.includes('virus') ||
        lower.includes('malware')
      ) {
        return true;
      }
      return sub.naturalLanguageQueries.some((q) =>
        lower.includes(q) || q.split(' ').some((word) => word.length > 4 && lower.includes(word))
      );
    });

    const lines: string[] = [
      `=== BASE DE CONOCIMIENTO EXPERTO: CÓMO CONSTRUIR UN ANTIVIRUS MODERNO EN RUST (REFERENCIA SAMULIBRE) ===`,
      `Como asistente de ingeniería de IA de Kodara, tienes dominio completo sobre la arquitectura, diseño y código de la suite de ciberseguridad SamuLibre. Utiliza este conocimiento para responder con naturalidad, solvencia técnica y empatía:`,
    ];

    for (const sub of relevantSubsystems) {
      lines.push(`\n[Subsistema: ${sub.name}]`);
      lines.push(`• Propósito: ${sub.summary}`);
      lines.push(`• Conceptos Clave en Rust:`);
      sub.rustConcepts.forEach((c) => lines.push(`  - ${c}`));
      lines.push(`• Patrones de Diseño: ${sub.designPatterns.join(' | ')}`);
      lines.push(`• Guía de Implementación: ${sub.implementationGuide}`);
    }

    lines.push(
      `\nDIRECTRIZ DE LENGUAJE NATURAL (NO ROBOTIZADO):`,
      `1. Habla como un compañero de programación experto y empático (estilo Google Antigravity). Explica las decisiones técnicas con claridad y calidez.`,
      `2. No uses respuestas enlatadas ni listas rígidas si no son necesarias; conversa de manera orgánica con el usuario.`,
      `3. Si el usuario te pide implementar algo en SamuLibre, ubica con precisión en qué crate o archivo debe residir (ej. crates/samulibre-gui, crates/samulibre-scanner, data/ui/index.html) y ofrece soluciones funcionales directas.`
    );

    return lines.join('\n');
  }
}
