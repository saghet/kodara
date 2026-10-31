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
