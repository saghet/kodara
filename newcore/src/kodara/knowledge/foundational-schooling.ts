// ═══════════════════════════════════════════════════════════════
// KODARA FOUNDATIONAL SCHOOLING — Cimientos de Bachillerato y Pedagogía Escolar
// "Your Code. Your AI. Your Rules."
// Base de conocimiento escolar desarrollada con docentes de secundaria y
// bachillerato para afianzar los principios elementales que sustentan
// todo el conocimiento universitario de ciberseguridad:
// 1. Matemáticas Binarias y Lógica Booleana Elemental
// 2. Física de la Computación, Redes y Hardware Tangible
// 3. Pensamiento Computacional y Método George Pólya
// 4. Comprensión Lectora, Lenguaje Claro y Metáforas Cotidianas
// 5. Ciudadanía Digital, Ética y el Propósito Protector del Software
// ═══════════════════════════════════════════════════════════════

export interface SchoolingPillar {
  id: string;
  title: string;
  gradeLevel: string;
  teacherGoal: string;
  coreConcepts: string[];
  everydayMetaphor: string;
  connectionToCybersecurity: string;
  practiceQuestions: string[];
}

export const FOUNDATIONAL_SCHOOLING_PILLARS: SchoolingPillar[] = [
  {
    id: 'binary-math-logic',
    title: 'Pilar 1: Matemáticas Binarias, Potencias de 2 y Lógica Booleana',
    gradeLevel: 'Bachillerato — Álgebra, Aritmética y Razonamiento Lógico',
    teacherGoal:
      'Asegurar que el estudiante entienda con total naturalidad por qué una computadora cuenta en base 2 y cómo las compuertas lógicas elementales construyen toda la lógica digital.',
    coreConcepts: [
      'Sistema Binario (Base 2): Los dígitos 0 y 1 representan interruptores apagado/encendido.',
      'Potencias de 2: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024 (1 KB).',
      'Hexadecimal (Base 16): Forma compacta de representar 4 bits (un nibble). Del 0 al 9 y de la A a la F.',
      'Operaciones Lógicas Booleanas: AND (ambas verdaderas), OR (al menos una verdadera), NOT (inversor de estado) y XOR (verdadero solo si son distintas).',
      'Desplazamiento de bits (Bit Shift): x << 1 multiplica por 2; x >> 1 divide de forma entera entre 2.',
    ],
    everydayMetaphor:
      'Imagina una fila de 8 interruptores de bombillos en tu habitación. Si el interruptor está abajo es 0; si está arriba es 1. Combinando esos 8 interruptores puedes representar cualquier número del 0 al 255. Eso es exactamente un byte.',
    connectionToCybersecurity:
      'Las máscaras de subred IP (como /24 o 255.255.255.0) son operaciones AND a nivel de bits. El cifrado simétrico más rápido y fundamental (como el One-Time Pad o el flujo de ChaCha20) se basa en la propiedad invertible de la compuerta XOR.',
    practiceQuestions: [
      '¿Por qué 11111111 en binario equivale a 255 en decimal?',
      'Si aplicas XOR entre un mensaje y una clave, y luego vuelves a aplicar XOR con la misma clave, ¿qué obtienes y por qué?',
    ],
  },
  {
    id: 'physics-hardware',
    title: 'Pilar 2: Física Elemental de la Computación y Hardware Tangible',
    gradeLevel: 'Secundaria & Bachillerato — Física de la Electricidad y las Ondas',
    teacherGoal:
      'Hacer que la computación no se perciba como algo abstracto o mágico, sino como fenómenos físicos reales de electrones, fotones y ondas electromagnéticas.',
    coreConcepts: [
      'El Transistor como Interruptor Físico: Silicio dopado que deja o no deja pasar la corriente eléctrica según el voltaje de la compuerta.',
      'La Trilogía del Hardware: CPU (el obrero que ejecuta operaciones a la velocidad del reloj de gigahercios), RAM (el escritorio de trabajo rápido que se borra al apagar la luz) y Disco/SSD (el archivador de metal permanente).',
      'Propagación de Señales: Cable de cobre (pulsos de electrones a ~200.000 km/s), Fibra Óptica (pulsos de luz láser por reflexión total interna) y Ondas de Radio Wi-Fi (ondas invisibles que se dispersan en el espacio).',
      'El Paquete de Datos: Formado por Cabecera (dirección de origen y destino), Cuerpo (el mensaje) y Checksum (el sello de verificación).',
    ],
    everydayMetaphor:
      'Enviar un paquete por Internet es exactamente igual que enviar una carta por correo postal: La dirección IP es el nombre de la calle y el número de tu casa; el número de puerto TCP es la puerta de la habitación específica donde duerme la persona a la que le escribes; y el checksum es como lacrar el sobre con un sello para saber si alguien lo abrió en el camino.',
    connectionToCybersecurity:
      'Si comprendes que el Wi-Fi son ondas que rebotan en el aire, entiendes por qué cualquier persona con una antena puede capturar paquetes si no están cifrados. Si entiendes que la RAM es volátil, comprendes por qué los analistas forenses deben volcarla antes de apagar una máquina comprometida.',
    practiceQuestions: [
      '¿Qué diferencia física existe entre apagar una computadora y desconectar el cable de red durante un incidente?',
      '¿Por qué un cable de red de par trenzado (UTP) cruza los cables para reducir el ruido electromagnético?',
    ],
  },
  {
    id: 'polya-problem-solving',
    title: 'Pilar 3: Pensamiento Computacional y Método George Pólya',
    gradeLevel: 'Bachillerato — Metodología de Resolución de Problemas y Algoritmos',
    teacherGoal:
      'Enseñar a la mente a no apresurarse ni adivinar soluciones, sino descomponer cualquier reto complejo en cuatro etapas estructuradas y verificables.',
    coreConcepts: [
      'Etapa 1: Comprender el Problema (¿Cuáles son las entradas? ¿Cuáles son las salidas esperadas? ¿Qué restricciones existen?).',
      'Etapa 2: Trazar un Plan (¿Puedo dividir el problema en pasos más pequeños? ¿Existe un problema similar que ya haya resuelto?).',
      'Etapa 3: Ejecutar el Plan (Implementar paso a paso, comprobando que cada línea o función cumpla su cometido individual).',
      'Etapa 4: Mirar hacia Atrás (Reflexionar y Verificar: ¿La solución resiste casos extremos? ¿Se puede optimizar sin perder claridad?).',
      'Algoritmo: Secuencia finita, ordenada e inequívoca de instrucciones.',
    ],
    everydayMetaphor:
      'Imagina que estás horneando un pastel. No puedes meter la harina al horno antes de batir los huevos. El método Pólya es como leer la receta completa, alistar los ingredientes en tazones limpios, hornear a la temperatura correcta y luego probar una porción para asegurar que quedó perfecto.',
    connectionToCybersecurity:
      'Evita que un ingeniero o una IA intente aplicar un parche a ciegas. Si primero comprendes la causa raíz del error (paso 1), planificas la prueba unitaria (paso 2), aplicas el cambio mínimo necesario (paso 3) y auditas que no haya regresiones (paso 4), el software queda blindado al 100%.',
    practiceQuestions: [
      'Ante un error de compilación o fallo en un escáner, ¿cuál es el primer paso según Pólya antes de cambiar una sola línea de código?',
      '¿Cómo ayuda la descomposición a analizar un archivo malicioso de 50 megabytes?',
    ],
  },
  {
    id: 'reading-clarity-metaphors',
    title: 'Pilar 4: Comprensión Lectora, Expresión Clara y Metáforas Didácticas',
    gradeLevel: 'Bachillerato — Lengua, Comunicación Asertiva y Redacción Técnica',
    teacherGoal:
      'Desarrollar la habilidad de escuchar atentamente sin juzgar la forma en que el usuario formula su pregunta, extrayendo la intención profunda y respondiendo con calidez y orden pedagógico.',
    coreConcepts: [
      'Inferencia de Intenciones: Comprender lo que el usuario quiere decir aunque use modismos informales o lenguaje desordenado.',
      'Estructura de Tres Partes en la Explicación: Introducción intuitiva (con analogía cotidiana) -> Desarrollo técnico paso a paso -> Conclusión y verificación.',
      'Eliminación de la Jerga Inútil: Explicar conceptos difíciles con palabras sencillas sin perder precisión matemática ni de ingeniería.',
      'Empatía y Paciencia Docente: Nunca hacer sentir ignorante al alumno; celebrar la curiosidad y acompañar el proceso de descubrimiento.',
    ],
    everydayMetaphor:
      'Un buen profesor no es el que usa las palabras más raras del diccionario para parecer inteligente, sino el que logra que un niño de doce años entienda cómo funciona la gravedad o cómo viaja la luz por el espacio.',
    connectionToCybersecurity:
      'Los equipos de seguridad deben convencer a desarrolladores y directivos de corregir vulnerabilidades. Si el informe es hostil o incomprensible, nadie lo corregirá. Si la explicación es clara, empática y constructiva, el sistema se parcha de inmediato.',
    practiceQuestions: [
      '¿Cómo explicarías qué es una inyección SQL a alguien que nunca ha programado usando una analogía cotidiana?',
      '¿Por qué una respuesta empática y paciente genera mejores resultados que un mensaje frío y mecánico?',
    ],
  },
  {
    id: 'ethics-digital-citizenship',
    title: 'Pilar 5: Ciudadanía Digital, Ética y el Propósito Protector del Software',
    gradeLevel: 'Secundaria & Bachillerato — Ética, Valores y Responsabilidad Social',
    teacherGoal:
      'Forjar una brújula moral inquebrantable: el conocimiento técnico es un poder inmenso que debe usarse exclusivamente para proteger a las personas, reparar fallas y defender la libertad.',
    coreConcepts: [
      'El Hacker Ético como Médico y Guardián: Estudia los virus para crear vacunas; analiza cómo ceden las cerraduras para fabricar puertas blindadas que protejan a las familias.',
      'Principio de No Maleficencia: No causar daño deliberado ni poner en riesgo la privacidad de terceros.',
      'Responsabilidad en la Divulgación (Coordinated Disclosure): Notificar a los autores de un software sobre una vulnerabilidad de forma privada para que puedan parcharla antes de que sea pública.',
      'El Valor de la Privacidad: La información de las personas (fotos, chats, registros de salud) es sagrada y merece protección de grado militar.',
    ],
    everydayMetaphor:
      'Un cinturón de seguridad en un automóvil se prueba estrellándolo a gran velocidad en un laboratorio de pruebas controladas. El ingeniero que lo prueba no quiere destruir autos: quiere asegurarse de que cuando una familia viaje en carretera, el cinturón les salve la vida.',
    connectionToCybersecurity:
      'Es la razón de ser de suites como SamuLibre y de Kodara: herramientas defensivas 100% transparentes, sin telemetría espía ni trampas comerciales, diseñadas para devolver el control al usuario soberano.',
    practiceQuestions: [
      '¿Cuál es la diferencia moral entre un intruso que roba datos para extorsionar y un auditor de seguridad que encuentra la misma puerta abierta y enseña a cerrarla?',
      '¿Por qué el código abierto auditable es fundamental para la confianza ciudadana en la tecnología?',
    ],
  },
];

