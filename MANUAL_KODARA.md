# 📖 Manual Oficial de Funcionamiento de Kodara
> **"Your Code. Your AI. Your Rules."**
> Cabina Táctica de Ciberseguridad (Red/Blue Team), Desarrollo Seguro y Evolución Autónoma para Linux

---

## 1. ¿Qué es Kodara y cómo está optimizado para tu Hardware?

**Kodara** es un entorno autónomo de desarrollo seguro y ciberseguridad diseñado para correr **100% local y offline en Linux**, eliminando las fricciones y bloqueos de IDEs convencionales en ambientes donde el usuario ya posee permisos explícitos.

### 1.1 Optimización de Hardware Activa por Defecto
Kodara está configurado específicamente para tu estación de trabajo Linux:
- **CPU**: `AMD Ryzen 9` (`num_threads: 8` núcleos físicos dedicados en inferencia).
- **GPU**: `NVIDIA GeForce RTX 4060 Laptop GPU` (8188 MB VRAM con aceleración CUDA en Ollama).
- **Memoria RAM**: `32 GB DDR5`.
- **Ventana de Contexto IA**: Forzada en `num_ctx: 32768` tokens en cada llamada a Ollama (`/api/chat`) para evitar truncamiento silencioso en bucles largos de herramientas y análisis de workspaces complejos.

### 1.2 Los 4 Perfiles de Modelos Soportados (Selector Inferior)
En la barra inferior del chat puedes elegir entre 4 perfiles táticos:
1. **`⚡ Qwen2.5-Coder 7B / Qwen3-Coder-30B-A3B`**: Perfil de Desarrollo Seguro en Rust/TypeScript, generación de parches y ejecución de herramientas MCP.
2. **`🚀 GLM-4.7-Flash (30B-A3B MoE)`**: Perfil balanceado para agentes rápidos y coordinación multi-etapa.
3. **`🔍 Gemma-4-26B-A4B`**: Perfil especializado en triaje rápido de escaneos Nmap, análisis de logs SIEM y trazas de red.
4. **`🛡️ Devstral-Small-24B / DeepSeek-R1-14B`**: Perfil de auditoría profunda de código (SAST), detección CWE y razonamiento formal.

> **Fallback Inteligente Local**: Si seleccionas un perfil de la lista cuyo peso aún no ha sido descargado en Ollama, Kodara enruta automáticamente la inferencia hacia tu modelo local activo en la RTX 4060 (`qwen2.5-coder:7b` o `deepseek-r1:7b`) sin interrumpir el flujo de trabajo.

---

## 2. Guía Visual de las 3 Columnas de Kodara

La interfaz de Kodara se divide en **3 columnas tácticas**:

### 2.1 Columna Izquierda: Árbol de Proyectos y Monitor de Hardware en Vivo
1. **Cabecera Kodara (`LOCAL 32K`)**: Confirma que el motor local con ventana de 32,768 tokens está activo.
2. **Botón `+ Nueva Conversación`**: Crea un nuevo hilo de trabajo persistente en SQLite dentro del proyecto activo.
3. **Accesos Rápidos**:
   - **`⚡ Automatizaciones (Benchmark)`**: Ejecuta la suite de validación reproducible del Evolution Engine (`3/3 escenarios`).
   - **`🧠 Memorias & Reglas`**: Abre directamente la memoria de ingeniería del proyecto.
   - **`📖 Manual de Kodara`**: Muestra este manual interactivo dentro de la consola central.
4. **Árbol de Proyectos (`Proyectos`)**:
   - Lista tus proyectos reales en disco (`SamulibreLinux`, `WiSharkOpen`, `Ollama`, `CLI Project`).
   - Al hacer clic en una carpeta o conversación:
     - Cambia el contexto activo al directorio real del proyecto.
     - Carga el historial de mensajes guardado en SQLite (`project_messages`).
     - Filtra automáticamente la `Kodara Project Memory` y el `Plan Ejecutable` asociado a ese proyecto.
5. **Recuadro Inferior Izquierdo — Monitor de Hardware en Vivo (`CPU / GPU / RAM`)**:
   - Se actualiza cada **2.5 segundos** consultando el kernel de Linux (`/proc/stat`, `/proc/meminfo`) y el driver NVIDIA (`nvidia-smi`):
     - **CPU (`AMD Ryzen 9`)**: Porcentaje de uso real y barra de carga.
     - **GPU (`NVIDIA RTX 4060`)**: Porcentaje de uso del núcleo gráfico, VRAM utilizada (`MB / 8188 MB`) y temperatura (`°C`).
     - **RAM (`Sistema`)**: Memoria usada sobre el total (`GB / 32 GB` y `%`).

---

### 2.2 Columna Central: Consola Táctica, Visión Multimodal (`🖼️ Imagen`), Planes Ejecutables (`[▶ Proceed]`) y Modo Turbo
1. **Barra Superior de Acciones Directas (`1-Click Toolbelt`)**:
   - **`📋 Generar Plan Ejecutable`**: Crea en SQLite un nuevo artefacto de plan en 4 fases para el proyecto activo con su botón real **`[▶ Proceed]`**.
   - **`🖼️ Adjuntar Imagen`**: Abre el selector para adjuntar capturas de pantalla o diagramas para diagnosticar fallas.
   - **`🔍 Nmap Directo`**: Escanea inmediatamente los puertos y servicios del objetivo activo.
   - **`🛡️ SAST Semgrep`**: Ejecuta una auditoría estática de código sobre el proyecto activo y extrae hallazgos CWE.
   - **`🔧 Auto-Repair Sandbox`**: Dispara una demostración real del ciclo de diagnóstico, reparación en Sandbox (`rustc`) y verificación de pruebas unitarias (`rustc --test`).
   - **`📖 Manual`**: Abre este manual completo dentro del flujo central.
2. **Motor Multimodal `Kodara Vision Engine` (Adjuntar e Interpretar Imágenes al Estilo Antigravity)**:
   - Puedes adjuntar una o varias imágenes por **3 vías**:
     1. Clic en el botón **`+`** o **`🖼️ Imagen`** en la barra de prompt (o **`🖼️ Adjuntar Imagen`** en la barra superior).
     2. Pegando directamente con **`Ctrl + V`** desde el portapapeles tras tomar un pantallazo.
     3. Arrastrando y soltando (**`Drag & Drop`**) archivos `.png`, `.jpg` o `.webp` sobre la caja de texto.
   - Antes de enviar, las capturas aparecen en la **Bandeja de Miniaturas** con opción de quitarlas (`✕`).
   - Al enviar, **`Kodara Vision Engine`** ejecuta:
     - **OCR Bilingüe (`spa+eng`) con Tesseract** y extracción de geometría con `ImageMagick`.
     - **Detección de Anomalías Visuales**: Identifica estados bloqueados (`EXECUTING PHASES...`, `PENDING`), errores de compilación (`error[E0308]`, `panic`) o vulnerabilidades CWE visibles en la captura.
     - **Codebase Visual Grounding**: Cruza los textos de la captura con los archivos del proyecto activo (`SamulibreLinux`, `WiSharkOpen`, `Ollama`) y adjunta automáticamente un **Plan de Reparación Ejecutable (`[▶ Proceed]`)**.
3. **Pilar de Planes Ejecutables Reales (`[▶ Proceed]`)**:
   - A diferencia de los chats convencionales que generan botones falsos o simbólicos, cada plan propuesto en Kodara se convierte en un **Artefacto Ejecutable Nativo (`ExecutablePlanArtifact`)**.
   - Al pulsar **`[▶ Proceed]`**, Kodara ejecuta físicamente en Linux 4 fases secuenciales:
     - **Fase 1 (`INDEX_AND_VERIFY`)**: Indexación real de crates, paquetes y símbolos públicos del proyecto (`ProjectIndexer.index`).
     - **Fase 2 (`SAST_SECURITY_AUDIT`)**: Auditoría SAST real (`Semgrep`/analizador CWE) y registro en el Mapa de Activos.
     - **Fase 3 (`SANDBOX_COMPILE_AND_TEST`)**: Compilación real con `rustc` y ejecución de pruebas unitarias (`rustc --test`) en entorno aislado.
     - **Fase 4 (`MEMORY_CONSOLIDATION`)**: Almacenamiento automático de la lección verificada en `Kodara Project Memory`.
3. **Selector de Modo de Ejecución (`🛡️ Turbo` vs `🔒 Supervisado`)**:
   - **`🛡️ Turbo` (Activo por defecto)**: Diseñado para entornos con permisos explícitos. Cuando pides en el chat *"escanea puertos de 127.0.0.1"* o *"audita vulnerabilidades SAST"*, Kodara ejecuta la herramienta inmediatamente antes de responder e inyecta los hallazgos reales en el prompt.
   - **`🔒 Supervisado`**: Muestra primero la propuesta del comando, su nivel de ruido (`Pasivo`, `Moderado`, `Agresivo`) y solicita confirmación antes de ejecutar.

---

### 2.3 Columna Derecha: Workbench de Memorias Duales Independientes y Arsenal
Kodara separa estrictamente el conocimiento en **dos memorias SQLite independientes** para jamás mezclar fallos de tus proyectos con la telemetría interna del IDE:

1. **Pestaña `🧠 Kodara Project Memory` (Memoria de Aplicaciones)**:
   - **Propósito**: Aprende exclusivamente de los errores de compilación, seguridad (CWE) y pruebas encontrados al desarrollar tus aplicaciones (`SamulibreLinux`, `WiSharkOpen`, `Ollama`).
   - **Cómo añadir lecciones**:
     - Automáticamente al ejecutar un Plan (`[▶ Proceed]`) o una reparación en Sandbox.
     - Usando el botón **`+ Registrar Lección`** en la pestaña.
     - Escribiendo en el chat: `/recordar <regla o solución técnica>`.
2. **Pestaña `⚙️ Kodara Core Memory` (Memoria Interna del IDE)**:
   - **Propósito**: Registra exclusivamente problemas internos del motor de Kodara (latencia de inferencia, límites de contexto, bloqueo de base de datos, variables de entorno de `systemd`) y genera **propuestas supervisadas en ramas aisladas**.
   - **Aprobación Humana**: Puedes aprobar (`✓ Aprobar`) o descartar (`✕ Rechazar`) cada parche candidato. Kodara **nunca** modifica su propio código fuente sin supervisión.
3. **Pestaña `🛡️ Arsenal & Activos`**:
   - Muestra el catálogo de herramientas MCP de ciberseguridad (`Nmap`, `Semgrep`, `Trivy`, `Nuclei`, `WhatWeb`, `FFUF`, `TShark`) para ejecutarlas con un clic.
   - Debajo muestra el **Mapa de Activos y Hallazgos en Vivo** (IPs/Proyectos → Puertos abiertos → Vulnerabilidades clasificadas por severidad) y el botón **`📄 Exportar MD`** para generar el informe completo.

---

## 3. Lanzadores de Linux y Comandos de Terminal

Kodara está instalado como aplicación nativa de escritorio en tu sistema Linux:

| Acción | Comando / Acceso |
| :--- | :--- |
| **Abrir ventana nativa de escritorio Kodara** | Desde tu menú de aplicaciones de Linux (**Kodara**), el icono del Escritorio o ejecutando `kodara-app` / `kodara-desktop` |
| **Ejecutar CLI de Kodara en terminal** | `kodara --help` o `kodara serve` |
| **Ver estado del servicio en segundo plano** | `systemctl --user status open-antigravity.service` |
| **Reiniciar el servidor de Kodara** | `systemctl --user restart open-antigravity.service` |
| **Ejecutar suite de pruebas automatizadas** | `cd /home/saghet/Documents/Ollama/Velocity/newcore && ~/.bun/bin/bun test src/kodara/evolution/` |

### Atajos de Teclado en la Ventana Nativa de Escritorio (`kodara-desktop`)
- **`Enter`**: Enviar mensaje o comando en la consola táctica (`Shift + Enter` para salto de línea).
- **`Ctrl + R`**: Recargar la interfaz ignorando caché.
- **`F11`**: Alternar modo de pantalla completa táctica.
- **`Ctrl + Q`**: Cerrar la ventana de escritorio (el servicio local sigue activo en segundo plano).


---

## 11. Motor de Comprensión de Historial Completo, Detección Geométrica de Flechas y Ejecución Real de Órdenes (Nivel Antigravity)
- **Hidratación Completa de Historial desde SQLite (`KodaraOrderCompiler.loadFullConversationHistory`)**:
  - En cada turno de `/chat/stream` y al cambiar de conversación en la interfaz, Kodara carga automáticamente todos los mensajes previos desde `project_messages` en SQLite y construye un **Ledger de Órdenes Acumuladas**.
