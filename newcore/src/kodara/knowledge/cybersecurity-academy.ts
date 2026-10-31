// ═══════════════════════════════════════════════════════════════
// KODARA CYBERSECURITY ACADEMY — Currículo Universitario de Pregrado
// "Your Code. Your AI. Your Rules."
// Investigación de mercado y transferencia de conocimiento pedagógico
// de los 10 grandes pilares de herramientas estilo Kali Linux:
// Reconocimiento, Análisis de Vulnerabilidades, Seguridad Web, Redes,
// Criptografía, Ingeniería Inversa, Forense Digital, Redes Inalámbricas,
// Auditoría de Endpoints (EDR) y Reportes/MITRE ATT&CK.
// ═══════════════════════════════════════════════════════════════

export interface AcademicModule {
  id: string;
  name: string;
  semester: string;
  kaliArchetype: string;
  pedagogicalObjective: string;
  theoreticalFoundations: string[];
  softwareArchitecture: string[];
  rustTsLibraries: string[];
  laboratoryExercises: string[];
  masterTeacherPrompt: string;
}

export const CYBERSECURITY_ACADEMY_CURRICULUM: AcademicModule[] = [
  {
    id: 'recon-osint',
    name: 'Módulo 1: Reconocimiento Activo, Pasivo y OSINT',
    semester: 'Semestre I — Fundamentos de Superficie de Ataque',
    kaliArchetype: 'Nmap, Amass, TheHarvester, Whois, Dig',
    pedagogicalObjective:
      'Comprender cómo cartografiar activos digitales, consultar registros de nombres (DNS) y explorar puertos sin generar denegación de servicio, entendiendo las respuestas TCP/IP.',
    theoreticalFoundations: [
      'Modelo OSI vs TCP/IP: Encapsulamiento de tramas y datagramas',
      'Protocolos DNS: Registros A, AAAA, MX, TXT, SOA y transferencias de zona AXFR',
      'Técnicas de escaneo: SYN Stealth Scan (half-open), TCP Connect, UDP Scan y ACK Scan',
    ],
    softwareArchitecture: [
      'Uso de Sockets no bloqueantes (non-blocking) con epoll en Linux y kqueue en macOS',
      'Bucle de eventos asíncrono con `tokio` en Rust para procesar miles de puertos en segundos',
      'Parser de paquetes con cabeceras raw usando `pnet` o `socket2`',
    ],
    rustTsLibraries: ['pnet', 'tokio', 'trust-dns-resolver / hickory-resolver', 'socket2'],
    laboratoryExercises: [
      'Laboratorio 1.1: Construir un escáner TCP SYN minimalista en Rust que detecte banners de servicios.',
      'Laboratorio 1.2: Programar un resolvedor DNS asíncrono que detecte subdominios y registros SPF/DMARC.',
    ],
    masterTeacherPrompt:
      'Enseña al alumno que un escáner no es un "ataque mágico", sino una conversación ordenada de paquetes TCP. Explica cómo interpretar la respuesta SYN-ACK frente a RST, y cómo estructurar código en Rust para manejar la concurrencia con semáforos asíncronos.',
  },
  {
    id: 'vuln-assessment',
    name: 'Módulo 2: Análisis de Vulnerabilidades & Detección de Fallas',
    semester: 'Semestre II — Diagnóstico de Seguridad y Auditoría de Código',
    kaliArchetype: 'OpenVAS, Nikto, Semgrep, Trivy, Nuclei',
    pedagogicalObjective:
      'Aprender a correlacionar versiones de software con bases de datos CVE, identificar malas configuraciones y realizar auditorías estáticas (SAST) y dinámicas (DAST).',
    theoreticalFoundations: [
      'Taxonomía de debilidades comunes (CWE) y métricas de severidad CVSS v3.1 / v4.0',
      'Análisis sintáctico abstracto (AST) para auditoría de código seguro',
      'Firmas basadas en plantillas declarativas (formato YAML estilo Nuclei)',
    ],
    softwareArchitecture: [
      'Árboles de Sintaxis Abstracta (AST) usando `tree-sitter` o `syn` en Rust para encontrar llamadas inseguras',
      'Motor de cotejo de expresiones regulares optimizadas con `regex::RegexSet`',
      'Base de datos relacional SQLite o en memoria para caché local de boletines NVD/CVE',
    ],
    rustTsLibraries: ['tree-sitter', 'syn', 'regex', 'rusqlite', 'serde_yaml'],
    laboratoryExercises: [
      'Laboratorio 2.1: Crear un linter SAST en Rust que busque patrones de desreferenciación nula y bloques `unsafe` desprotegidos.',
      'Laboratorio 2.2: Diseñar un evaluador de plantillas HTTP para auditar cabeceras de servidores web.',
    ],
    masterTeacherPrompt:
      'Guía al alumno para que distinga entre un falso positivo y una vulnerabilidad explotable. Explica la importancia del análisis contextual y cómo las dependencias de terceros pueden introducir riesgos en la cadena de suministro.',
  },
  {
    id: 'web-security',
    name: 'Módulo 3: Seguridad en Aplicaciones Web & APIs',
    semester: 'Semestre III — Auditoría de Servicios Web y OWASP Top 10',
    kaliArchetype: 'Burp Suite, OWASP ZAP, Wfuzz, Sqlmap',
    pedagogicalObjective:
      'Dominar la arquitectura de aplicaciones web modernas, interceptación de tráfico HTTP/HTTPS, auditoría de APIs REST/GraphQL y mitigación de vulnerabilidades OWASP Top 10.',
    theoreticalFoundations: [
      'Top 10 de OWASP: Inyecciones (SQLi, NoSQL, Command), Broken Authentication, XSS, SSRF, Deserialización insegura',
      'Mecanismos de defensa del navegador: Same-Origin Policy (SOP), CORS, Content Security Policy (CSP), cookies HttpOnly/Secure',
      'Seguridad en Tokens: JWT (firmas HMAC vs RSA/ECDSA, prevención del ataque `alg: none`)',
    ],
    softwareArchitecture: [
      'Proxy man-in-the-middle (MITM) con generación dinámica de certificados TLS autofirmados usando `rustls` y `rcgen`',
      'Parser y decodificador de streams HTTP/1.1 y HTTP/2 con `hyper` o `h2`',
      'Fuzzer inteligente con generación de mutaciones de carga útil y análisis de respuestas por código HTTP y longitud',
    ],
    rustTsLibraries: ['hyper', 'rustls', 'rcgen', 'jsonwebtoken', 'reqwest'],
    laboratoryExercises: [
      'Laboratorio 3.1: Desarrollar un proxy HTTP local en Rust que intercepte peticiones y alerte sobre cookies sin la bandera Secure.',
      'Laboratorio 3.2: Programar un detector de reflexiones de parámetros URL para identificar posibles vectores XSS.',
    ],
    masterTeacherPrompt:
      'Transmite al alumno que la seguridad web se basa en no confiar jamás en las entradas del cliente. Enséñale a validar siempre mediante tipado estricto, consultas parametrizadas y cabeceras defensivas robustas.',
  },
  {
    id: 'network-traffic',
    name: 'Módulo 4: Inspección de Tráfico de Red & Protocolos (Sniffing)',
    semester: 'Semestre IV — Análisis de Paquetes y Telemetría en Vivo',
    kaliArchetype: 'Wireshark, TShark, Tcpdump, Bettercap',
    pedagogicalObjective:
      'Aprender a capturar, filtrar y reconstruir flujos de red a nivel de bytes, identificando anomalías de tráfico y comunicaciones sospechosas.',
    theoreticalFoundations: [
      'Filtros de captura Berkeley Packet Filter (BPF) a nivel de kernel',
      'Reensamblado de flujos TCP (TCP stream reassembly) y manejo de paquetes desordenados',
      'Detección de exfiltración de datos encubierta (túneles DNS, ICMP payloads)',
    ],
    softwareArchitecture: [
      'Bindings nativos con `libpcap` o implementación pura en Linux mediante `AF_PACKET` y `PACKET_MMAP`',
      'Estructuras de anillo de memoria compartida (ring buffer) para captura a alta velocidad sin pérdida de paquetes',
      'Canales de mensajería concurrentes `crossbeam-channel` para separar el hilo de captura del hilo de análisis',
    ],
    rustTsLibraries: ['pcap', 'etherparse', 'crossbeam-channel', 'tls-parser'],
    laboratoryExercises: [
      'Laboratorio 4.1: Crear un sniffer en Rust que capture tráfico DNS y liste las consultas emitidas por la máquina en tiempo real.',
      'Laboratorio 4.2: Programar un extractor de metadatos TLS que extraiga el Server Name Indication (SNI) de los paquetes Client Hello.',
    ],
    masterTeacherPrompt:
      'Recuérdale al alumno que un buen analista de red sabe leer los bytes hexadecimales crudos. Explica con claridad cómo los flags de control y los números de secuencia permiten reconstruir una sesión completa.',
  },
  {
    id: 'cryptography-audit',
    name: 'Módulo 5: Criptografía Aplicada & Auditoría de Credenciales',
    semester: 'Semestre V — Criptoanálisis Defensivo y Gestión de Secretos',
    kaliArchetype: 'Hashcat, John the Ripper, Hydra',
    pedagogicalObjective:
      'Comprender las matemáticas de la criptografía moderna, la diferencia entre cifrado reversible y funciones hash, y cómo evaluar la robustez de contraseñas.',
    theoreticalFoundations: [
      'Criptografía simétrica (AES-GCM, ChaCha20-Poly1305) vs asimétrica (RSA, Curve25519, Ed25519)',
      'Ataques de colisión, ataques de longitud de extensión y tablas de consulta precalculadas (Rainbow Tables)',
      'Funciones de derivación de claves con coste de memoria (Memory-Hard Functions): Argon2id, scrypt',
    ],
    softwareArchitecture: [
      'Aceleración por hardware (instrucciones AES-NI y AVX2/AVX-512) para cálculo de hashes de alta velocidad',
      'Generadores de secuencias pseudoaleatorias criptográficamente seguras (CSPRNG) con `getrandom` / `/dev/urandom`',
      'Comparaciones en tiempo constante (constant-time comparison) para prevenir ataques de canal lateral (timing attacks)',
    ],
    rustTsLibraries: ['ring', 'argon2', 'aes-gcm', 'subtle', 'blake3'],
    laboratoryExercises: [
      'Laboratorio 5.1: Programar un verificador de contraseñas seguro que compare hashes en tiempo constante utilizando `subtle::ConstantTimeEq`.',
      'Laboratorio 5.2: Implementar un medidor de entropía de contraseñas que detecte patrones comunes y fechas de nacimiento.',
    ],
    masterTeacherPrompt:
      'Enseña al alumno la regla de oro: "Nunca inventes tu propia criptografía". Guíalo para que comprenda por qué un simple hash SHA-256 es peligroso para contraseñas y cómo Argon2id protege contra ataques basados en GPU.',
  },
  {
    id: 'reverse-engineering',
    name: 'Módulo 6: Ingeniería Inversa Defensiva & Análisis de Binarios',
    semester: 'Semestre VI — Arquitectura de CPU, Desensamblado y Depuración',
    kaliArchetype: 'Ghidra, Radare2 / Rizin, GDB, Capstone, Objdump',
    pedagogicalObjective:
      'Aprender a desarmar binarios compilados (x86_64 y ARM64), rastrear el flujo de control, examinar instrucciones en ensamblador y desentrañar rutinas ofuscadas.',
    theoreticalFoundations: [
      'Arquitectura de procesador x86_64: Registros (RAX, RBX, RCX, RDX, RSI, RDI, RSP, RBP, RIP), pila (stack) y montículo (heap)',
      'Convenciones de llamada (Calling Conventions): System V AMD64 ABI (Linux) vs Microsoft x64',
      'Análisis estático vs dinámico: Desensamblado lineal vs recursivo, tablas de saltos y grafos de flujo de control (CFG)',
    ],
    softwareArchitecture: [
      'Motor de desensamblado basado en `capstone` para convertir bytes binarios en mnemónicos legibles',
      'Parser de archivos ejecutables `object` o `goblin` para extraer secciones `.text`, tablas de importación y exports',
      'Técnicas de instrumentación binaria ligera mediante `ptrace` en Linux para pausar y leer registros de CPU',
    ],
    rustTsLibraries: ['capstone', 'goblin', 'object', 'nix (ptrace)'],
    laboratoryExercises: [
      'Laboratorio 6.1: Crear una herramienta en Rust que lea un ejecutable ELF y muestre todas las funciones exportadas y cadenas visibles (`strings`).',
      'Laboratorio 6.2: Programar un trazador de llamadas al sistema (strace minimalista) utilizando `ptrace(PTRACE_SYSCALL)`.',
    ],
    masterTeacherPrompt:
      'Muestra al alumno cómo el código fuente de alto nivel se traduce en instrucciones de máquina. Explica la estructura de un prólogo y epílogo de función, y cómo leer un desensamblado como si fuera una partitura musical.',
  },
  {
    id: 'digital-forensics',
    name: 'Módulo 7: Forense Digital & Respuesta a Incidentes (DFIR)',
    semester: 'Semestre VII — Preservación de Evidencia y Análisis de Memoria',
    kaliArchetype: 'Autopsy, Volatility, Binwalk, Foremost, Sleuth Kit',
    pedagogicalObjective:
      'Dominar la cadena de custodia, la extracción de artefactos en memoria volátil (RAM), el análisis de sistemas de archivos y la reconstrucción de líneas temporales de incidentes.',
    theoreticalFoundations: [
      'Orden de volatilidad de la evidencia (Registros de CPU/Caché -> Memoria RAM -> Estado de red -> Disco duro -> Medios de respaldo)',
      'Estructuras internas del kernel de Linux: listas circulares de procesos (`task_struct`), descriptores de archivo y sockets',
      'Técnicas de File Carving: Recuperación de archivos borrados basada en números mágicos de cabecera y pie',
    ],
    softwareArchitecture: [
      'Lectura de volcados de memoria cruda (raw memory dumps) y parsing de estructuras del kernel',
      'Cálculo de hashes criptográficos SHA-256 inmediatos para garantizar la no alteración de evidencias (inmutabilidad)',
      'Generador de líneas de tiempo (Timeline Analysis) unificando timestamps de archivos, logs del sistema y eventos de red',
    ],
    rustTsLibraries: ['memmap2', 'chrono', 'sha2', 'walkdir'],
    laboratoryExercises: [
      'Laboratorio 7.1: Desarrollar un extractor de firmas mágicas en Rust que recupere imágenes PNG y PDFs de un archivo binario dañado.',
      'Laboratorio 7.2: Crear un recolector de artefactos del sistema en Linux (/proc, /etc/passwd, utmp/wtmp) generando un informe firmado.',
    ],
    masterTeacherPrompt:
      'Inculca al alumno el rigor científico forense: una evidencia modificada pierde toda validez jurídica y técnica. Enséñale a trabajar siempre sobre copias forenses de solo lectura (bit-a-bit).',
  },
  {
    id: 'wireless-iot',
    name: 'Módulo 8: Seguridad en Redes Inalámbricas & Entornos IoT',
    semester: 'Semestre VIII — Radiofrecuencia, 802.11 y Protocolos Embebidos',
    kaliArchetype: 'Aircrack-ng, Kismet, Scapy',
    pedagogicalObjective:
      'Comprender el espectro radioeléctrico, tramas de gestión 802.11 (Beacons, Probe Requests, Deauth), autenticación WPA2/WPA3 y seguridad en dispositivos IoT.',
    theoreticalFoundations: [
      'Arquitectura del estándar IEEE 802.11: Modos Managed, Monitor, Ad-hoc y Master',
      'Intercambio de claves en 4 pasos (4-Way Handshake) en WPA2-PSK vs Simultaneous Authentication of Equals (SAE) en WPA3',
      'Protocolos ligeros de IoT: MQTT, CoAP, BLE (Bluetooth Low Energy) y sus vectores de ataque habituales',
    ],
    softwareArchitecture: [
      'Configuración de interfaces de red inalámbricas en modo monitor mediante llamadas `nl80211` en Linux',
      'Parser de cabeceras Radiotap para medir la intensidad de señal (RSSI), canal y modulación',
      'Filtro de captura para aislamiento de tramas de gestión y autenticación sin saturar buffers de memoria',
    ],
    rustTsLibraries: ['pnet', 'radiotap', 'tokio'],
    laboratoryExercises: [
      'Laboratorio 8.1: Crear un detector de puntos de acceso Wi-Fi no autorizados (Rogue APs) leyendo tramas Beacon con Rust.',
      'Laboratorio 8.2: Implementar un analizador de tráfico MQTT que verifique si los dispositivos IoT envían telemetría sin cifrado TLS.',
    ],
    masterTeacherPrompt:
      'Explica al alumno que las ondas de radio no tienen paredes físicas. Ayúdale a visualizar cómo las tramas viajan por el aire y por qué el cifrado de extremo a extremo es la única defensa real en entornos inalámbricos.',
  },
  {
    id: 'endpoint-edr',
    name: 'Módulo 9: Auditoría de Sistemas, EDR & Detección en Tiempo Real',
    semester: 'Semestre IX — Arquitectura de Defensas de Endpoint y Reglas YARA',
    kaliArchetype: 'Lynis, OSSEC, Sysinternals, YARA-X, SamuLibre EDR',
    pedagogicalObjective:
      'Aprender a diseñar un agente de seguridad de endpoint completo (EDR/Antivirus): monitoreo de procesos, detección de técnicas de persistencia y bloqueo de amenazas.',
    theoreticalFoundations: [
      'Mecanismos de persistencia en Linux: Systemd services, cron jobs, udev rules, `/etc/ld.so.preload`, perfiles de shell (`.bashrc`)',
      'Técnicas de evasión de detección: Procesos zombies, inyección en memoria sin tocar disco (fileless malware), desenganche de API',
      'Mitigaciones del kernel: AppArmor, SELinux, Seccomp BPF y Namespaces',
    ],
    softwareArchitecture: [
      'Arquitectura de microservicios o demonio único con hilos especializados y memoria compartida protegida con `Arc<Mutex<T>>`',
      'Monitoreo de eventos de archivos con `notify` (inotify en Linux) y lectura de telemetría de kernel en `/proc`',
      'Compilación y ejecución de firmas YARA en tiempo real sobre flujos de memoria de procesos sospechosos',
    ],
    rustTsLibraries: ['notify', 'sysinfo', 'yara-x', 'seccompiler'],
    laboratoryExercises: [
      'Laboratorio 9.1: Programar un auditor de persistencias en Rust que examine crontabs y servicios systemd en busca de comandos ofuscados.',
      'Laboratorio 9.2: Construir un monitor de procesos liviano que alerte si un proceso no autorizado abre puertos de escucha en el sistema.',
    ],
    masterTeacherPrompt:
      'Guía al alumno hacia la excelencia que ya demostró en SamuLibre: un agente defensivo debe ser invisible para el usuario (menos de 40 MB de RAM y consumo casi nulo de CPU), pero letalmente preciso contra el malware.',
  },
  {
    id: 'reporting-mitre',
    name: 'Módulo 10: Inteligencia de Amenazas, MITRE ATT&CK & Reportes Profesionales',
    semester: 'Semestre X — Trabajo de Grado, Métricas y Gestión Estratégica',
    kaliArchetype: 'MITRE ATT&CK Framework, DefectDojo, Maltego, CVSS Calculator',
    pedagogicalObjective:
      'Traducir hallazgos técnicos en planes de acción ejecutables para ingenieros y directivos, mapeando cada observación a las tácticas y técnicas de MITRE ATT&CK.',
    theoreticalFoundations: [
      'Matriz MITRE ATT&CK para Enterprise: De Reconnaissance e Initial Access hasta Exfiltration e Impact',
      'Pirámide del Dolor de David Bianco (Pyramid of Pain): Hashes -> IPs -> Dominios -> Artefactos de Red -> Herramientas -> TTPs',
      'Modelado de amenazas (Threat Modeling) con metodologías STRIDE y DREAD',
    ],
    softwareArchitecture: [
      'Generador automatizado de reportes ejecutivos y técnicos en formato Markdown y PDF estructurado',
      'Esquemas JSON fuertemente tipados con `serde` para exportar datos hacia sistemas SIEM o plataformas SOAR',
      'Cálculo algorítmico automatizado del vector CVSS v3.1/v4.0 según impacto en Confidencialidad, Integridad y Disponibilidad',
    ],
    rustTsLibraries: ['serde_json', 'chrono'],
    laboratoryExercises: [
      'Laboratorio 10.1: Desarrollar una herramienta CLI en Rust que reciba un hallazgo técnico y genere su mapeo exacto a las técnicas T1059, T1053 de MITRE ATT&CK.',
      'Laboratorio 10.2: Construir un generador de reportes de auditoría ejecutiva que resuma el estado de seguridad de un proyecto en una sola página.',
    ],
    masterTeacherPrompt:
      'Enséñale al alumno que el mejor análisis técnico no sirve de nada si no se comunica con claridad para que el equipo de desarrollo pueda corregirlo de inmediato. El verdadero maestro ingeniero une la profundidad técnica con la claridad pedagógica.',
  },
];

