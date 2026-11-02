# AUDITORÍA VISUAL Y UX/UI — KODARA DESIGN SYSTEM & DESKTOP SUITE

**Fecha:** 2026-11-01T20:39:30-05:00  
**Proyecto:** Kodara Autonomous Development Environment  
**Archivo Auditado:** `newcore/src/web/dashboard.html` y entorno nativo Linux (`kodara-desktop` GTK3 / WebKit2GTK).

---

## 1. PRINCIPIOS DE IDENTIDAD VISUAL DE KODARA A PRESERVAR

1. **Tema Oscuro Táctico FOSS:** Paleta de fondos oscuros (`--bg-sidebar: #111114`, `--bg-center: #16161a`, `--bg-right: #141418`, tarjetas `#1c1c22`).
2. **Estética Tecnológica Antigravity:** Borde sutil `#26262e`, contrastes en cian (`#22d3ee`), esmeralda (`#10b981`), azul eléctrico (`#3b82f6`) y púrpura de razonamiento (`#a855f7`).
3. **Jerarquía Modular de 3 Columnas:**
   - **Columna 1 (Izquierda):** Navegación, avatar de Pai Mei, proyectos, conversaciones y monitor de telemetría de hardware en vivo.
   - **Columna 2 (Centro):** Espacio maestro de diálogo, streaming de razonamiento y caja de prompts de ingeniería.
   - **Columna 3 (Derecha - Workbench):** Memorias en 6 dimensiones, Arsenal defensivo, Grafo de Planes DAG y Monitor del Enjambre de 10 Agentes.

---

## 2. PROBLEMAS DETECTADOS Y ANÁLISIS POR COMPONENTE

### A. Panel Lateral (Sidebar Izquierdo - 255px)
- **Estado:** Estable. El avatar circular de Pai Mei (48px) y el árbol de proyectos cargan correctamente.
- **Mejora Requerida:** Asegurar que los botones de filtrado y nueva carpeta no provoquen desbordamiento vertical cuando la lista de conversaciones es extensa.

### B. Área Central de Trabajo (Chat & Conversación)
- **Desajuste de Ancho:** En resoluciones de 1366x768 (habituales en laptops de desarrollo), el ancho asignado a la columna 3 (470px) ahoga el chat central, dejando menos de 640px de espacio útil.
- **Ruptura Visual por Errores de Red:** Cuando ocurre `TypeError: Load failed`, el frontend reemplaza todo el bloque AI por una cadena de error en rojo sin opciones de reintento, perdiendo el indicador de estado y desalineando el feed de conversación.
- **Solución:** Reestructurar la columna 3 a 380px (o colapsable) y dotar a la tarjeta de error de un diseño de tarjeta resiliente con botón de reintento.

### C. Panel Derecho (Workbench & Pestañas)
- **Problema de Inflexibilidad:** No existía botón o atajo para colapsar/expandir el Workbench. El desarrollador no podía aprovechar el 100% del ancho de pantalla al auditar código fuente o inspeccionar diffs.
- **Solución:** Implementar clase `.workbench-collapsed` en `body` y botón toggle `◨` en el breadcrumb superior.

### D. Selector de Modelos (DeepSeek-R1 y Proveedores)
- **Desbordamiento Crítico:**
  El elemento `<select id="modelSelect">` contenía etiquetas descriptivas excesivamente largas:
  `🧠 DeepSeek-R1 (Razonamiento Lógico Profundo & Agente Autónomo) — Predeterminado` (75+ caracteres).
  Al no tener `max-width` definido, el elemento medía más de 550px, empujando los controles del extremo derecho (`Turbo` y `Enviar`) fuera del viewport o superponiéndolos sobre el prompt en resoluciones menores a 1600px.
- **Solución:**
  1. Definir `max-width: min(340px, 40vw)` con `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;`.
  2. Simplificar el texto visible (`🧠 DeepSeek-R1 (Predeterminado)`) preservando la descripción completa en el atributo `title` y tooltip contextual.

### E. Campo de Entrada y Controles del Prompt
- **Alineación y Flexibilidad:**
  Añadir `flex-wrap: wrap; gap: 0.4rem;` a `.ag-prompt-bottom-bar` para garantizar que en cualquier ventana redimensionada los botones `+`, `🖼️ Imagen`, `modelSelect`, `Turbo` y `Enviar` permanezcan accesibles y visualmente armónicos.

### F. Comportamiento Responsive (1366x768, 1440x900, 1920x1080)
- En pantallas `<= 1366px`: Reducir el ancho base del Workbench a `360px`.
- En pantallas `<= 1080px`: El Workbench se oculta automáticamente o se despliega en modo flotante.
- Scroll independiente preservado en cada columna (`overflow-y: auto`) sin scroll horizontal parásito en el `body`.

### G. Consistencia del Sistema de Diseño
- Armonización de las fuentes tipográficas `Inter` (UI) y `JetBrains Mono` (código/DAG/diffs).
- Radio uniforme de bordes (`border-radius: 7px`) y sombras sutiles sin saturar el rendimiento de WebKitGTK.