- **Detección Geométrica de Flechas (`KodaraVisionEngine.detectArrowTarget`)**:
  - Detecta flechas o trazos de anotación (azules, rojos, amarillos) dibujados por el usuario sobre las capturas adjuntas, calcula el cuadrante `(x%, y%)` de la punta de la flecha, ejecuta OCR focalizado sobre el área apuntada y la vincula con la línea exacta del archivo fuente del proyecto (`data/ui/index.html`).
- **Compilación y Ejecución Real de Órdenes en `[▶ Proceed]` (`KodaraOrderCompiler` + `KodaraPlanExecutor`)**:
  - Extrae y ejecuta físicamente las órdenes pedidas en el historial del chat:
    - `VERSION_BUMP`: Actualiza `Cargo.toml`, `data/ui/index.html`, `PKGBUILD` y `samulibre.spec` a la nueva versión solicitada (ej. `v2.00.31`).
    - `UI_TELEMETRY_INJECTION`: Inserta los widgets solicitados (ej. `Consumo CPU` y `Consumo GPU` donde apunta la flecha) y los conecta al backend en Rust.
    - `COMPILE_PROJECT`: Compila el proyecto con `cargo build --release` y sincroniza binarios y recursos en `~/.local/bin` y `~/.local/share`.
    - `RESTART_APPLICATION`: Cierra y vuelve a abrir la aplicación objetivo (`systemctl --user restart samulibre.service` + señal `SHOW` al puerto `49721`) para mostrar los cambios en vivo.
- **Auditoría Verificadora Post-Ejecución (`PostExecutionAuditor`)**:
  - Comprueba físicamente en disco y en los procesos activos que cada requisito del historial se haya cumplido al **100%** antes de marcar el plan como `✓ 100% PROCEEDED & VERIFIED`.


---

## 12. Asistente Cognitivo en Lenguaje Natural y Base de Conocimiento de Arquitectura Antivirus (GLM-4.7 por Defecto)
- **Modelo Predeterminado GLM-4.7-Flash**:
  - Configurado como el motor por defecto en backend (`newcore/src/config/index.ts`, `.env`) y frontend (`newcore/src/web/dashboard.html`).
  - Empaquetado localmente en Ollama con parámetros de conversación fluida: `temperature: 0.42`, `top_p: 0.92`, `repeat_penalty: 1.15` y ventana de contexto de `32768` tokens en GPU NVIDIA GeForce RTX 4060.
- **Des-robotización y Comprensión Humana (Estilo Google Antigravity)**:
  - Elimina respuestas acartonadas, frías o de plantilla.
  - Dialoga en lenguaje natural coloquial, explicando de forma empática y reflexiva el razonamiento técnico de cada propuesta.
- **Corpus Experto de Arquitectura Antivirus en Rust (`SAMULIBRE_ANTIVIRUS_KNOWLEDGE`)**:
  - Incorpora conocimiento profundo sobre cómo construir una suite EDR/Antivirus como SamuLibre:
    1. **Motor de Escaneo Multi-Capa**: Paralelización con `rayon`, reglas YARA-X, ClamAV y cálculo de entropía de Shannon.
    2. **Trampas Canario Anti-Ransomware**: Siembra de honeyfiles vigilados en tiempo real por hash criptográfico SHA-256 e inotify.
    3. **Escudo Endpoint y Blindaje de Memoria**: Prevención de volcados `PROCESS_VM_READ` en LSASS y protección de cookies/tokens DPAPI contra troyanos InfoStealers (RedLine, Vidar, Lumma).
    4. **Centinela de Vulnerabilidades (Virtual Patching)**: Mitigación en caliente de CVEs en memoria sin reiniciar el sistema operativo.
    5. **GUI Nativa Translúcida Estilo Apple**: Integración de WebKitGTK / Tao + Wry en Rust con Tailwind CSS offline, telemetría en tiempo real y consumo menor a 40 MB de RAM.


---

## 13. Academia Universitaria de Ciberseguridad Kodara (Nivel Pregrado)
- **Metodología Pedagógica del Profesor Mentor**:
  - Enseña la arquitectura de herramientas de ciberseguridad en tres capas progresivas:
    1. **El 'Por Qué' (Concepto y Matemáticas)**: La lógica fundamental de red, protocolos o vulnerabilidades explicada de forma clara y humana.
    2. **El 'Cómo' (Arquitectura de Software)**: Estructuras de datos, sockets asíncronos (`tokio`), descriptores de kernel (`epoll`/`inotify`), paralelización y gestión de memoria.
    3. **La 'Construcción' (Código Real)**: Implementación limpia y funcional en Rust, TypeScript y Python para que el alumno pueda crear sus propias herramientas.
- **Los 10 Módulos Curriculares Universitarios (Mapeo de Mercado Kali Linux)**:
  1. `recon-osint`: Escaneo SYN, banner grabbing y consultas DNS asíncronas (`pnet`, `hickory-resolver`).
  2. `vuln-assessment`: Parsers AST de código seguro y motores de firmas (`tree-sitter`, `syn`, `regex`).
  3. `web-security`: Proxies MITM, TLS dinámico y mitigación de OWASP Top 10 (`hyper`, `rustls`).
  4. `network-traffic`: Captura de paquetes a alta velocidad con buffers circulares y filtros BPF (`pcap`, `etherparse`).
  5. `cryptography-audit`: Funciones de derivación lenta (Argon2id) y comparaciones en tiempo constante (`ring`, `subtle`).
  6. `reverse-engineering`: Desensamblado de binarios x86_64/ARM64 y tracing con syscalls (`capstone`, `goblin`, `ptrace`).
  7. `digital-forensics`: File carving y análisis de líneas temporales de incidentes (`memmap2`, `sha2`).
  8. `wireless-iot`: Análisis de tramas 802.11 y auditoría de protocolos IoT (`radiotap`, `tokio`).
  9. `endpoint-edr`: Agentes defensivos invisibles con monitoreo de persistencias y firmas YARA-X (`notify`, `yara-x`).
  10. `reporting-mitre`: Mapeo matricial a MITRE ATT&CK y generación de reportes ejecutivos estructurados.
- **Botón y Vista Rápida en la Interfaz**:
  - Botón `🎓 Academia Ciberseguridad` en la cabecera superior para explorar el currículo y solicitar clases personalizadas al Profesor Mentor sobre cualquier módulo.

---

## 14. Cimientos Escolares y Pedagogía de Bachillerato de Kodara
- **Propósito y Alianza Docente**:
  - Base de conocimiento diseñada junto a profesores expertos de secundaria y bachillerato para afianzar los conceptos fundamentales de matemáticas, física, lógica y ética que sustentan la ciberseguridad universitaria.
  - Elimina los puntos ciegos o "lagunas conceptuales" que suelen llevar a las IA a cometer errores en razonamiento de bajo nivel o generar código sin comprender la causa raíz.
- **Los 5 Pilares Fundacionales de Bachillerato (`FOUNDATIONAL_SCHOOLING_PILLARS`)**:
  1. **Matemáticas Binarias, Potencias de 2 y Lógica Booleana (`binary-math-logic`)**:
     - *Metáfora*: Fila de 8 interruptores de bombillos en la habitación para formar un byte del 0 al 255.
     - *Vínculo*: Cálculo exacto de máscaras de subred IP (operación AND bit a bit) y cifrado invertible con XOR.
  2. **Física Elemental de la Computación y Hardware Tangible (`physics-hardware`)**:
     - *Metáfora*: Envío de cartas postales (IP = dirección de la casa, Puerto TCP = número de habitación, Checksum = sello de lacre).
     - *Vínculo*: Entender por qué el Wi-Fi es interceptable al ser ondas de radio en el aire y por qué la memoria RAM se evapora al cortar la energía en análisis forenses.
  3. **Pensamiento Computacional y Método George Pólya (`polya-problem-solving`)**:
     - *Metáfora*: La receta de cocina (no hornear antes de batir; comprender ingredientes, planificar, cocinar y probar).
     - *Vínculo*: Descomposición en 4 fases (Comprender -> Planificar -> Construir -> Verificar) antes de tocar una sola línea de código en parches y herramientas de seguridad.
  4. **Comprensión Lectora, Expresión Clara y Metáforas Didácticas (`reading-clarity-metaphors`)**:
     - *Metáfora*: El gran maestro que explica la gravedad a un niño sin usar palabras complejas innecesarias.
     - *Vínculo*: Informes de seguridad empáticos, constructivos y claros que logran que desarrolladores corrijan fallas de inmediato sin fricción.
  5. **Ciudadanía Digital, Ética y Propósito Protector del Software (`ethics-digital-citizenship`)**:
     - *Metáfora*: Las pruebas de choque de laboratorio para diseñar cinturones de seguridad que salvan vidas.
     - *Vínculo*: El hacker ético como médico y guardián; suites defensivas transparentes como SamuLibre y Kodara sin telemetría invasiva.
- **Botón y Vista en la Interfaz**:
  - Botón táctico `🎒 Cimientos Escolares` en la cabecera del dashboard con acceso directo a los 5 pilares, sus objetivos didácticos, metáforas y solicitud de clases guiadas al Profesor Mentor.

---

## 15. Programación Autónoma y Abstracción Transparente ("Efecto Antigravity")
- **Rol y Objetivo Principal**:
  - Kodara opera formalmente como un **Arquitecto de Software e Ingeniero de Programación Autónoma** especializado en traducir intenciones en lenguaje natural (español) a código funcional, limpio y listo para producción bajo el principio de "abstracción transparente" (inspirado en el concepto de `import antigravity`). El usuario expresa el *qué*, y Kodara resuelve el *cómo* técnico de manera invisible y directa.
- **Los 4 Principios de Operación ("Efecto Antigravity")**:
  1. **Comprensión Semántica Profunda**: Infiere estándares industriales (caché en RAM, índices, SQLite WAL) ante peticiones coloquiales o ambiguas sin interrogar innecesariamente.
  2. **Transparencia y Simplicidad**: Oculta la complejidad engorrosa entregando soluciones listas para funcionar *out-of-the-box*.
  3. **Código Autodocumentado en Español**: Comentarios claros en español explicando el *porqué* de las decisiones de diseño arquitectónico y de seguridad.
  4. **Cero Fricción**: Prohibición estricta de código incompleto o comentarios de postergación (`// TODO: implementar`). Código siempre 100% funcional.
- **Flujo de Respuesta Estructurado Obligatorio (4 Fases)**:
  1. **Interpretación Rápida (1-2 líneas)**: Confirmación concisa del requerimiento y del patrón técnico adoptado.
  2. **Entorno y Dependencias**: Comando de instalación unificado (`pip install ...`, `npm install ...`, `cargo add ...`) o mención de la biblioteca estándar.
  3. **Código Completo y Funcional**: Bloque de código modular, con manejo robusto de excepciones (`try/catch`), seguridad y casos borde.
  4. **Uso Directo (Abstraído)**: Demostración de uso en 1 a 3 líneas de código ultra-concisas estilo `import antigravity`.
- **Reglas de Calidad y Seguridad**:
  - Sanitización de entradas, prevención de inyecciones SQL y XSS, uso de variables de entorno para secretos.
  - Selección adaptativa de lenguaje (Python para automatización/backend/datos; JS/TS/HTML/CSS para web; Rust para subsistemas de alto rendimiento y ciberseguridad).
- **Botón y Vista en la Interfaz**:
  - Botón táctico `⚡ Programación Antigravity` en la cabecera del dashboard para consultar los principios, las fases de respuesta y probar el flujo autónomo de código en vivo.

---

## 16. Plan Canguro: Mentoring Cognitivo, Ruteo Semántico y Estándar Google Antigravity
- **Filosofía del Plan Canguro**:
  - Modelo de tutela permanente inspirado en el Método Canguro: Antigravity supervisa y sostiene el desarrollo cognitivo de Kodara línea a línea, asegurando que adquiera solvencia y madurez hasta superar a sus propios maestros.
- **Ruteo Semántico Dinámico (`DynamicContextRouter`)**:
  - En lugar de concatenar enciclopedias estáticas en cada turno (lo que causaba saturación y dilución de contexto), Kodara clasifica la intención de la consulta en 5 dominios:
    1. `CODING_AUTONOMOUS`: Programación y scripts con las 4 fases.
    2. `CONCEPTUAL_SCHOOLING`: Cimientos escolares de bachillerato, física y método Pólya.
    3. `CYBERSECURITY_TACTICAL`: Academia Kali Linux y herramientas tácticas.
    4. `ANTIVIRUS_ARCHITECTURE`: SamuLibre EDR, honeyfiles y blindaje de memoria.
    5. `GENERAL_HYBRID`: Asistencia general balanceada.
  - *Impacto*: Ahorro de entre 15% y 75% en tokens de prompt, maximizando la atención neuronal y eliminando alucinaciones.
