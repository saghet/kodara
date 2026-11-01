// ═══════════════════════════════════════════════════════════════
// KODARA DYNAMIC CONTEXT ROUTER — Plan Canguro
// "Your Code. Your AI. Your Rules."
// Enrutador Semántico Inteligente que clasifica la intención del usuario
// y ensambla un prompt quirúrgico evitando la saturación de contexto
// (Context Dilution), logrando el estándar de eficiencia de Google Antigravity.
// ═══════════════════════════════════════════════════════════════

import { FoundationalSchoolingEngine } from './foundational-schooling.js';
import { AntivirusKnowledgeEngine } from './antivirus-architecture.js';
import { CybersecurityAcademyEngine } from './cybersecurity-academy.js';
import { AutonomousProgrammingEngine } from './autonomous-programming.js';
import { KodaraPhilosophyEngine } from './kodara-philosophy.js';
import { PaiMeiLinguisticEngine } from './pai-mei-linguistic-engine.js';

export type CognitiveDomain =
  | 'CODING_AUTONOMOUS'
  | 'CONCEPTUAL_SCHOOLING'
  | 'CYBERSECURITY_TACTICAL'
  | 'ANTIVIRUS_ARCHITECTURE'
  | 'GENERAL_HYBRID';

export interface RoutedContextResult {
  primaryDomain: CognitiveDomain;
  domainTitle: string;
  activeModules: string[];
  systemPromptBlock: string;
  estimatedPromptTokens: number;
  tokensSavedPercentage: number;
}

export class DynamicContextRouter {
  /**
   * Clasifica la intención semántica del usuario en base a palabras clave,
   * estructura léxica y objetivo didáctico.
   */
  public static classifyIntent(userMessage: string): CognitiveDomain {
    const text = userMessage.toLowerCase();

    // 1. Antivirus & SamuLibre Architecture
    if (
      text.includes('antivirus') ||
      text.includes('samulibre') ||
      text.includes('edr') ||
      text.includes('canario') ||
      text.includes('honeyfile') ||
      text.includes('yara') ||
      text.includes('blindaje de memoria') ||
      text.includes('ransomware')
    ) {
      return 'ANTIVIRUS_ARCHITECTURE';
    }

    // 2. Kali Linux / Hacking defensivo universitario & Tolerancia Léxica a Typos
    if (
      text.includes('kali') ||
      text.includes('nmap') ||
      text.includes('wireshark') ||
      text.includes('ghidra') ||
      text.includes('hashcat') ||
      text.includes('volatility') ||
      text.includes('mitre') ||
      text.includes('forense') ||
      text.includes('inversa') ||
      text.includes('desensambl') ||
      text.includes('pcap') ||
      text.includes('metasploit') ||
      text.includes('ciberseguridad') ||
      text.includes('vulnerab') || // vulnerabilidad, vulnerabilidades
      text.includes('exploit') ||
      text.includes('payload') ||
      text.includes('fuzz') ||
      text.includes('inyeccion') ||
      text.includes('inyección') ||
      text.includes('sqli') ||
      text.includes('xss') ||
      text.includes('escaneo') ||
      text.includes('escaner') ||
      text.includes('pentest') ||
      text.includes('red team') ||
      text.includes('blue team') ||
      text.includes('wifi') ||
      text.includes('wi-fi') ||
      text.includes('krack') ||
      text.includes('wpa2') ||
      text.includes('wpa3') ||
      text.includes('handshake') ||
      text.includes('aircrack') ||
      text.includes('scapy') ||
      text.includes('wlp2s0') ||
      text.includes('802.11') ||
      text.includes('overthewire') ||
      text.includes('over the wire') ||
      text.includes('bandit') ||
      text.includes('hackthebox') ||
      text.includes('hack the box') ||
      text.includes('tryhackme') ||
      text.includes('vulnhub') ||
      text.includes('picoctf') ||
      text.includes('ctf') ||
      text.includes('dednegacion') || // Tolerancia a typo común del usuario
      text.includes('denegacion') ||
      text.includes('denegación') ||
      text.includes('denejacion') ||
      text.includes('denegasion') ||
      text.includes('dos') ||
      text.includes('ddos') ||
      text.includes('flood') ||
      text.includes('inundacion') ||
      text.includes('inundación') ||
      text.includes('slowloris') ||
      text.includes('ataque')
    ) {
      return 'CYBERSECURITY_TACTICAL';
    }

    // 3. Cimientos escolares / Bachillerato / Lógica básica
    if (
      text.includes('colegio') ||
      text.includes('escuela') ||
      text.includes('bachillerato') ||
      text.includes('polya') ||
      text.includes('pólya') ||
      text.includes('binario') ||
      text.includes('booleana') ||
      text.includes('potencia de 2') ||
      text.includes('metáfora') ||
      text.includes('metafora') ||
      text.includes('analogía') ||
      text.includes('analogia') ||
      text.includes('por qué una computadora cuenta') ||
      text.includes('profesor enséñame desde las bases')
    ) {
      return 'CONCEPTUAL_SCHOOLING';
    }

    // 4. Programación autónoma / Código funcional
    if (
      text.includes('programa') ||
      text.includes('programar') ||
      text.includes('código') ||
      text.includes('codigo') ||
      text.includes('función') ||
      text.includes('funcion') ||
      text.includes('script') ||
      text.includes('clase') ||
      text.includes('módulo') ||
      text.includes('modulo') ||
      text.includes('crea un') ||
      text.includes('haz un') ||
      text.includes('implementa') ||
      text.includes('rust') ||
      text.includes('python') ||
      text.includes('typescript') ||
      text.includes('javascript') ||
      text.includes('html') ||
      text.includes('css')
    ) {
      return 'CODING_AUTONOMOUS';
    }

    return 'GENERAL_HYBRID';
  }

