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