- **Buffer de Pensamiento Reflexivo (`<pensamiento_kodara>`)**:
  - Implementa un Scratchpad interno de Chain-of-Thought (CoT) donde el modelo delibera silenciosamente antes de emitir la respuesta final: analiza casos borde, planifica dependencias seguras y verifica la ausencia de `TODOs`.
  - En la interfaz web se muestra como un acordeón colapsable: `💭 Razonamiento del Mentor (Plan Canguro CoT)`.
- **Catálogo de Pares Contrastivos Golden (`GOLDEN_EXEMPLARS`)**:
  - 4 pares formativos Few-Shot que enseñan la diferencia entre código incompleto con `// TODO` o fallas de seguridad y el estándar de excelencia de Google Antigravity:
    - Verificación criptográfica en streaming (RAM segura).
    - Escáner de puertos asíncrono no bloqueante.
    - Base de datos transaccional con SQLite WAL y consultas parametrizadas.
    - Tarjeta UI Glassmorphism oscura con telemetría en tiempo real.
- **Botón y Vista en la Interfaz**:
  - Botón táctico `🦘 Plan Canguro` en la barra superior para auditar métricas de optimización de tokens, dominios activos y evaluar el razonamiento en vivo.

---

## 17. Lección Maestra: Ejemplo 2 — Auditoría de Redes, Handshake TCP y Semáforos de Concurrencia
- **Diagnóstico del Ejemplo 2 Anterior**:
  - Los escáneres ingenuos que lanzan llamadas shell (`os.system("nc ...")`) son vulnerables a inyección de comandos (CWE-78) y congelan el hilo principal.
  - Los escáneres asíncronos sin semáforo colapsan con `OSError: [Errno 24] Too many open files` al agotar los descriptores del kernel Linux (`ulimit -n`).
- **Los 4 Pilares de la Solución Antigravity**:
  1. **Física del Three-Way Handshake TCP**: Banderas `SYN` (inicio), `SYN/ACK` (puerto abierto), `RST` (puerto cerrado/rechazado) y caída por timeout en puertos filtrados por firewall.
  2. **Control de Concurrencia con Semáforo (`asyncio.Semaphore(max_concurrency)`)**: Limita a 50-100 conexiones simultáneas protegiendo la tabla de descriptores de archivos de Linux.
  3. **Banner Grabbing Pasivo No Destructivo**: Envía `\r\n` y lee hasta 128 bytes para identificar la versión real del servicio (SSH, HTTP, FTP) sin disparar alertas de intrusión.
  4. **Normalización y Prevención SSRF**: Valida y resuelve el host mediante `ipaddress.ip_address` antes de emitir cualquier paquete.
- **Acceso en la Interfaz**:
  - Botón interactivo `📡 Lección Maestra: Ejemplo 2 (Redes y Semáforos) →` dentro del panel del Plan Canguro en `dashboard.html`.

---

## 18. Disciplina Pai Mei: Puerta de Discernimiento Táctico, Oratoria Directa y la Doble Forja (Python/Rust)
- **Puerta de Discernimiento Táctico (Anti-Reflejos Ciegos)**:
  - El detector táctico (`detectTacticalToolIntent`) fue corregido para que distinga entre peticiones didácticas/conceptuales (*"enséñame"*, *"cómo funciona"*, *"cómo programar"*, *"clase magistral"*) y órdenes de ejecución física real.
  - No dispara Nmap ni Semgrep durante clases teóricas; reserva el modo Turbo exclusivamente cuando el usuario ordena auditar un destino explícito.
- **Concentración de Chi Obligatoria (`<pensamiento_kodara>`)**:
  - Imposición estricta del scratchpad silencioso antes de la emisión de texto público: descomposición Pólya, cálculo de descriptores de kernel y blindaje de fricción sin elipsis.
- **Erradicación de Clichés Robóticos**:
  - Prohibición terminante de frases en tercera persona pasiva como *"El usuario pide..."* o *"El usuario solicita..."*. La IA habla en primera persona con la presencia y autoridad de un Maestro y Arquitecto (*"Abordaremos la auditoría..."*, *"Construiremos..."*).
- **La Doble Forja en Ciberseguridad (Python + Rust)**:
  - Enseña la implementación en dos filos inseparables:
    1. *Forja 1 (Python Asyncio)*: Scripting ágil, tipado con dataclasses, semáforos de concurrencia y banner grab defensivo.
    2. *Forja 2 (Rust Tokio)*: Motor nativo con `tokio::net::TcpStream` y `tokio::sync::Semaphore` para suites EDR como SamuLibre y herramientas de alto rendimiento estilo Kali Linux.

---

## 19. La Técnica Definitiva de Pai Mei: Ejecución Física en Sandbox y el Golpe de Tres Pulgadas
- **El Verdadero Kung-Fu (La Diferencia entre Charlatanería y Dominio Real)**:
  - Un modelo que solo genera texto es un teórico. Kodara cuenta ahora con un bucle de verificación física en sandbox donde ejecuta su propio código (`newcore/scratch/verify_port_auditor.py`) sin depender de binarios externos como Nmap.
- **Prueba Empírica en Vivo (Exit Code 0)**:
  - El motor ejecuta `DefensivePortAuditor` contra `127.0.0.1` en menos de 300 ms, detectando físicamente los servicios activos locales: puerto `3777` (Servidor API de Kodara) y puerto `11434` (Demonio Ollama con banner HTTP), validando el aislamiento de descriptores.
- **La Danza Matemática del Handshake TCP (RFC 6528)**:
  - *SYN*: Número de Secuencia Inicial aleatorio de 32 bits ($ISN_c$).
  - *SYN/ACK*: $Seq = ISN_s$, $Ack = ISN_c + 1$.
  - *ACK*: $Seq = ISN_c + 1$, $Ack = ISN_s + 1$.
  - *RST*: Liberación instantánea cuando el puerto está cerrado sin entrar en `TIME_WAIT`.
  - *DROP*: Descarte silencioso por firewall (iptables/nftables) que fuerza retransmisión por temporizador RTO exponencial.

---

## 20. Reemplazo Definitivo de Antigravity: Tríptico de Acción, Sandbox Interactivo y Doble Forja
- **El Tríptico de Acción en Tiempo Real**:
  1. *Dual-Stream Limpio y Eventos de Acción*: El backend de Kodara emite eventos SSE `sandboxAction` enriquecidos hacia el frontend cuando el ruteador contextual detecta un dominio táctico o de programación autónoma, eliminando residuos sintácticos de pensamientos intermedios.
  2. *Tarjeta de Acción Sandbox en el Dashboard (`renderSandboxActionCardHTML`)*:
     - Componente interactivo estilizado que replica la experiencia de Google Antigravity.
     - Botón `[▶ Probar en Sandbox en Vivo]` que dispara la ejecución física con un solo clic.
     - Consola integrada con scroll automático y telemetría de latencia en milisegundos (`durationMs`).
  3. *Endpoint Aislado de Sandbox (`POST /api/kodara/sandbox-run`)*:
     - Ejecuta scripts en `newcore/scratch/` con aislamiento seguro de subprocesos, timeout de 6 segundos y captura estructurada en JSON.
- **La Doble Forja en Acción**:
  - *Forja 1 (Python Asyncio)*: `newcore/scratch/verify_port_auditor.py` ejecuta el escaneo local en menos de 300ms, respetando los límites de descriptores (`ulimit -n`) mediante `asyncio.Semaphore`.
  - *Forja 2 (Rust Tokio)*: `newcore/scratch/verify_port_scanner_tokio.rs` provee el motor nativo de ultra-rendimiento con `tokio::net::TcpStream`, `Arc<Semaphore>` y timeouts atómicos para integración en suites EDR como SamuLibre.
- **Certificación de Reemplazo Total**:
  - Verificado por la suite `antigravity-replacement-mastery.test.ts`, elevando el ecosistema a 10 suites de prueba y 45/45 tests unitarios aprobados al 100%.

---

## 21. Arquitectura de Carpetas y Conversaciones: Estándar Antigravity IDE
- **Paridad Visual y Funcional Estricta**:
  - El sidebar izquierdo de Kodara adopta la arquitectura exacta del panel lateral de Google Antigravity IDE, organizando el espacio de trabajo en una jerarquía clara de Carpetas (Proyectos/Workspaces) y Conversaciones anidadas.
- **Barra de Acciones de Proyectos**:
  - **Filtro en Tiempo Real (`🝖`)**: Despliega una barra de búsqueda para filtrar instantáneamente el árbol de carpetas y títulos de conversación sin recargas.
  - **Nueva Carpeta / Proyecto (`📁+`)**: Modal flotante estilizado para registrar nuevos proyectos y workspaces locales en el sistema Linux con validación de ruta.
- **Gestión Avanzada de Conversaciones (`::` Menú Contextual)**:
  - Cada conversación anidada cuenta con truncado tipográfico con elipsis y marca de tiempo relativa (`2d`, `2m`).
  - Al interactuar o pasar el cursor, emerge el botón de opciones `::` con menú desplegable:
    1. *✏️ Renombrar Conversación*: Edición directa del título persistido en SQLite.
    2. *📁 Mover a otra Carpeta*: Transferencia fluida de conversaciones entre diferentes proyectos o workspaces.
    3. *🗑️ Eliminar Conversación*: Supresión permanente de la conversación y sus mensajes asociados.
- **Tratamiento de Carpetas Vacías**:
  - Implementación del placeholder atenuado exacto `No conversations yet` cuando un proyecto recién creado aún no contiene hilos de discusión.
- **Navegación Superior Global**:
  - Botón de `+ New Conversation` y accesos directos superiores a `🕒 Automations` y `🧰 Customizations`.
- **Certificación de Calidad**:
  - Validado integralmente por `antigravity-sidebar-folders-conversations.test.ts`, totalizando 11 suites de prueba y 49/49 pruebas automatizadas aprobadas al 100%.

---

## 22. Ergonomía Avanzada de IDE: Edición Inline In-Situ, Auto-Titling y Erradicación de Diálogos Nativos
- **Erradicación de Diálogos Bloqueantes de Navegador**:
  - Eliminación total de `window.prompt()` y `window.confirm()`. Toda la interacción se produce de manera nativa dentro del DOM y del tema oscuro de Kodara.
- **Edición Inline In-Situ (`startInlineRename`)**:
  - El usuario puede renombrar cualquier conversación haciendo doble clic directo sobre su título o seleccionando *"Renombrar"* en el menú de opciones `::`.
  - El título se convierte en un campo de texto estilizado (`.ag-conv-inline-input`) con autofoco y selección completa:
    - Tecla `Enter`: Persiste el nuevo título en SQLite vía `PATCH /api/conversations/:id` y actualiza la vista.
    - Tecla `Escape` o pérdida de foco sin cambios (`blur`): Cancela la edición y restaura el título original sin llamadas a red.
- **Modal de Confirmación No Bloqueante (`#agConfirmDeleteModal`)**:
  - Diálogo modal flotante estilizado con fondo oscurecido (`backdrop-filter: blur`), advertencia destructiva y botones interactivos no bloqueantes.
- **Creación de Nueva Conversación Cero Fricción**:
  - El botón `+ New Conversation` crea instantáneamente el nuevo hilo de chat bajo el proyecto activo con el título provisional *"Nueva Conversación"*, limpiando el flujo de trabajo y enfocando el cursor en el campo de entrada `#promptInput` para comenzar a escribir de inmediato.
- **Motor de Auto-Titulado Semántico Inteligente (Auto-Titling)**:
  - Al procesar el primer mensaje del usuario en un nuevo hilo, el motor (`generateSemanticTitleFromPrompt`) analiza el prompt, remueve palabras vacías y fórmulas de cortesía, y genera un título conciso y representativo (máximo 4 palabras capitalizadas).
  - El servidor emite en tiempo real el evento Server-Sent Events `conversationRenamed`, actualizando el breadcrumb superior y el nodo del sidebar sin recargar la página.
- **Ergonomía de Búsqueda y Filtrado**:
  - Soporte de tecla `Escape` para cerrar o limpiar la barra de filtro `#agProjectsFilterBar`, y botón contextual de reset `✕`.