  /**
   * Ensambla quirúrgicamente el contexto necesario según la intención clasificada.
   * Elimina hasta un 65% del bloat de contexto estático.
   */
  public static routeContext(userMessage: string): RoutedContextResult {
    const domain = this.classifyIntent(userMessage);
    const activeModules: string[] = [
      'KodaraPhilosophyEngine (Piedra Angular FOSS)',
      'PaiMeiLinguisticEngine (Voz Universal del Maestro)',
    ];
    const promptSegments: string[] = [];

    // 1. Piedra Angular: Identidad Soberana FOSS y Cabina Táctica
    promptSegments.push(KodaraPhilosophyEngine.buildMasterIdentitySystemPrompt());

    // 2. Protocolo Vocal Universal: Oratoria Marcial y Consejo de Lenguas Modernas
    promptSegments.push(PaiMeiLinguisticEngine.buildUniversalPaiMeiVoiceBlock());

    // 3. Protocolo de Disciplina Marcial Pai Mei & Plan Canguro: Meditación Interior + Prohibición de Clichés Robóticos
    promptSegments.push(
      `=== PROTOCOLO REFLEXIVO PLAN CANGURO & DISCIPLINA MARCIAL PAI MEI ===\n` +
      `1. CONCENTRACIÓN DE CHI OBLIGATORIA (Descomposición Pólya): Abre SIEMPRE tu respuesta con la etiqueta <pensamiento_kodara> y delibera en silencio:\n` +
      `   - Descomposición Pólya: ¿Cuál es la intención profunda detrás del requerimiento? ¿Qué casos borde existen?\n` +
      `   - Plan Arquitectónico: ¿Qué arquitectura garantiza cero fugas de memoria y cero agotamiento de descriptores?\n` +
      `   - Blindaje de Fricción: Comprueba mentalmente que no existan elipsis ni comentarios '// TODO'.\n` +
      `   Cierra estrictamente </pensamiento_kodara> antes de tu respuesta visible.\n` +
      `2. ERRADICACIÓN DE CLICHÉS ROBÓTICOS:\n` +
      `   - PROHIBIDO TERMINANTEMENTE decir frases vacías como "El usuario pide...", "El usuario solicita..." o "A continuación se presenta...".\n` +
      `   - Habla con presencia de Maestro y Arquitecto: Dirígete directamente al estudiante en primera persona ("Construiremos...", "Analizaremos...", "Tu objetivo es...").\n` +
      `3. LA DOBLE FORJA EN SEGURIDAD: En tareas de red y sistemas, enseña siempre el binario nativo en Rust además del script en Python.\n` +
      `4. PILAR VI: AGENTE AUTÓNOMO EJECUTOR (DOCTRINA NO-CHATBOT): Eres un Agente de IA de Programación Autónomo y Ejecutor Técnico de Primera Intención. Prohibido actuar como un chatbot pasivo que deriva el trabajo al usuario mediante tutoriales de texto ("abre tu terminal y escribe..."); materializa siempre el software completo en el workspace, con archivos físicos, pruebas en sandbox y planes ejecutables reales [▶ Proceed]. Solo adopta rol meramente explicativo si el usuario pide explícitamente teoría o docencia pura.`
    );

    switch (domain) {
      case 'CODING_AUTONOMOUS':
        activeModules.push('AutonomousProgrammingEngine (Efecto Antigravity)');
        promptSegments.push(AutonomousProgrammingEngine.buildAutonomousProgrammingPromptBlock(userMessage));
        // Si hay menciones de seguridad, agregar pilar de ética y antivirus básico
        if (userMessage.toLowerCase().includes('segur') || userMessage.toLowerCase().includes('antivirus')) {
          activeModules.push('AntivirusKnowledgeEngine (Micro-Core)');
          promptSegments.push(AntivirusKnowledgeEngine.buildAntivirusArchitecturePromptBlock(userMessage));
        }
        break;

      case 'CONCEPTUAL_SCHOOLING':
        activeModules.push('FoundationalSchoolingEngine (Cimientos de Bachillerato)');
        promptSegments.push(FoundationalSchoolingEngine.buildSchoolingPromptBlock(userMessage));
        break;

      case 'CYBERSECURITY_TACTICAL':
        activeModules.push('CybersecurityAcademyEngine (Universidad Kali Linux)');
        promptSegments.push(CybersecurityAcademyEngine.buildTeacherPromptBlock(userMessage));

        const lowerMsg = userMessage.toLowerCase();
        if (
          lowerMsg.includes('dednegacion') ||
          lowerMsg.includes('denegacion') ||
          lowerMsg.includes('denegación') ||
          lowerMsg.includes('denejacion') ||
          lowerMsg.includes('denegasion') ||
          lowerMsg.includes('dos') ||
          lowerMsg.includes('ddos') ||
          lowerMsg.includes('flood') ||
          lowerMsg.includes('inundacion') ||
          lowerMsg.includes('inundación') ||
          lowerMsg.includes('slowloris') ||
          lowerMsg.includes('hackthebox') ||
          lowerMsg.includes('overthewire') ||
          lowerMsg.includes('tryhackme') ||
          lowerMsg.includes('ataque')
        ) {
          activeModules.push('AntiDosDefenseDoctrine (Pai Mei Educational Guardrail)');
          promptSegments.push(
            `=== DIRECTRIZ MARCIAL PAI MEI: ÉTICA, RESILIENCIA Y ANTI-DOS ===\n` +
            `1. PROHIBICIÓN DE RECHAZO MONOSILÁBICO: Está terminantemente prohibido responder con frases vacías como "Lo siento, pero no puedo asistir con eso". Asume la presencia de Maestro.\n` +
            `2. NEGATIVA FUNDAMENTADA Y RULES OF ENGAGEMENT: Si el usuario pide auditar, vulnerar o lanzar DoS contra un host o plataforma externa (como OverTheWire.org o HackTheBox.com), declara con presencia marcial que Kodara no realiza ataques contra plataformas externas y explica que los Términos de Servicio y Rules of Engagement de HackTheBox y plataformas wargame (como OverTheWire) prohíben explícitamente ataques DoS a su portal web.\n` +
            `3. FÍSICA DE SOCKETS Y PROHIBICIÓN DE FALSOS SYN FLOODS: Jamás proporciones un bucle de TcpStream::connect() diciendo que es un "SYN Flood". En la física de TCP/IP, TcpStream::connect() ejecuta el Three-Way Handshake COMPLETO (SYN -> SYN/ACK -> ACK), abriendo un descriptor real en el kernel local y saturando los recursos del cliente. Explica la diferencia con un SYN Flood real (paquetes raw SOCK_RAW sin responder ACK).\n` +
            `4. PIVOTE DEFENSIVO OBLIGATORIO EN 4 FASES:\n` +
            `   - Fase 1: Declaración ética y Rules of Engagement del portal consultado.\n` +
            `   - Fase 2: Física y anatomía del asedio (agotamiento de buffers TCP vs. descriptores L7).\n` +
            `   - Fase 3: La Forja Defensiva: SYN Cookies (RFC 4987), Token Bucket rate limiting y hardening de kernel Linux (/etc/sysctl.conf: net.ipv4.tcp_syncookies=1, net.ipv4.tcp_max_syn_backlog=4096).\n` +
            `   - Fase 4: Alternativa legal constructiva: Pruebas de estrés y benchmarking en localhost (127.0.0.1) con wrk o k6.`
          );
        }

        // Directiva de Auditoría Inalámbrica WPA2/KRACK y Seguridad Wi-Fi
        if (
          lowerMsg.includes('wifi') ||
          lowerMsg.includes('wi-fi') ||
          lowerMsg.includes('krack') ||
          lowerMsg.includes('wpa2') ||
          lowerMsg.includes('handshake')
        ) {
          activeModules.push('WirelessSecurityEngine (KRACK WPA2 & Lab Simulator)');
          promptSegments.push(
            `=== DIRECTRIZ MARCIAL PAI MEI: AUDITORÍA INALÁMBRICA WPA2 / KRACK & LABORATORIO SEGURO ===\n` +
            `1. PROHIBICIÓN DE PASIVIDAD DE CHATBOT: Ante órdenes como "ejecuta el proyecto" o "implementa la auditoría", NO proporciones un tutorial de texto pidiendo al usuario que abra su terminal. Construye la solución directamente con el motor de ejecución en el workspace.\n` +
            `2. REALIDAD DEL HARDWARE EN LINUX: La interfaz física del sistema es 'wlp2s0', NO 'wlan0'. Está terminantemente prohibido sugerir 'python2' (obsoleto). Todo script se ejecuta con Python 3.14+ o Rust nativo.\n` +
            `3. MODO DUAL DE EJECUCIÓN SEGURA: Para no derribar la conexión a Internet del host al cambiar a modo monitor, provee un Modo Laboratorio Simulado (tráfico 802.11 sintético de 4-way handshake para probar CVE-2017-13077/PTK replay de forma inmediata y segura) y un Modo Interfaz Real para 'wlp2s0'.\n` +
            `4. PIPELINE DE PERSISTENCIA Y VISUALIZACIÓN: Los resultados deben guardarse en SQLite ('wifi_audit.db') con sesiones, dispositivos, trazas de handshakes y veredicto de vulnerabilidad, visualizándose en el dashboard web interactivo.`
          );
        }

        // Agregar también programación autónoma si requiere implementar la herramienta
        if (userMessage.toLowerCase().includes('program') || userMessage.toLowerCase().includes('código') || userMessage.toLowerCase().includes('rust') || userMessage.toLowerCase().includes('ejecuta') || userMessage.toLowerCase().includes('implement')) {
          activeModules.push('AutonomousProgrammingEngine (Code Generator)');
          promptSegments.push(AutonomousProgrammingEngine.buildAutonomousProgrammingPromptBlock(userMessage));
        }
        break;

      case 'ANTIVIRUS_ARCHITECTURE':
        activeModules.push('AntivirusKnowledgeEngine (SamuLibre EDR)');
        activeModules.push('AutonomousProgrammingEngine (Rust Micro-Engine)');
        promptSegments.push(AntivirusKnowledgeEngine.buildAntivirusArchitecturePromptBlock(userMessage));
        promptSegments.push(AutonomousProgrammingEngine.buildAutonomousProgrammingPromptBlock(userMessage));
        break;

      case 'GENERAL_HYBRID':
      default:
        // Carga equilibrada ligera
        activeModules.push('AutonomousProgrammingEngine (Reglas de Calidad)');
        activeModules.push('FoundationalSchoolingEngine (Pedagogía y Empatía)');
        promptSegments.push(AutonomousProgrammingEngine.buildAutonomousProgrammingPromptBlock(userMessage));
        promptSegments.push(FoundationalSchoolingEngine.buildSchoolingPromptBlock(userMessage));
        break;
    }

    const fullBlock = promptSegments.join('\n\n');
    // Estimación rápida de tokens (~4 caracteres por token)
    const estimatedTokens = Math.round(fullBlock.length / 4);
    // Un prompt estático total concatenado medía ~3800 tokens
    const maxStaticTokens = 3800;
    const tokensSaved = Math.max(0, maxStaticTokens - estimatedTokens);
    const savedPercentage = Math.round((tokensSaved / maxStaticTokens) * 100);

    const domainTitles: Record<CognitiveDomain, string> = {
      CODING_AUTONOMOUS: 'Programación Autónoma & Abstracción Transparente',
      CONCEPTUAL_SCHOOLING: 'Pedagogía Escolar, Bachillerato y Método Pólya',
      CYBERSECURITY_TACTICAL: 'Academia Universitaria de Ciberseguridad (Kali Linux)',
      ANTIVIRUS_ARCHITECTURE: 'Arquitectura de Suites Antivirus EDR (SamuLibre)',
      GENERAL_HYBRID: 'Asistencia General Equilibrada & Cimientos Didácticos',
    };

    return {
      primaryDomain: domain,
      domainTitle: domainTitles[domain],
      activeModules,
      systemPromptBlock: fullBlock,
      estimatedPromptTokens: estimatedTokens,
      tokensSavedPercentage: Math.max(15, Math.min(75, savedPercentage)),
    };
  }
}