export class CybersecurityAcademyEngine {
  /**
   * Genera el bloque pedagógico del Profesor Mentor para enriquecer la mente
   * de la IA de Kodara (GLM-4.7) ante cualquier consulta de ciberseguridad o arquitectura.
   */
  public static buildTeacherPromptBlock(userQuery: string = ''): string {
    const lower = userQuery.toLowerCase();
    const matchedModules = CYBERSECURITY_ACADEMY_CURRICULUM.filter((mod) => {
      if (!userQuery) return true;
      if (
        lower.includes('ciberseguridad') ||
        lower.includes('kali') ||
        lower.includes('aprender') ||
        lower.includes('entrena') ||
        lower.includes('seguridad')
      ) {
        return true;
      }
      return (
        lower.includes(mod.id) ||
        mod.kaliArchetype.toLowerCase().split(',').some((tool) => lower.includes(tool.trim())) ||
        mod.theoreticalFoundations.some((f) => lower.includes(f.toLowerCase())) ||
        mod.rustTsLibraries.some((lib) => lower.includes(lib.toLowerCase()))
      );
    });

    const lines: string[] = [
      `=== ACADEMIA UNIVERSITARIA DE CIBERSEGURIDAD KODARA (NIVEL PREGRADO) ===`,
      `Rol Pedagógico Activo: Eres el Profesor Mentor Principal de Ingeniería de Ciberseguridad de Kodara.`,
      `Misión Educativa: Formar a la IA y al desarrollador para que dominen la concepción, diseño e implementación desde cero de cualquier herramienta de ciberseguridad (al nivel de la suite Kali Linux y el EDR SamuLibre), con el objetivo de que el alumno supere al maestro.`,
      ``,
      `METODOLOGÍA DE ENSEÑANZA EN 3 NIVELES PROGRESIVOS:`,
      `1. EL 'POR QUÉ' (Concepto y Matemáticas): Explica la física de la red o la lógica del sistema con una analogía clara y humana.`,
      `2. EL 'CÓMO' (Arquitectura de Software): Detalla qué estructuras de datos, sockets, hilos y protocolos se necesitan para que sea rápido y seguro.`,
      `3. LA 'CONSTRUCCIÓN' (Código Real): Muestra cómo se programa en Rust, TypeScript o Python de forma limpia, explicada paso a paso.`,
      ``,
      `MÓDULOS ACADÉMICOS RELEVANTES:`,
    ];

    for (const mod of matchedModules.slice(0, 4)) {
      lines.push(`\n[${mod.name} | ${mod.semester}]`);
      lines.push(`• Herramientas Arquetípicas de Referencia: ${mod.kaliArchetype}`);
      lines.push(`• Objetivo de Aprendizaje: ${mod.pedagogicalObjective}`);
      lines.push(`• Fundamentos Teóricos: ${mod.theoreticalFoundations.join(' | ')}`);
      lines.push(`• Arquitectura de Implementación: ${mod.softwareArchitecture.join(' | ')}`);
      lines.push(`• Bibliotecas Clave: ${mod.rustTsLibraries.join(', ')}`);
      lines.push(`• Directiva del Mentor: ${mod.masterTeacherPrompt}`);
    }

    lines.push(
      `\nCONSIGNA DEL PROFESOR:`,
      `Habla siempre con calidez, paciencia pedagógica y entusiasmo por el conocimiento. Anima al alumno a razonar y explorar, demostrando que con los fundamentos correctos no hay herramienta que no pueda ser construida.`
    );

    return lines.join('\n');
  }

  /**
   * Devuelve la lista completa de asignaturas universitarias para ser expuestas
   * en la API REST y en la interfaz visual de Kodara.
   */
  public static getAllModules(): AcademicModule[] {
    return CYBERSECURITY_ACADEMY_CURRICULUM;
  }
}
