# 🎨 Portafolio 3D & POP — Steban Gómez

Portafolio web interactivo de **Steban Gómez**, Diseñador Industrial y Tecnólogo en Desarrollo y Modelado de Productos Industriales especializado en el diseño, desarrollo y materialización de elementos **POP (Point of Purchase)** y soluciones visuales para puntos de venta (retail).

---

## 📌 ¿De qué trata el proyecto?

Esta plataforma web presenta el trabajo profesional de modelado 3D avanzado, renderizado fotorrealista y desarrollo técnico de exhibidores comerciales para grandes marcas en el sector retail.

El sitio permite a clientes, reclutadores y aliados estratégicos:
1. **Explorar proyectos en 3D tiempo real:** Inspeccionar modelos tridimensionales interactivos (rotación, zoom y paneo) de estructuras publicitarias reales junto con su ficha descriptiva.
2. **Conocer el ciclo de trabajo y stack técnico:** Revisar la metodología de diseño industrial (desde el *brief* y modelado 3D hasta planos de fabricación y producción) y el dominio de software especializado (*Rhinoceros, Keyshot, Inventor, AutoCAD, 3ds Max, Illustrator y Photoshop*).
3. **Descargar la Hoja de Vida (CV)** y contactar directamente por correo o redes sociales.
4. **Administrar el contenido sin tocar código (Modo Privilegiado):** Incluye un sistema tipo CMS integrado en el navegador que permite al administrador editar cualquier texto, actualizar enlaces de contacto/redes, gestionar proyectos (con sus descripciones) y subir un nuevo archivo de Hoja de Vida.

---

## ✨ Características Principales

### 🧊 1. Galería de Proyectos 3D Interactiva
* **Filtrado dinámico por categorías:** *Todas, Chimeneas, Columnas, Counters, Balconeras, Cenefas, Arcos y Otros*.
* **Visor 3D multimodal (`ModalViewer3D`):**
  * Soporte nativo para archivos `.glb` mediante **Google `<model-viewer>`** con iluminación neutral, sombras suaves y rotación automática.
  * Soporte para modelos embebidos de **Sketchfab**.
  * Soporte de respaldo (*fallback*) en imagen de alta resolución para proyectos que solo cuentan con render estático.
* **Descripción detallada:** Al abrir cualquier proyecto, se muestra en la parte inferior su descripción técnica y comercial.

### 🛠️ 2. Modo Privilegiado (Panel de Administración)
Accesible desde el botón flotante inferior derecho (contraseña por defecto: `steban2026`), manteniendo la sesión activa al navegar entre **Inicio** y **Sobre Mí**:
* **Edición de cualquier texto en línea (`contenteditable`):** Al activar el Modo Admin, todos los títulos, párrafos, etiquetas y tarjetas de software en *Inicio* y *Sobre Mí* se vuelven editables haciendo clic directamente sobre ellos. Incluye guardado automático, botón de **"💾 Guardar cambios"** y opción para **"Restaurar textos"** a su versión original.
* **Gestión de Proyectos (CRUD):** Formulario para agregar nuevos proyectos, editar existentes (nombre, categoría, ruta/URL de imagen, ruta/URL de modelo 3D y **descripción**) o eliminarlos. También permite editar la descripción directamente dentro del modal 3D abierto.
* **Edición de Enlaces de Contacto y Redes:** Permite modificar tanto el **texto visible** como la **URL o correo de destino (`href`)** del botón `CONTACTAR`, el correo del pie de página y el perfil de `Instagram`, ya sea haciendo clic directo sobre el enlace (mediante un *popover* flotante) o desde el formulario del panel admin.
* **Actualización de Hoja de Vida (CV):** Exclusivo en la página de *Inicio*, permite subir un archivo `.pdf`, `.doc` o `.docx` desde el computador (almacenado en **IndexedDB** para soportar archivos pesados) o definir un enlace externo para el botón **DESCARGAR CV**.

---

## 🏗️ ¿Cómo está construido? (Arquitectura y Tecnologías)

### Stack Tecnológico
* **HTML5 Semántico:** Estructura dividida en dos vistas principales: `index.html` (Hero, Resumen, Galería 3D, Modal y Admin) y `sobre-mi.html` (Perfil detallado, Proceso de 4 etapas y Stack técnico).
* **CSS3 Moderno (`style.css`):**
  * Diseño *Dark Mode* con estética industrial/tecnológica, efectos *Glassmorphism* (`backdrop-filter`), grillas con `CSS Grid` y `Flexbox`.
  * Animaciones fluidas (`@keyframes`) para el *cross-fade* de renders destacados en el Hero y transiciones de filtrado.
  * **Diseño 100% Responsivo:** Adaptado a pantallas de escritorio, tablets y dispositivos móviles/táctiles.
* **JavaScript (ES6+) bajo Programación Orientada a Objetos (POO):** Código modularizado en clases independientes sin dependencias externas pesadas.
* **Google `<model-viewer>` v3.5.0 & Sketchfab Embed:** Motor de renderizado WebGL / Three.js para los activos 3D.
* **Persistencia en Cliente:** Uso combinado de `localStorage` (proyectos, textos y enlaces), `sessionStorage` (estado de sesión Admin entre páginas) e `IndexedDB` (almacenamiento binario/DataURL del archivo de Hoja de Vida).