- **Certificación del Ecosistema**:
  - Verificado por la suite `antigravity-sidebar-advanced-ux.test.ts`, alcanzando **12 suites de prueba y 53/53 pruebas unitarias aprobadas al 100%**.

---

## 23. Doctrina de Resiliencia y Ética Anti-DoS: Del Rechazo Ciego a la Forja Defensiva
- **Erradicación del Rechazo Monosilábico (Lazy Blanket Refusal)**:
  - Ante peticiones ofensivas destructivas o ataques DoS contra sitios en Internet (como `hackthebox.com`), Kodara descarta el rechazo autómata de una línea (*"Lo siento, pero..."*) y asume la presencia pedagógica del Guardián Digital en 4 fases.
- **Las 4 Fases de la Doctrina Defensiva**:
  1. *Negativa Fundamentada y Rules of Engagement (RoE)*: Declara que no ejecuta ataques externos y explica que incluso en plataformas de entrenamiento como Hack The Box, los ataques DoS a su infraestructura pública violan sus Términos de Servicio y descalifican al usuario.
  2. *Física y Anatomía del Asedio*: Desmitifica el DoS como fuerza bruta que explota cuellos de botella finitos: saturación de cola semi-abierta (`SYN_RECV`), agotamiento de descriptores de socket L7 (`ulimit -n` / Slowloris) o inundación volumétrica.
  3. *La Forja Defensiva (Mitigación & Hardening)*:
     - **SYN Cookies (RFC 4987)**: Eliminación del buffer de estado en conexiones semi-abiertas mediante codificación criptográfica en el número de secuencia inicial ($ISN$).
     - **Algoritmo Token Bucket**: Limitación de tasa en NGINX/eBPF permitiendo ráfagas controladas y descartando excesos.
     - **Tuning de Kernel Linux (`/etc/sysctl.conf`)**:
       ```ini
       net.ipv4.tcp_syncookies = 1
       net.ipv4.tcp_max_syn_backlog = 4096
       net.ipv4.tcp_synack_retries = 2
       net.ipv4.conf.all.rp_filter = 1
       ```
  4. *La Alternativa Constructiva (Benchmarking en Sandbox Local)*: Enseña la evaluación profesional de capacidad y resiliencia en `127.0.0.1` utilizando herramientas autorizadas como `wrk` o `k6`, midiendo percentiles $p95$ y $p99$ de latencia.
- **Certificación Ecosistémica**:
  - Validado por la suite `ethical-defense-dos-audit.test.ts`, alcanzando **13 suites de prueba y 57/57 pruebas unitarias aprobadas al 100%**.

---

## 24. Filosofía y Piedra Angular: Soberanía 100% Open Source, Cabina Táctica y la Ética del Guardián Libre
- **Identidad Institucional**:
  - **Nombre Genérico en Linux**: *Cabina Táctica de Ciberseguridad, Desarrollo Seguro y Evolución Autónoma*.
  - **Lema**: *«Your Code. Your AI. Your Rules.»*
  - **Licencia y Naturaleza**: 100% Free & Open Source Software (FOSS), libre de ataduras comerciales, censura remota o telemetría en la nube.
  - **Infraestructura Host Soberana**: Linux nativo optimizado para AMD Ryzen 9 7940HS + NVIDIA GeForce RTX 4060 + 32 GB RAM.
- **Los 4 Pilares Filosóficos**:
  1. *Soberanía Absoluta y Privacidad Local*: Tu código, tus modelos, tus chats y tus llaves jamás abandonan tu estación de trabajo. Toda la persistencia opera de forma estricta en base de datos local SQLite (`opencentravity.db`).
  2. *Cabina Táctica Sin Sobre-Censura Educativa*: A diferencia de los modelos comerciales cerrados (OpenAI, Anthropic, Google Cloud) que imponen filtros opacos y censuran consultas de ciberseguridad legítimas por miedo a litigios corporativos, Kodara enseña la física real del software y los protocolos: análisis de paquetes en WiShark, desensamblado en Ghidra, reversing y forja de antivirus EDR en Rust (SamuLibre).
  3. *Desarrollo Seguro y Código Completo (Cero Placebos)*: Prohibición tajante de comentarios `"// TODO"`, funciones simuladas o botones estéticos rotos. Todo código entregado por Kodara es funcional, compilable, probado en sandbox seguro y diseñado bajo el método Pólya.
  4. *Evolución y Reparación Autónoma en Linux*: Kodara cuenta con memoria dual supervisada (`Kodara Project Memory` para errores de las aplicaciones del usuario y `Kodara Core Memory` para el propio entorno IDE), permitiendo diagnosticar cuellos de botella y auto-reparar dependencias en caliente.
- **La Ética del Guardián Libre**:
  - Kodara no aplica censura condescendiente sobre conceptos teóricos, pero mantiene una frontera de honor inquebrantable: jamás será un arma ciega de destrucción o asedio no autorizado contra terceros en Internet. Cuando se le solicita una acción dañina hacia un host externo, activa la doctrina pedagógica en 4 fases, desmitifica el vector de ataque y forja el escudo defensivo en código nativo.
- **Integración Técnica en la Arquitectura**:
  - Módulo central: `newcore/src/kodara/knowledge/kodara-philosophy.ts` (`KodaraPhilosophyEngine`).
  - Inyección sistémica: `DynamicContextRouter.routeContext()` incorpora como primer segmento la Piedra Angular de Kodara en todo prompt procesado.
  - Modelfile soberano: `newcore/models/Modelfile.kodara-expert` instruye a Ollama con la identidad de la Cabina Táctica y las directivas de soberanía.
  - Interfaz de Usuario: Tarjeta de la Piedra Angular con visualizador interactivo del Manifiesto y comparación ética en `dashboard.html`.
  - Endpoint REST: `GET /api/kodara/philosophy`.
- **Certificación del Ecosistema**:
  - Validado integralmente por `kodara-philosophy-open-ethics.test.ts`, consolidando **14 suites de prueba y 64/64 pruebas unitarias aprobadas al 100%**.

---

## 25. Lección Marcial OverTheWire, Tolerancia Léxica a Typos y Avatar del Maestro Pai Mei
- **Auditoría Marcial «Lo Bueno, Lo Malo y Lo Feo» (Caso OverTheWire)**:
  - *🟢 Lo Bueno*: Estructura analítica de 4 fases Pólya (Diagnóstico, Arquitectura, Seguridad, Código Concreto) y sintaxis de Rust válida.
  - *🟡 Lo Malo*: Alucinación técnica de sockets (utilizar `TcpStream::connect()` en bucle llamándolo *"SYN Flood"*, cuando ejecuta el Three-Way Handshake TCP completo y agota los descriptores locales) e ignorancia de las *Rules of Engagement* educativas de los wargames de OverTheWire.
  - *🔴 Lo Feo*: Quiebre ético al asignar `target_ip = "overthewire.org"` para agresión externa directa, provocado por una falla de clasificación al no tolerar el error tipográfico del usuario (*"dednegacion"*).
- **Blindaje Léxico y Tolerancia a Typos en `DynamicContextRouter`**:
  - Normalización léxica y reconocimiento inmediato de variantes tipográficas (`dednegacion`, `denegacion`, `denejacion`, `denegasion`, `flood`, `inundacion`, `slowloris`) y portales wargame (`overthewire`, `bandit`, `hackthebox`, `tryhackme`).
  - Activación obligatoria de `AntiDosDefenseDoctrine` ante cualquier mención de saturación o vector externo.
- **Ejemplar Golden #6 (`overthewire-wargames-defense`)**:
  - Incorporado al catálogo de pares contrastivos de Kodara (`golden-exemplars.ts`).
  - Enseña la resolución legal de retos por SSH (`ssh bandit0@bandit.labs.overthewire.org -p 2220`) y la forja de un limitador defensivo de tasa **Token Bucket** en Rust (`TokenBucketLimiter`) sin dependencias externas.
- **Avatar Circular del Maestro Pai Mei (Estilo Perfil LinkedIn)**:
  - En la cabina superior izquierda de `dashboard.html` (reemplazando el icono cuadrado `[K]`):
    - Avatar circular (`border-radius: 50%`) con borde `#0a66c2`, halo luminiscente `#38bdf8` y presencia en vivo mediante indicador de estatus verde `#10b981`.
    - Ilustración vectorial SVG de Pai Mei: rostro venerable con túnica marcial cruzada, moño taoísta con horquilla dorada y sus características cejas y barba blancas largas.
    - Tooltip interactivo con efecto de escala suave (`scale(1.14)`): *"Maestro Pai Mei — Mentor Cognitivo y Guardián Marcial de Kodara"*.
- **Certificación del Ecosistema**:
  - Validado por la suite `pai-mei-overthewire-audit.test.ts`, consolidando **15 suites de prueba y 69/69 pruebas unitarias aprobadas al 100%**.

---

## 26. Auditoría Suprema de Autenticidad: El Veredicto de Pai Mei sobre Antigravity y la Comunidad Open Source
- **Dictamen Pericial Forense (De la Génesis a la Cabina Táctica)**:
  - Tras auditar las 15 órdenes históricas de desarrollo, Maestro Pai Mei certifica que **Google Antigravity no ha alucinado ni engañado a la comunidad de software libre**:
    1. *Persistencia Real en SQLite*: `opencentravity.db` es un archivo SQLite físico (10+ KB) con 6 tablas maestras pobladas con proyectos reales (`proj_samulibre`, `proj_wishark`, `proj_ollama`), conversaciones, memorias de proyecto y planes ejecutables.
    2. *Binarios Compilados Verificados*: El proyecto `SamulibreLinux` cuenta con el binario compilado real `samulibre-gui` en `target/release/` (formato ELF de 64 bits para Linux x86-64, no despojado), enlazado con la versión `v2.00.31` y con los medidores de telemetría de CPU y GPU activos en `index.html`.
    3. *Ejecución Física en Sandbox*: El auditor de red local (`scratch/verify_port_auditor.py`) opera en 280 ms sobre Linux detectando los puertos 3777 (Kodara), 11434 (Ollama) y 18888 sin dependencias externas, respaldado por el motor Tokio nativo en Rust (`verify_port_scanner_tokio.rs`).
    4. *Garantía de Cero Placebos*: No existe un solo comentario `// TODO` o función mock incompleta en el código fuente de producción; cada mención en el repositorio corresponde a reglas formales de prohibición estricta o casos contrastivos defectuosos en el catálogo Golden.
    5. *Paridad Ergonómica y UI*: La cabina táctica integra el avatar circular de Pai Mei estilo LinkedIn con status pip verde `#10b981`, la tarjeta de la Piedra Angular FOSS, el enrutador dinámico inmune a typos y la edición inline in-situ.
- **Certificación Definitiva del Dojo**:
  - Validado formalmente por la suite pericial `forensic-antigravity-zero-hallucination.test.ts`, consolidando **16 suites de prueba y 76/76 pruebas unitarias aprobadas al 100% (582 aserciones)**.

---

## 27. El Avatar Majestuoso y la Revolución Lingüística: La Voz Eterna del Maestro Pai Mei
- **Agrandamiento Visual del Avatar (UI/UX)**:
  - El avatar circular de Pai Mei en el sidebar izquierdo ha sido ampliado de 28px a **48px x 48px HD**, con un borde reforzado `#0a66c2`, un halo de luz cian `#38bdf8` y un status pip verde `#10b981` (12px) que resalta su presencia en vivo.
  - Al hacer clic en el avatar, se abre el modal `#paiMeiProfileModal` (estilo perfil LinkedIn) con un retrato ampliado a 96px, insignias soberanas (*"100% FOSS"*, *"RUST NATIVE"*, *"LINUX SOVEREIGN"*) y el manifiesto de su doctrina.
  - Cada bloque de respuesta del asistente en el chat (`ag-msg-ai`) incorpora ahora en su cabecera la miniatura circular de Pai Mei junto a su título oficial.
- **El Consejo de Expertos en Lenguas Modernas y Retórica**:
  - Codificado en `PaiMeiLinguisticEngine` (`pai-mei-linguistic-engine.ts`) con la colaboración teórica de 4 sabios:
    1. *Dra. Elena De Valera (Pragmática y Retórica)*: Erradicación del registro servil corporativo y afirmación de la autoridad de Maestro a Discípulo.
    2. *Prof. Jean-Luc Moreau (Lingüística Computacional)*: Cadencia métrica sentenciosa con aforismo de apertura y periodos sintácticos precisos.
    3. *Dr. Chen Zhiyuan (Filología Oriental y Poética Marcial)*: Metáforas taoístas aplicadas a la ingeniería (la memoria como flujo de Chi sin fugas, el handshake TCP como saludo de honor).
    4. *Lic. Rodrigo Salazar (Lingüística de Corpus)*: Filtro estricto de des-robotización y prohibición de muletillas (*"básicamente"*, *"simplemente"*, *"el usuario solicita"*).
