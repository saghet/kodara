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

### 2.2 Columna Central: Consola Táctica, Planes Ejecutables (`[▶ Proceed]`) y Modo Turbo
1. **Barra Superior de Acciones Directas (`1-Click Toolbelt`)**:
   - **`📋 Generar Plan Ejecutable`**: Crea en SQLite un nuevo artefacto de plan en 4 fases para el proyecto activo con su botón real **`[▶ Proceed]`**.
   - **`🔍 Nmap Directo`**: Escanea inmediatamente los puertos y servicios del objetivo activo.
   - **`🛡️ SAST Semgrep`**: Ejecuta una auditoría estática de código sobre el proyecto activo y extrae hallazgos CWE.
   - **`🔧 Auto-Repair Sandbox`**: Dispara una demostración real del ciclo de diagnóstico, reparación en Sandbox (`rustc`) y verificación de pruebas unitarias (`rustc --test`).
   - **`📖 Manual`**: Abre este manual completo dentro del flujo central.
2. **Pilar de Planes Ejecutables Reales (`[▶ Proceed]`)**:
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