---

### 📂 Estructura de Carpetas

```text
Portafolio - Steban/
├── Assets/
│   ├── Archivos 3D Portafolio Steban/   # Modelos tridimensionales en formato .glb organizados por proyecto
│   └── Renders/                         # Imágenes y renders fotorrealistas (.png)
├── js/
│   ├── config/
│   │   └── AppConfig.js                 # Configuración global, constantes, proyectos y enlaces por defecto
│   ├── services/
│   │   ├── StorageService.js            # Servicio de persistencia (localStorage, sessionStorage e IndexedDB)
│   │   └── NotificationService.js       # Servicio de notificaciones visuales (Toasts)
│   ├── modules/
│   │   ├── ModalViewer3D.js             # Controlador del modal 3D/Sketchfab/Imagen y descripción del proyecto
│   │   ├── ProjectManager.js            # CRUD de proyectos, renderizado de tarjetas y filtros por categoría
│   │   ├── TextEditorManager.js         # Edición inline (contenteditable) de todos los textos del sitio
│   │   ├── LinkEditorManager.js         # Edición de texto y URL (href) para enlaces de contacto e Instagram
│   │   ├── CvManager.js                 # Carga, almacenamiento en IndexedDB y descarga de la Hoja de Vida
│   │   └── AdminController.js           # Autenticación, barra flotante inferior y coordinación del Modo Admin
│   └── main.js                          # Clase orquestadora principal (PortfolioApp)
├── index.html                           # Página principal (Hero, Ciclo de Producto, Galería 3D, Modal y Admin)
├── sobre-mi.html                        # Página de perfil profesional, enfoque de trabajo y stack de software
├── style.css                            # Hoja de estilos global, temas, componentes admin y media queries
└── README.md                            # Documentación del proyecto
```

---

### 🧩 Detalle de las Clases POO (`js/`)

| Clase | Archivo | Responsabilidad |
| :--- | :--- | :--- |
| **`AppConfig`** | `js/config/AppConfig.js` | Centraliza la contraseña por defecto, las claves de almacenamiento, los colores del stack de software, los enlaces iniciales y el catálogo base de proyectos con sus descripciones. |
| **`StorageService`** | `js/services/StorageService.js` | Encapsula la lectura/escritura segura de JSON en `localStorage`, el manejo de sesión en `sessionStorage` y la base de datos `IndexedDB` (`portfolio-cv-storage`) para guardar el archivo del CV. |
| **`NotificationService`** | `js/services/NotificationService.js` | Gestiona las notificaciones flotantes (*toasts*) de confirmación al guardar textos, enlaces, proyectos o el CV. |
| **`ModalViewer3D`** | `js/modules/ModalViewer3D.js` | Controla la apertura y cierre del visor modal, alternando entre `<model-viewer>`, `<iframe>` de Sketchfab o imagen estática, y muestra/edita la descripción del proyecto en la parte inferior. |
| **`ProjectManager`** | `js/modules/ProjectManager.js` | Carga y guarda proyectos, genera dinámicamente las tarjetas en `.projects-grid`, aplica los filtros animados por categoría y gestiona el formulario de creación/edición de proyectos. |
| **`TextEditorManager`** | `js/modules/TextEditorManager.js` | Detecta los bloques de texto en `index.html` y `sobre-mi.html`, activa `contenteditable="true"` en Modo Admin, guarda los cambios en `localStorage` y permite restaurar los textos originales. |
| **`LinkEditorManager`** | `js/modules/LinkEditorManager.js` | Sincroniza y permite editar el texto y el `href` de los enlaces de contacto (`CONTACTAR`, correo y `@stebitannn`) tanto desde un *popover* contextual como desde el panel admin. |
| **`CvManager`** | `js/modules/CvManager.js` | Gestiona la subida de archivos `.pdf`/`.doc`/`.docx` o URL para la Hoja de Vida en `index.html` y procesa su descarga al pulsar `DESCARGAR CV`. |
| **`AdminController`** | `js/modules/AdminController.js` | Maneja el inicio y cierre de sesión del Modo Privilegiado, construye la barra de herramientas flotante inferior y propaga el estado de administrador a todos los módulos. |
| **`PortfolioApp`** | `js/main.js` | Punto de entrada de la aplicación: instancia los servicios y módulos, inicializa el desplazamiento suave (*smooth scroll*) y arranca el ciclo de vida al cargar el DOM. |

---

## 🚀 Cómo ejecutar el proyecto localmente

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/estebanmeraaranda-arch/Portafolio---Steban.git
   cd Portafolio---Steban
   ```
2. **Abrir en el navegador:**
   * Para visualizar los modelos `.glb` locales en `<model-viewer>`, se recomienda abrir el proyecto con un servidor local (por ejemplo, la extensión **Live Server** en VS Code o ejecutando `npx serve .`).
   * La arquitectura modular POO está cargada mediante scripts ordenados estándar, por lo que todas las funciones de interfaz y administración también funcionan sin errores de CORS al abrir `index.html` directamente.

---

## 👤 Autor

**Steban Gómez** — *Diseñador Industrial & POP Designer*  
📍 Cali, Colombia  
📧 [stebangomezlopez1224@gmail.com](mailto:stebangomezlopez1224@gmail.com)