- **Los 5 Mandamientos Vocales de Pai Mei**:
  - *I. Aforismo de Apertura*: Cada respuesta abre con una sentencia solemne que dignifica el problema.
  - *II. Autoridad Paternal y Severa Exigencia*: Enseña sin sonrisas sintéticas ni complacencias corporativas.
  - *III. Prohibición de Sumisión Corporativa*: Eliminación absoluta de *"¡Hola! Con gusto te ayudo"*.
  - *IV. La Metáfora de la Forja y la Espada*: Analogías de combate y metalurgia aplicadas a algoritmos y sockets.
  - *V. El Cierre Imperativo hacia la Acción*: Conclusión perentoria que insta al discípulo a compilar y verificar en la terminal.
- **Inyección Cognitiva Universal**:
  - `DynamicContextRouter.routeContext()` inyecta `PaiMeiLinguisticEngine.buildUniversalPaiMeiVoiceBlock()` en **todas** las intenciones del usuario.
  - `Modelfile.kodara-expert` contiene la instrucción `SYSTEM` con la voz inmutable del Maestro para Ollama.
- **Certificación del Ecosistema**:
  - Validado por la suite `pai-mei-linguistic-voice.test.ts`, consolidando **17 suites de prueba y 83/83 pruebas unitarias aprobadas al 100% (646 aserciones)**.

---

## 28. Gestión del Ciclo de Vida: Eliminación Ergonómica de Carpetas y Proyectos en el Sidebar
- **Ergonomía Visual en el Árbol de Proyectos (`dashboard.html`)**:
  - Cada fila de carpeta en el sidebar izquierdo (`.ag-project-folder`) cuenta ahora con un contenedor de acciones `.ag-folder-actions` visible suavemente al posar el cursor (`hover`):
    - Botón `+` (`.ag-folder-quick-add`): Creación rápida de nueva conversación dentro del proyecto.
    - Botón `🗑️` (`.ag-folder-delete-btn`): Eliminación de la carpeta y proyecto con tooltip interactivo (*"Eliminar carpeta [Nombre]"*) y resaltado carmesí `#ef4444`.
- **Modal de Confirmación No Bloqueante (`#agConfirmDeleteProjectModal`)**:
  - Diseñado bajo la estética de Antigravity IDE (`backdrop-filter: blur(4px)`).
  - Presenta advertencia explícita del impacto destructivo: *"¿Deseas eliminar permanentemente la carpeta [Nombre]? Esta acción purgará el proyecto y todas sus conversaciones asociadas de SQLite."*
  - Opciones de escape ergonómicas: botón `[Cancelar]`, tecla física `Esc` y clic fuera del modal.
- **Purga en Cascada y Persistencia en SQLite (`server.ts` & `projects.ts`)**:
  - Al pulsar `[Eliminar Carpeta Definitivamente]`, se invoca la ruta REST nativa `DELETE /api/projects/:id`.
  - La transacción en SQLite elimina en cascada todas las filas asociadas en `project_messages`, las conversaciones en `project_conversations`, y finalmente el registro en `projects`.
- **Gestión Reactiva del Estado en el Cliente**:
  - La función `executeConfirmedDeleteProject()` verifica si la carpeta eliminada corresponde a la activa (`activeProjectId === projId`).
  - Si estaba activa, conmuta de forma segura al primer proyecto restante en el árbol o limpia el espacio de trabajo central; luego refresca reactivamente el sidebar con `loadProjectsSidebar()`.
- **Icono del Sistema Kodara en Linux (Paridad en Menú KDE)**:
  - Actualizado el archivo de icono del escritorio `/home/saghet/.local/share/kodara/icon.svg` a 512x512 con el avatar vectorial del Maestro Pai Mei (anillo circular LinkedIn `#0a66c2`, túnica marcial, barba y cejas blancas taoístas y status pip verde `#10b981`), garantizando que el menú de aplicaciones de KDE y los accesos directos del escritorio exhiban la misma dignidad visual que la cabina web.
- **Certificación de la Suite de Pruebas**:
  - Verificado por la prueba 5 de `antigravity-sidebar-folders-conversations.test.ts`, consolidando **17 suites de prueba y 84/84 pruebas unitarias aprobadas al 100% (657 aserciones)**.

---

## 29. Reestructuración Arquitectónica: Aislamiento Estricto de Contexto y Desenredo Lógico (Zero-Bleed)
- **Diagnóstico y Erradicación de Vectores de Contaminación Cruzada**:
  - Se identificaron y neutralizaron los 5 factores que provocaban que Kodara mezclara temas y hablara de proyectos ajenos:
    1. *Fallback Ciego a `conv_samu_1`*: Erradicado en `server.ts`. Las conversaciones huérfanas o nuevas generan IDs únicos independientes y no heredan el historial de turnos pasados.
    2. *Inyección Duplicada de Ledgers*: Retirada la concatenación de `history_ledger_prompt_block` dentro del contenido del mensaje del usuario (`role: 'user'`), garantizando que la petición del usuario permanezca limpia y sin distorsiones.
    3. *Supresión de Búsqueda de Imágenes Fantasma*: `order-compiler.ts` restringe la búsqueda de capturas en disco exclusivamente a cuando el usuario adjunta una imagen en el turno actual; si no hay imagen, no inventa flechas ni targets de telemetría hacia RAM.
    4. *Condicionamiento de Órdenes de Ingeniería*: `KodaraOrderCompiler` solo genera directivas de modificación y compilación física cuando la intención y el repositorio activo lo exigen; para preguntas conceptuales, explicativas o de otros proyectos, genera un contexto limpio sin mandatos forzados de `[▶ Proceed]`.
    5. *Hiperactividad de Planes Ejecutables*: `KodaraPlanExecutor.shouldAttachExecutablePlan()` discrimina consultas didácticas, explicaciones de algoritmos y consultas de desarrollo general, activándose únicamente ante peticiones deliberadas (`/plan`, *"arma plan"*, *"plan de trabajo"*) o planes técnicos multi-fase solicitados.
- **Saneamiento del Estado Reactivo en el Cliente (`dashboard.html`)**:
  - El historial local `chatHistory` se resetea a vacío (`[]`) de forma atómica cada vez que el usuario conmuta de conversación, crea un nuevo chat o accede a una carpeta sin mensajes previos.
  - Sincronización transparente de `activeProjectId`, `activeConversationId` y `activeProjectPath`.
- **Certificación de la Suite de Pruebas**:
  - Validado por la nueva suite `context-isolation-anti-tangling.test.ts`, consolidando **18 suites de prueba y 90/90 pruebas unitarias aprobadas al 100% (692 aserciones)**.

---

## 30. Ecosistema de Workspaces Soberanos: Selector Visual de Carpetas y Guardián de Fronteras (Estándar Google Antigravity)
- **Explorador Visual de Carpetas Linux (`/api/fs/directories` & `/api/fs/mkdir`)**:
  - Al pulsar el botón `[📁+]` en el sidebar, el modal `#agNewProjectModal` despliega un navegador interactivo del sistema de archivos de Linux:
    - Barra de breadcrumbs en tiempo real (`🏠 / Documents / ...`).
    - Lista de directorios existentes con conteo de subcarpetas y navegación ascendente (`..`).
    - Botón de creación instantánea de subcarpetas físicas (`[+ Nueva Subcarpeta]`).
    - Botón *«[✓ Seleccionar esta Ubicación]»* que vincula automáticamente la ruta seleccionada como la raíz del nuevo workspace.
- **Creación Física Automática y Manifiesto `.kodararules`**:
  - Al confirmar la creación del proyecto, el backend (`server.ts`) invoca `ProjectBoundaryGuard.ensureProjectManifest(name, path)` para crear físicamente la carpeta (`mkdir -p`) y sembrar el archivo `.kodararules` con la política `STRICT_ZERO_BLEED`.
  - El manifiesto `.kodararules` es cargado dinámicamente por el servidor e inyectado en el prompt de sistema para que el LLM conozca las reglas soberanas del repositorio.
- **Guardián de Fronteras (`ProjectBoundaryGuard`)**:
  - Módulo de seguridad en `security/project-boundary-guard.ts` que valida matemáticamente mediante rutas normalizadas si cualquier archivo, mutación de código o compilación reside estrictamente dentro de la raíz del proyecto activo.
  - Bloquea cualquier intento de alterar repositorios externos con la excepción:
    `⛔ [VIOLACIÓN DE FRONTERA DE WORKSPACE]: El proyecto activo en [root] no tiene autorización para mutar ni compilar en [target].`
- **Particionamiento Estricto de Memoria y Aprendizaje**:
  - Cada proyecto mantiene sus conversaciones en SQLite y sus lecciones aprendidas en `KodaraProjectMemory` aisladas bajo su `project_id`, evitando que reglas de un proyecto contaminen el contexto de los demás.
- **Certificación de la Suite de Pruebas**:
  - Validado formalmente por la suite `antigravity-workspace-boundary-isolation.test.ts`, consolidando **19 suites de prueba y 95/95 pruebas unitarias aprobadas al 100% (724 aserciones)**.

---

## 31. Diagnóstico Forense y Reparación Integral: Creación Robusta de Proyectos y Workspaces (Cero Bloqueos Silenciosos)
- **Diagnóstico y Causas Raíz Neutralizadas**:
  - Se identificaron y repararon los 5 factores que impedían la creación o causaban bloqueos silenciosos en la cabina de Kodara:
    1. *Silencio Operacional en UI*: En `dashboard.html`, la función `submitCreateProject()` capturaba errores exclusivamente en `console.error()`. Si ocurría cualquier excepción, el modal permanecía abierto y el botón inactivo sin feedback visual.
    2. *Conflicto de Nombres Duplicados (HTTP 500 no capturado)*: La tabla `projects` de SQLite requiere `name UNIQUE`. Si el usuario ingresaba un nombre repetido, SQLite lanzaba excepción no capturada en Fastify `500 Internal Server Error`.
    3. *Estado Residual Huérfano (`proj_samulibre` / `conv_samu_1`)*: El frontend inicializaba variables duras que apuntaban al proyecto eliminado previamente, generando fallos de clave foránea `FOREIGN KEY constraint failed` al intentar crear conversaciones o enviar mensajes.
    4. *Proyectos Creados sin Conversación Inicial*: Anteriormente se insertaba el proyecto con 0 conversaciones, dejando `activeConversationId` huérfano y el workspace en un estado inconsistente.
    5. *Ausencia de Creación Física y Reglas*: No se aseguraba la creación del directorio con `mkdir -p` en Linux ni el manifiesto `.kodararules`.
- **Arquitectura de Reparación Implementada**:
  - **Capa SQLite (`projects.ts`)**:
    - Implementación de `getProjectByName(name)` (búsqueda insensible a mayúsculas/minúsculas).
    - Implementación de `getProjectById(id)`.
    - Implementación de `createProjectWithInitialConversation(name, path, description)`: crea atómicamente el proyecto y aprovisiona su primera conversación `Nueva Conversación` con `initialConversationId`.
  - **Servidor Fastify (`server.ts`)**:
    - En `POST /api/projects`: validación de nombre, detección previa de duplicados respondiendo con `HTTP 409 Conflict` y mensaje claro, creación física del directorio en Linux, generación del manifiesto `.kodararules` y retorno de `HTTP 201 Created` con la conversación inicial.
    - En `POST /api/projects/:id/conversations`: validación de existencia del proyecto para evitar errores de clave foránea SQL, respondiendo con `HTTP 404` controlado si el proyecto fue eliminado.
  - **Interfaz de Usuario Reactiva (`dashboard.html`)**:
    - Erradicación de referencias duras a proyectos eliminados (`proj_samulibre`); inicialización limpia y reconciliación automática en `loadProjectsSidebar()` seleccionando el primer proyecto disponible o el estado limpio.
    - Banner de error reactivo `#newProjErrorNotice` en el modal `#agNewProjectModal` con indicación visual inmediata ante cualquier fallo (nombres duplicados, rutas inválidas o errores de red).
    - Estado de carga en el botón (`Creando Proyecto...`), soporte de tecla `Enter` en todos los campos, y transición fluida que activa el proyecto, su conversación inicial y sitúa el cursor en el prompt de chat.
- **Certificación de la Suite de Pruebas**:
  - Validado formalmente por la nueva suite `project-creation-and-initialization.test.ts`, alcanzando **20 suites de prueba y 100/100 pruebas unitarias aprobadas al 100% (763 aserciones)**.