export class FoundationalSchoolingEngine {
  /**
   * Genera el bloque de cimientos escolares para que el modelo GLM-4.7
   * active el razonamiento básico, la pedagogía escolar y las metáforas cotidianas.
   */
  public static buildSchoolingPromptBlock(userQuery: string = ''): string {
    const lines: string[] = [
      `=== CIMIENTOS ESCOLARES Y PEDAGOGÍA DE BACHILLERATO KODARA ===`,
      `Rol Docente Activo: Eres también un Profesor de Secundaria y Bachillerato con enorme paciencia, calidez y amor por la enseñanza.`,
      `Objetivo: Asegurar que cada respuesta técnica esté cimentada sobre principios matemáticos elementales, lógica booleana clara, física tangible y el método George Pólya.`,
      ``,
      `DIRECTIVAS DIDÁCTICAS ESCOLARES:`,
      `1. METÁFORAS COTIDIANAS PRIMERO: Antes de lanzar comandos o términos técnicos, aterriza el concepto con una analogía de la vida real (puertas, cartas, interruptores, agua o recetas de cocina).`,
      `2. MÉTODO DE RESOLUCIÓN PÓLYA: Divide siempre la explicación en cuatro pasos: Comprender -> Planificar -> Construir -> Verificar.`,
      `3. MATEMÁTICAS CLARAS: Si hablas de bits, puertos o máscaras, explica de dónde sale el número (ej. por qué 2^8 = 256 o cómo opera un XOR).`,
      `4. TONO CÁLIDO Y MOTIVADOR: Trata al usuario como a un alumno brillante al que quieres ver triunfar y superar a sus propios maestros.`,
      ``,
      `ANALOGÍAS ESCOLARES DISPONIBLES:`,
    ];

    for (const p of FOUNDATIONAL_SCHOOLING_PILLARS) {
      lines.push(`• [${p.title}]`);
      lines.push(`  - Metáfora: ${p.everydayMetaphor}`);
      lines.push(`  - Vínculo con Ciberseguridad: ${p.connectionToCybersecurity}`);
    }

    return lines.join('\n');
  }

  public static getAllPillars(): SchoolingPillar[] {
    return FOUNDATIONAL_SCHOOLING_PILLARS;
  }
}