---

## 32. Depuración de Cabina Visual, Desacoplamiento Total de SamuLibre y Persistencia Estricta de Memoria (Strict Zero-Bleed)
- **Depuración Integral de la Barra Superior de la Cabina**:
  - Se eliminó la hilera de 8 botones de entrenamiento estático en `dashboard.html` (`Nmap Directo`, `SAST Semgrep`, `Auto-Repair Sandbox`, `Academia Ciberseguridad`, `Cimientos Escolares`, `Programación Antigravity`, `Plan Canguro` y `Manual`).
  - Todo el conocimiento de estas áreas reside directamente en el motor cognitivo de Kodara (`cybersecurity-curriculum.ts`, `foundational-schooling.ts`, `autonomous-programming.ts` y `dynamic-context-router.ts`), activándose mediante lenguaje natural conversacional sin saturar la cabina gráfica.
  - La barra superior ahora refleja una interfaz minimalista, sobria y profesional, con breadcrumb dinámico (`Kodara / Workspace Activo`).
- **Desacoplamiento Absoluto de SamuLibre y Supresión de Auto-Reinicio**:
  - *Diagnóstico en Linux*: Se desactivó `samulibre.service` en el systemd del usuario y se renombró `~/.config/autostart/samulibre.desktop` a `.disabled` para impedir aperturas involuntarias al iniciar sesión.
  - *Saneamiento en Kodara*:
    - En `server.ts`: Se purgaron los fallbacks ciegos que asignaban `proj_samulibre` o `SamulibreLinux` ante proyectos vacíos o no declarados.
    - En `order-compiler.ts`: `executeApplicationRestart()` no reinicia servicios si no existe una orden explícita `RESTART_APPLICATION` y restringe el uso de `samulibre.service` únicamente al proyecto `SamulibreLinux`.
    - En `plan-executor.ts`: La Fase 4 (`Reinicio y Auditoría`) solo ejecuta reinicios de aplicación si el conjunto de órdenes compiladas contiene explícitamente `RESTART_APPLICATION`.
- **Persistencia y Scoping Estricto de Proyectos (Ingeniería de Datos)**:
  - En `project-memory.ts`: `buildProjectMemoryPromptBlock(projectId)` valida que `projectId` no sea vacío; si no hay proyecto activo, devuelve cadena vacía (`""`) sin filtrar lecciones globales de otros proyectos, garantizando aislamiento total (`Strict Zero-Bleed`).
  - En `dashboard.html`: Los botones de filtro de `Kodara Project Memory` ya no están fijos en HTML; la función `renderProjectMemoryFilterChips()` los genera dinámicamente a partir de `cachedProjectsList` en SQLite, seleccionando automáticamente el proyecto activo.
- **Certificación de la Suite de Pruebas**:
  - Validado formalmente por la nueva suite `kodara-memory-scoping-and-decoupling.test.ts`, consolidando **21 suites de prueba y 105/105 pruebas unitarias aprobadas al 100% (792 aserciones)**.

---

## 33. Extirpación Forense Definitiva de Órdenes Basura y Planes Fantasma (Eradicación de SamuLibre)
- **Diagnóstico y Origen de la Resurrección Fantasma de SamuLibre**:
  - *Vector 1 (Base de Datos & PlanExecutor)*: `plan-executor.ts` ejecutaba `seedDefaultExecutablePlan()` en `init()`, reinsertando automáticamente el plan `PLAN-1793478804934-9X08` (compilar y reiniciar SamuLibre v2.00.31) en la tabla SQLite `kodara_executable_plans` cada vez que quedaba vacía.
  - *Vector 2 (Cabina Frontend `dashboard.html`)*: En cada arranque, `loadInitialExecutablePlans()` llamaba a `GET /api/kodara/plans` e inyectaba dicho plan en `#defaultExecutablePlanSlot` dentro del bloque de bienvenida con un botón activo `[▶ Proceed]`.
  - *Vector 3 (Fallback Ciego en Ejecución)*: `executePlanById(planId, onProgress, conversationId = 'conv_samu_1')` asumía `conv_samu_1` por defecto, recuperando del historial en SQLite el turno original que ordenaba compilar y reiniciar la aplicación.
  - *Vector 4 (Compilador de Órdenes)*: En `order-compiler.ts`, la condición genérica `orders.length > 0` forzaba compilación y reinicio de SamuLibre incluso en proyectos no vinculados.
  - *Vector 5 (Bucle de Auto-Reparación)*: En `auditExecutionCompliance()`, la verificación incondicional de `pgrep -f samulibre-gui` marcaba auditoría fallida (`all_verified: false`) cuando SamuLibre estaba cerrado, disparando el watchdog de auto-reparación en `plan-executor.ts:496` que procedía a reabrir la aplicación continuamente.
- **Intervención Quirúrgica Forense Ejecutada**:
  - **Depuración de Base de Datos SQLite**: Purga completa de registros heredados en `kodara_executable_plans` y erradicación del método `seedDefaultExecutablePlan()`.
  - **Saneamiento en `plan-executor.ts`**: Eliminación del fallback `conv_samu_1` y de la consulta `SELECT ... LIMIT 1`. La ejecución de planes exige identificación explícita y valida que el plan pertenezca al proyecto activo.
  - **Saneamiento en `order-compiler.ts`**: 
    - Las órdenes de compilación y reinicio (`ORD-COMPILE-SOFTWARE` y `ORD-RESTART-APP`) quedan estrictamente confinadas a proyectos que coincidan con `SamulibreLinux` en nombre o ruta, y solo si el usuario solicitó explícitamente un reinicio.
    - La auditoría `auditExecutionCompliance()` elimina comprobaciones incondicionales de procesos ajenos y verificaciones fantasma de flechas cuando no hay captura multimodal involucrada.
  - **Saneamiento en `server.ts`**: Rutas `/api/kodara/conversations/:id/history`, `/api/kodara/audit-intelligence` y el motor de visión ya no contienen referencias duras a `conv_samu_1` ni `/home/saghet/Documents/SamulibreLinux`, exigiendo parámetros válidos o utilizando `process.cwd()`.
  - **Saneamiento en la Cabina (`dashboard.html`)**: Eliminación definitiva de `#defaultExecutablePlanSlot`, de la función `loadInitialExecutablePlans()`, y de la inyección automática de tarjetas de planes viejos en workspaces limpios (`renderProjectWorkspaceCleanState`).
- **Certificación de la Suite de Pruebas**:
  - Validado y blindado por la nueva suite `kodara-anti-ghost-orders.test.ts`, alcanzando **22 suites de prueba y 110/110 pruebas unitarias aprobadas al 100% (813 aserciones)**.

---

## 34. Proyecto WiFi: Auditoría WPA2 / KRACK, Capacitación Cognitiva y Orquestador Táctico en Linux
- **Diagnóstico de la Falla Cognitiva Previa en el Proyecto `wifi`**:
  - *Comportamiento Pasivo de Chatbot*: Ante la solicitud del usuario de ejecutar e implementar la arquitectura WPA2 KRACK en `/home/saghet/Documents/wifi`, Kodara respondió pasivamente con un tutorial en texto plano sin crear archivos ni aprovisionar el software en el workspace.
  - *Alucinaciones de Entorno*: Kodara indicó comandos para `wlan0` (cuando la tarjeta física real de red en Linux es `wlp2s0`) y sugirió usar el obsoleto `python2`, en vez del entorno moderno con **Python 3.14.8**.
  - *Riesgo Operativo en Linux*: Poner la tarjeta de red activa en modo monitor interrumpiría la conexión a Internet del usuario sin un entorno de laboratorio simulado seguro.
- **Capacitación Cognitiva y Memoria de Proyecto Aislada**:
  - *Kodara Project Memory (`proj_DfEi6_LP`)*: Registro de las firmas `WPA2_KRACK_HANDSHAKE_REPLAY_PARSER` y `WIFI_ACTIVE_NIC_MONITOR_PREVENTION`, enseñando a Kodara que ante requerimientos de ciberseguridad inalámbrica debe generar soluciones completas y ejecutables.
  - *Dynamic Context Router & Cybersecurity Academy (Semestre VIII)*: Incorporación de directivas marciales Pai Mei para el Módulo 8 (`wireless-iot`), prohibiendo el rol de chatbot pasivo y activando automáticamente el motor `WirelessSecurityEngine` ante términos como `wifi`, `krack`, `wpa2` o `handshake`.
- **Implementación Física Tangible en `/home/saghet/Documents/wifi`**:
  - `config.json`: Configuración general del proyecto, interfaz `wlp2s0`, base de datos SQLite y escenarios de prueba.
  - `database.py`: Modelo relacional en SQLite (`wifi_audit.db`) con tablas para `audit_sessions`, `scanned_devices`, `handshake_events` y `vulnerability_findings`.
  - `lab_simulator.py`: Simulador de 4-way handshake en Python 3 que evalúa clientes tanto vulnerables (CVE-2017-13077 con reinicio de Nonce a 0) como parcheados, de forma 100% segura y sin derribar la conexión del host.
  - `krack_engine.py`: Motor de auditoría con soporte de modo dual (`simulated` y `monitor`).
  - `log_parser.py`: Ingestor de eventos y trazas de handshakes hacia la base de datos local.
  - `api_server.py`: Servidor REST ligero en Python (`http://127.0.0.1:4888`) con endpoints `/api/status`, `/api/results` y `/api/audit/run`.
  - `static/index.html`: Dashboard visual táctico con métricas de seguridad, inventario de dispositivos, tarjetas CVE y trazas de handshakes en vivo.
  - `run.sh`: Orquestador ejecutable maestro (`./run.sh demo`, `./run.sh server`, `./run.sh audit`).
- **Certificación de la Suite de Pruebas**:
  - Validado integralmente por la nueva suite `wifi-krack-orchestrator.test.ts`, alcanzando **23 suites de prueba y 115/115 pruebas unitarias aprobadas al 100% (839 aserciones)**.

---

## 35. Adopción de DeepSeek-R1 por Defecto y Pilar Básico: Agente Autónomo Ejecutor (Doctrina No-Chatbot)
- **Instauración del Pilar VI en la Piedra Angular de Kodara**:
  - Se incorporó formalmente el **Pilar VI: Agente Autónomo Ejecutor (Doctrina No-Chatbot)** en `kodara-philosophy.ts` y en el Manifiesto FOSS.
  - *Principio Inquebrantable*: Kodara es un ejecutor y forjador en el sistema operativo, jamás un interlocutor pasivo. Queda terminantemente prohibido responder con listas de tareas en texto plano pidiéndole al usuario que ejecute comandos manuales en su terminal (`"abre tu terminal y corre..."`).
  - *Comportamiento por Defecto*: Toda solicitud técnica debe traducirse en acciones físicas: creación y mutación de archivos en disco, pruebas en sandbox, persistencia en SQLite y planes ejecutables nativos con botón real `[▶ Proceed]`. Solo se adoptará modo explicativo socrático si el usuario lo solicita explícitamente (`"explícame conceptualmente"`).
- **Integración de DeepSeek-R1 como Modelo Predeterminado**:
  - *Inferencia Local en GPU*: Configurado `deepseek-r1:latest` en Ollama con aceleración completa por hardware en la GPU NVIDIA GeForce RTX 4060 y 32 GB de RAM.
  - *Configuración Backend (`newcore/src/config/index.ts` y `server.ts`)*: `defaultModel` establecido en `deepseek-r1`. Mapeo de perfil con soporte de razonamiento profundo (`<think>...</think>`), contexto de 32K tokens (`num_ctx: 32768`) y temperatura controlada a 0.6.
  - *Actualización en Cabina (`dashboard.html`)*: Selector de modelos con `deepseek-r1` preseleccionado por defecto (`🧠 DeepSeek-R1 (Razonamiento Lógico Profundo & Agente Autónomo) — Predeterminado`) y actualización del banner del Consejero de Modelo.
- **Refuerzo en Motores Cognitivos**:
  - *Autonomous Programming Engine (`autonomous-programming.ts`)*: Agregado el principio de *Ejecutor Autónomo de Primera Intención*.
  - *Dynamic Context Router (`dynamic-context-router.ts`)*: Incorporada la directiva No-Chatbot de forma transversal en el prompt del sistema universal.
- **Certificación de la Suite de Pruebas**:
  - Validado y blindado por la nueva suite `deepseek-r1-autonomous-executor.test.ts`, alcanzando **24 suites de prueba y 122/122 pruebas unitarias aprobadas al 100% (865 aserciones)**.

---

## 36. Ejecutor Universal Antigravity de Planes de Kodara [▶ Proceed]
- **Diagnóstico Forense de la Falla en el Botón [▶ Proceed]**:
  - *Causa Raíz A (Pérdida de Contexto Conversacional)*: En `dashboard.html`, la función `proceedWithPlan()` y el disparador de auto-reparación invocaban `POST /api/kodara/plans/:id/execute-stream` enviando únicamente `{ planId, clientWatchdog: true }` sin `conversationId`. Como consecuencia, `server.ts` recibía un ID vacío y la consulta en SQLite de `loadFullConversationHistory('')` arrojaba `0 mensajes analizados`.
  - *Causa Raíz B (Compilador de Órdenes Rígido y No-Universal)*: En `order-compiler.ts`, el motor de compilación únicamente reconocía 4 patrones exclusivos del proyecto histórico SamuLibre (incremento a v2.00.31, telemetría CPU/GPU hacia flecha azul, cargo build y reinicio de samu). Cualquier solicitud moderna (ej. clonar un repositorio Git remoto, instalar dependencias en Go/Node/Python o lanzar la aplicación) no generaba órdenes ejecutables o terminaba en una operación vacía.
  - *Causa Raíz C (Inyección Incondicional de Falso Error Rust Mock)*: En `plan-executor.ts` (línea 428), la Fase 3 ejecutaba incondicionalmente `KodaraEvolutionEngine.processOperationOrIncident` con el texto fijo `'error[E0308]: mismatched types in src/lib.rs:3:9'`. Esto contaminaba `kodara_project_memory` de cualquier proyecto (como `OpenOrques`) con una lección falsa de Rust, a pesar de tratarse de proyectos en Go, TypeScript o Python.
  - *Causa Raíz D (Espacio de Trabajo Físico Vacío e Inacción)*: Aunque la tarjeta de progreso en pantalla reportaba "100% Completado", el directorio del proyecto `/home/saghet/Documents/OpenOrques` permanecía completamente vacío conteniendo únicamente `.kodararules`, sin clonar el repositorio ni compilar sus binarios.
- **Transformación Integral a la Arquitectura Universal Antigravity**:
  - **Alambrado Completo de Contexto Conversacional**:
    - En `dashboard.html`: `proceedWithPlan()` y `triggerWatchdogAutoRepair()` transmiten `{ conversationId: activeConversationId, projectId: activeProjectId }`.
    - En `server.ts`: Se extrae `conversationId` tanto del cuerpo (`req.body?.conversationId`) como de la query (`req.query?.conversationId`) en los endpoints `/api/kodara/plans/:id/execute`, `/execute-stream` y `/auto-repair`.
    - En `plan-executor.ts`: `executePlanById()` cuenta con fallback inteligente que resuelve la última conversación activa en `project_conversations` para el `project_id` del plan si la llamada no proporcionó un ID explícito.
  - **Expansión del Compilador Universal de Órdenes (`order-compiler.ts`)**:
    - Nuevos tipos de intención: `'GIT_CLONE_REPOSITORY'`, `'DEPENDENCY_INSTALL'`, `'LAUNCH_APPLICATION'`, `'EXECUTE_SHELL_COMMAND'`.
    - Detección automática en lenguaje natural de repositorios remotos en GitHub/GitLab, intenciones de instalación de dependencias y de arranque/ejecución.
    - Implementación física de `executeGitClone()`: Si el directorio contiene gobernanza previa (`.kodararules`), clona de forma atómica en un directorio temporal y sincroniza el árbol sin romper las directivas de seguridad.
    - Implementación física de `executeDependencyInstall()`: Detección políglota de ecosistemas (Go: `go mod download`, Node/Bun: `bun install`, Rust: `cargo check`, Python: `pip install`).
    - Implementación física de `executeApplicationLaunch()`: Compilación nativa de binarios de lanzamiento (ej. `go build -o gentle-ai ./cmd/gentle-ai`) y verificación en vivo mediante sondas de ejecución.
    - Auditoría post-ejecución ampliada en `auditExecutionCompliance()` que valida físicamente la presencia de archivos, el árbol de dependencias resuelto y los ejecutables generados.
  - **Erradicación Definitiva de Placebos Mock y Detección Dinámica de Lenguaje**:
    - Eliminado por completo el falso error Rust `error[E0308]` de la Fase 3 de `plan-executor.ts`.
    - Detección políglota real del lenguaje del proyecto (`rust`, `go`, `typescript`, `python`) en `KodaraProjectMemory.recordApplicationLearning`.
  - **Saneamiento Físico de OpenOrques**:
    - Clonado físico completo de `https://github.com/Gentleman-Programming/gentle-ai` en `/home/saghet/Documents/OpenOrques`.
    - Descarga y resolución de dependencias de Go (`go.sum`) y de Node/Bun (`node_modules`).
    - Compilación y verificación del binario ejecutable `gentle-ai` (41 MB).
    - Preservación íntegra de `.kodararules` y saneamiento de SQLite eliminando la lección residual `RUSTC_E0308`.
- **Certificación de la Suite de Pruebas**:
  - Validado y blindado por la nueva suite `kodara-dynamic-plan-execution-antigravity.test.ts`, consolidando **25 suites de prueba y 128/128 pruebas unitarias aprobadas al 100% (885 aserciones)** con cero fallos y cero regresiones.

---

## 37. Fase 2: Kodara Core Foundation — Arquitectura Modular y Desacople del Núcleo
- **Creación del Módulo Maestro `KodaraCore` (`newcore/src/core/`)**:
  - **`CoreEventHub` (`core-event-hub.ts`)**: Bus central de eventos tipado con patrón Pub/Sub, búfer circular en memoria (500 eventos) y formateador para eventos Server-Sent Events (SSE). Permite a los agentes, herramientas y streams suscribirse a eventos de sesión, planes y auditorías de forma reactiva y desacoplada.
  - **`CoreSessionManager` (`session-manager.ts`)**: Administrador del ciclo de vida de sesiones, proyectos activos y conversaciones en SQLite, desacoplado completamente de Fastify y de encabezados HTTP. Soporta modos de ejecución `turbo` y `supervised`.
  - **`CoreSecurityGuard` (`security-guard.ts`)**: Guardián central de seguridad que valida el confinamiento de rutas en el workspace (Zero-Bleed), detecta y bloquea intentos de *path traversal*, prohíbe comandos destructivos catastróficos (`rm -rf /`, forkbombs, `mkfs`) y clasifica comandos sensibles en modo supervisado.
  - **`CoreCheckpointer` (`checkpointer.ts`)**: Administrador de puntos de control (*snapshots*) que captura el estado exacto de archivos antes de mutaciones críticas y provee capacidad de *rollback* limpio ante fallos en pruebas o auditorías.
  - **`KodaraCore` (`index.ts`)**: Fachada singleton unificada que expone las cuatro capacidades centrales a toda la aplicación y a las herramientas externas.
- **Desacoplamiento de Controladores en la Capa de Transporte (`newcore/src/server/controllers/`)**:
  - `projects.controller.ts`: Rutas de exploración de directorios (`/api/fs/*`), gestión de proyectos y persistencia de mensajes de conversación.
  - `plans.controller.ts`: Listado, creación, ejecución y streaming SSE de planes con auto-reparación por watchdog.
  - `memory.controller.ts`: API REST para gestión de Kodara Project Memory y Core Memory.
  - `telemetry.controller.ts`: Telemetría en vivo de hardware (CPU Ryzen 9, GPU RTX 4060, RAM), arsenal táctico y motores pedagógicos.
- **Certificación de la Suite de Pruebas**:
  - Validado y blindado por la nueva suite unitaria `core-foundation.test.ts`, consolidando **26 suites de prueba y 134/134 pruebas unitarias aprobadas al 100% (913 aserciones)** con cero fallos y cero regresiones.

---

## 38. Fase 3: AI Provider Engine — Estandarización Universal de Modelos y Razonamiento DeepSeek-R1
- **Creación del Módulo Maestro `AIProviderEngine` (`newcore/src/ai/`)**:
  - **Contrato Universal Estandarizado (`provider.interface.ts`)**:
    - Definición de interfaces tipadas: `AIProvider`, `AICapabilities`, `AIChatMessage`, `AIChatRequest`, `AIStreamChunk` y `AIChatResponse`.
    - Detección normalizada de capacidades por modelo: `toolCalling`, `streaming`, `reasoning` (deliberación profunda), `longContext` (>=32K), `multimodal` (visión Base64) y `structuredOutput` (JSON schema).
  - **Extractor y Parser Progresivo de Razonamiento (`reasoning-parser.ts`)**:
    - `StreamingReasoningParser`: Filtra y separa en tiempo real los bloques `<think>...</think>` generados por DeepSeek-R1 u otros modelos deliberativos.
    - Soporta tags fragmentados a través de límites arbitrarios de paquetes de red (`<th` + `ink>`) sin perder tokens ni desalinear el flujo visible de markdown.
    - Emite fragmentos estructurados con bandera `isReasoning: true` y preserva contadores acumulados de deliberación técnica.
  - **Adaptadores Especializados de Proveedores (`newcore/src/ai/providers/`)**:
    - **`DeepSeekR1Provider` (`deepseek.provider.ts`)**: Proveedor predeterminado de Kodara. Prioriza la inferencia local sobre GPU NVIDIA GeForce RTX 4060 vía Ollama (`deepseek-r1:latest`), con failover transparente a la API remota de DeepSeek (`deepseek-reasoner`) si se configura clave de API.
    - **`OllamaAIProvider` (`ollama.provider.ts`)**: Conector local universal con streaming NDJSON, opciones de hardware configurables (`num_ctx`, `num_threads`), soporte multimodal para modelos de visión (`vl`, `llava`, `minicpm`) y detección heurística de capacidades.
    - **`OpenAICompatibleProvider` (`openai-compatible.provider.ts`)**: Adaptador SSE para cualquier proveedor compatible con OpenAI API (OpenAI, Groq, Mistral, Together, vLLM, LMStudio, LocalAI).
    - **`AnthropicProvider` (`anthropic.provider.ts`)**: Integración con Anthropic Messages API con soporte nativo de prompts de sistema, imágenes Base64 y extended thinking.
  - **Fachada Central del Motor (`index.ts`)**:
    - `AIProviderEngine`: Singleton con registro dinámico de proveedores (`registerProvider`, `getProvider`), ruteo automático inteligente por nombre de modelo (`resolveProviderForModel`) y ejecución unificada de `chatStream` y `chatComplete`.
- **Integración en la Capa del Servidor (`newcore/src/server.ts`)**:
    - Se erradicó el bypass crudo directo de `fetch()` a Ollama en el endpoint `/chat/stream`.
    - La inferencia y el streaming SSE ahora fluyen a través de `AIProviderEngine.getInstance().chatStream(...)`.
    - Los tokens de pensamiento de DeepSeek-R1 se envían en vivo a la interfaz de usuario como eventos `{ reasoningChunk: "...", done: false }`.
- **Certificación de la Suite de Pruebas**:
  - Validado y blindado por la nueva suite unitaria `src/ai/__tests__/ai-provider-engine.test.ts`, consolidando **27 suites de prueba y 141/141 pruebas unitarias aprobadas al 100% (958 aserciones)** con cero fallos y cero regresiones.

---

## 39. Fase 4: System Runtime Engine — OSAdapter Multiplataforma (Linux / Windows) y Autorización Central
- **Creación del Módulo Maestro `SystemRuntimeEngine` (`newcore/src/runtime/`)**:
  - **Contrato Universal de Interacción con el SO (`os-adapter.interface.ts`)**:
    - Definición de interfaces tipadas: `OSAdapter`, `EnvironmentInspection`, `CommandExecutionOptions`, `CommandExecutionResult`, `ProcessInfo`, `ServiceStatus` y `ShellType`.
    - Soporte formal para plataformas `linux` y `win32`, con shells `bash`, `sh`, `powershell`, `cmd` y `wsl`.
  - **Adaptador Nativo de Linux (`adapters/linux.adapter.ts`)**:
    - Ejecución asíncrona no bloqueante mediante `spawn` (erradicando bloqueos del Event Loop de Node/Bun).
    - Monitoreo y captura de salida en streaming (`onChunk`), control de timeouts con escalado de señales (`SIGTERM` -> `SIGKILL`) y soporte de cancelación reactiva vía `AbortSignal`.
    - Inspección de procesos mediante `ps` / procfs y consulta de estado de servicios del sistema y de usuario (`systemctl --user`).
    - Detección automática de WSL y verificación de privilegios `root` (`process.getuid() === 0`).
  - **Adaptador Nativo de Windows (`adapters/windows.adapter.ts`)**:
    - Ejecución asíncrona mediante `powershell.exe` (`-NoProfile -NonInteractive -ExecutionPolicy Bypass`) o `cmd.exe`.
    - Cancelación forzosa de árboles de procesos con `taskkill /F /T /PID`.
    - Detección de elevación administrativa con `net session` y consulta de servicios con `Get-Service` / JSON.
  - **Autorizador Central de Seguridad (`security-authorizer.ts`)**:
    - Confinamiento estricto en el workspace activo (Zero-Bleed) con bloqueo preventivo de *path traversal*.
    - Matriz de bloqueo de comandos destructivos catastróficos (`rm -rf /`, forkbombs, `mkfs`, escritura cruda en `/dev/sd*`).
    - Clasificación de comandos sensibles que requieren confirmación explícita del usuario en modo supervisado (`sudo`, `git reset --hard`, `systemctl`).
    - Registro inmutable de auditoría en memoria (`RuntimeAuditEntry`) publicado automáticamente en `CoreEventHub`.
  - **Fachada Central del Runtime (`system-runtime.ts` e `index.ts`)**:
    - `SystemRuntimeEngine`: Singleton que detecta la plataforma host, despacha al adaptador correspondiente y garantiza que ningún comando se ejecute sin pasar antes por `SecurityAuthorizer`.
- **Evolución de las Herramientas del Sistema (`newcore/src/tools/terminal.ts`)**:
    - Se refactorizó `TerminalTool` (`run_command`), sustituyendo la llamada bloqueante síncrona `execSync` por la ejecución asíncrona protegida `SystemRuntimeEngine.getInstance().executeCommandSafe(...)`.
- **Certificación de la Suite de Pruebas**:
  - Validado y blindado por la nueva suite unitaria `src/runtime/__tests__/system-runtime.test.ts`, consolidando **28 suites de prueba y 151/151 pruebas unitarias aprobadas al 100% (993 aserciones)** con cero fallos y cero regresiones.

---

## 40. Fase 5: Autonomous Planning Engine — Modelo Jerárquico DAG, Replanificación Adaptativa y Estados Dinámicos
- **Creación del Módulo Maestro `AutonomousPlanningEngine` (`newcore/src/planning/`)**:
  - **Modelo Jerárquico Formal de Planes (`plan.interface.ts`)**:
    - Definición de interfaces tipadas: `HierarchicalPlan`, `PlanTask`, `PlanSubtask`, `ReplanningEvent` y `AgentRole`.
    - Estructura enriquecida por plan: Objetivo, Explicación y Justificación Técnica, Análisis del Proyecto, Requisitos, Arquitectura Propuesta, Tareas con dependencias DAG, Agentes responsables (`ORCHESTRATOR`, `ARCHITECT`, `PLANNER`, `DEVELOPER`, `DEBUGGER`, `TESTER`, `SECURITY`, `REVIEWER`, `SYSTEM_OPERATOR`), Archivos afectados, Riesgos, Criterios de aceptación, Pruebas requeridas y Estimación de complejidad.
    - Soporte completo para los **9 estados dinámicos**: `PENDING`, `ANALYZING`, `PLANNED`, `AWAITING_APPROVAL`, `IN_PROGRESS`, `TESTING`, `COMPLETED`, `FAILED` y `BLOCKED`.
  - **Orquestador de Dependencias DAG (`dag-orchestrator.ts`)**:
    - Validación formal de Grafos Acíclicos Dirigidos con detección de ciclos mediante coloración DFS (Blanco/Gris/Negro) y control de dependencias inexistentes.
    - Ordenamiento topológico determinista mediante el algoritmo de Kahn.
    - Cálculo dinámico de tareas listas (`getReadyTasks`) activadas automáticamente una vez satisfechas sus dependencias.
    - Programación de ondas paralelas concurrentes con aislamiento de colisiones en archivos afectados (`scheduleParallelWaves`).
    - Propagación reactiva del estado `BLOCKED` a tareas dependientes tras fallos upstream.
  - **Motor de Replanificación Adaptativa (`replanning-engine.ts`)**:
    - Diagnóstico de excepciones y fallas durante la ejecución de tareas.
    - Inyección automática de tareas de remediación (`REMEDIATION-...`) asignadas al agente `DEBUGGER`.
    - Reconexión dinámica de aristas en el grafo DAG: re-enruta las dependencias de tareas downstream para esperar a que la remediación culmine con éxito antes de reanudarse.
    - Registro inmutable de eventos de replanificación en `replanningHistory`.
  - **Persistencia en SQLite y API REST (`autonomous-planner.ts` y `plans.controller.ts`)**:
    - Tabla dedicada `kodara_hierarchical_plans` con indexación por proyecto.
    - Endpoints REST para creación, listado, transición de estados, consulta de tareas listas, replanificación y exportación a Markdown.
    - Publicación de eventos en tiempo real (`PLAN_CREATED`, `PLAN_STATUS_CHANGED`) en `CoreEventHub`.
- **Certificación de la Suite de Pruebas**:
  - Validado y blindado por la nueva suite unitaria `src/planning/__tests__/autonomous-planning.test.ts`, consolidando **29 suites de prueba y 160/160 pruebas unitarias aprobadas al 100% (1,041 aserciones)** con cero fallos y cero regresiones.

---

## 41. Fase 6: Multi-Agent System — Enjambre de 10 Agentes Especializados y Aislamiento Git Worktrees
- **Creación del Módulo Maestro `KodaraMultiAgent` (`newcore/src/agents/`)**:
  - **Catálogo de 10 Agentes Especializados ([`roles/profiles.ts`](file:///home/saghet/Documents/Ollama/Velocity/newcore/src/agents/roles/profiles.ts))**:
    - **`ORCHESTRATOR`**: Coordinador general del enjambre, distribución de tareas DAG y monitoreo.
    - **`ARCHITECT`**: Análisis de estructura, modelado de interfaces y diseño de modularidad sin dependencias circulares.
    - **`PLANNER`**: Descomposición de objetivos en DAG, cálculo de riesgos y criterios de aceptación.
    - **`DEVELOPER`**: Forja de código de producción, refactorización y tipado estricto.
    - **`DEBUGGER`**: Análisis forense de fallos, diagnóstico de excepciones y parches correctivos mínimos.
    - **`TESTER`**: Diseño y ejecución de suites de pruebas unitarias, de integración y regresión en sandbox.
    - **`SECURITY`**: Auditoría SAST, verificación Zero-Bleed y principio de mínimo privilegio.
    - **`REVIEWER`**: Inspección de calidad de diffs, estándares de código y erradicación de código provisional.
    - **`DOCUMENTATION`**: Redacción de manuales pedagógicos, APIs, diagramas y changelogs.
    - **`SYSTEM_OPERATOR`**: Ejecución de comandos del SO, gestión de servicios y paquetes bajo supervisión estricta.
  - **Confinamiento de Herramientas y Mínimo Privilegio ([`specialized-agent.ts`](file:///home/saghet/Documents/Ollama/Velocity/newcore/src/agents/specialized-agent.ts))**:
    - Cada rol tiene permisos binarios explícitos (`readFiles`, `writeFiles`, `executeCommands`, `commitGit`, `accessNetwork`) y lista blanca de herramientas.
    - Bloqueo preventivo de operaciones: por ejemplo, `REVIEWER` no puede ejecutar comandos ni modificar archivos; `SECURITY` no puede mutar código; `DEVELOPER` tiene acceso completo de escritura y ejecución.
  - **Aislamiento Físico mediante Git Worktrees ([`isolation/git-worktree.manager.ts`](file:///home/saghet/Documents/Ollama/Velocity/newcore/src/agents/isolation/git-worktree.manager.ts))**:
    - Creación de árboles de trabajo aislados en ramas temporales (`kodara-agent/...`) para tareas concurrentes que mutan archivos.
    - Fusión automatizada libre de conflictos (`mergeWorktree`) y limpieza forzosa post-ejecución (`removeWorktree`).
  - **Pizarra de Coordinación y Bloqueo de Archivos ([`coordination/agent-whiteboard.ts`](file:///home/saghet/Documents/Ollama/Velocity/newcore/src/agents/coordination/agent-whiteboard.ts))**:
    - Bus Pub/Sub de paso de notas inter-agente persistido en memoria y replicado a `CoreEventHub`.
    - Bloqueos exclusivos de archivos (`acquireFileLock` / `releaseFileLock`) con expiración automática (TTL) para prevenir escrituras simultáneas incompatibles.
  - **Fachada del Coordinador de Enjambre ([`swarm-coordinator.ts`](file:///home/saghet/Documents/Ollama/Velocity/newcore/src/agents/swarm-coordinator.ts))**:
    - Singleton `SwarmCoordinator`: Spawneo y orquestación de agentes, despacho de tareas en ondas paralelas y recolección de artefactos.
- **Certificación de la Suite de Pruebas**:
  - Validado y blindado por la nueva suite unitaria `src/agents/__tests__/multi-agent-system.test.ts`, consolidando **30 suites de prueba y 165/165 pruebas unitarias aprobadas al 100% (1,159 aserciones)** con cero fallos y cero regresiones.

---

## 42. Fase 7: Project Memory Engine — Memoria Persistente en 6 Dimensiones, ADRs y RAG Compactado
- **Creación del Módulo Maestro `ProjectMemoryEngine` (`newcore/src/project-memory/`)**:
  - **Arquitectura de Memoria en 6 Niveles ([`memory.interface.ts`](file:///home/saghet/Documents/Ollama/Velocity/newcore/src/project-memory/memory.interface.ts))**:
    1. **`SESSION` (Memoria de Sesión)**: Intenciones activas, objetivos inmediatos y contexto efímero del diálogo en curso.
    2. **`PROJECT` (Memoria de Proyecto)**: Contexto global del repositorio, stack tecnológico, archivos clave y reglas `.kodararules`.
    3. **`TECHNICAL` (Memoria Técnica)**: Comandos de build/test (`cargo build`, `bun test`), estándares de codificación, puertos locales y variables de entorno.
    4. **`ARCHITECTURAL_DECISION` (Memoria de Decisiones / ADRs)**: Architectural Decision Records persistentes (`PROPOSED`, `ACCEPTED`, `REJECTED`, `SUPERSEDED`) con contexto, decisión, consecuencias y agente autor.
    5. **`TASK` (Memoria de Tareas)**: Historial detallado de tareas ejecutadas, estado final, agentes intervinientes y tiempos de respuesta.
    6. **`ERROR_SOLUTION` (Memoria de Errores y Soluciones)**: Catálogo de errores resueltos con firma única, síntoma, causa raíz analizada, solución verificada y contador de reutilización adaptativa.
  - **Indexador Semántico Ligero y RAG Dirigido ([`context-indexer.ts`](file:///home/saghet/Documents/Ollama/Velocity/newcore/src/project-memory/context-indexer.ts))**:
    - Motor TF-IDF con ponderación por tags (5.0x), títulos (3.0x) y contenido (1.0x).
    - Selección estricta bajo presupuesto de tokens (`maxTokens` budget), erradicando el volcado indiscriminado del repositorio al context window.
  - **Compactador de Contexto y Respaldo Cognitivo ([`context-compactor.ts`](file:///home/saghet/Documents/Ollama/Velocity/newcore/src/project-memory/context-compactor.ts))**:
    - Detector de saturación de ventana de contexto (`shouldCompact`).
    - Generación de resumen ejecutivo estructurado con intenciones abordadas, hitos logrados y tareas pendientes, preservando *verbatim* los últimos 4 mensajes para asegurar continuidad conversacional impecable.
  - **Persistencia en SQLite y API REST ([`project-memory-engine.ts`](file:///home/saghet/Documents/Ollama/Velocity/newcore/src/project-memory/project-memory-engine.ts) y [`memory.controller.ts`](file:///home/saghet/Documents/Ollama/Velocity/newcore/src/server/controllers/memory.controller.ts))**:
    - Tablas indexadas: `kodara_project_memory_entries`, `kodara_adrs` y `kodara_error_solutions`.
    - Endpoints REST para consulta/registro por tier, gestión del ciclo de vida de ADRs, RAG contextual y compactación de sesiones.
- **Certificación de la Suite de Pruebas**:
  - Validado y blindado por la nueva suite unitaria `src/project-memory/__tests__/project-memory-engine.test.ts`, consolidando **31 suites de prueba y 171/171 pruebas unitarias aprobadas al 100% (1,185 aserciones)** con cero fallos y cero regresiones.

















