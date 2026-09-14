# Frontend — CondoTrack

## Stack tecnológico

- **React** — Biblioteca para la construcción de interfaces de usuario.
- **Vite** — Herramienta de desarrollo y build.
- **JavaScript** — Lenguaje principal del proyecto.
- **Bootstrap** — Framework de estilos y componentes UI.
- **React Router** — Gestión de rutas y navegación.
- **pnpm** — Gestor de paquetes y dependencias.

## Configuración del proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/s08-26-equipo-11/CondoTrack.git
```

### 2. Ingresar al directorio del frontend

```bash
cd CondoTrack/frontend
```

### 3. Configurar las variables de entorno

Copia el archivo `.env.example` y crea el archivo `.env`:

```bash
cp .env.example .env
```

Configura en `.env` las variables de entorno necesarias para ejecutar el proyecto.

> Importante: el archivo `.env` no debe subirse al repositorio.

### 4. Instalar las dependencias

```bash
pnpm install
```

### 5. Ejecutar el proyecto en desarrollo

```bash
pnpm run dev
```

### 6. Generar el build de producción

```bash
pnpm run build
```

### 7. Previsualizar el build de producción

```bash
pnpm run preview
```

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `pnpm run dev` | Inicia el servidor de desarrollo |
| `pnpm run build` | Genera el build para producción |
| `pnpm run preview` | Previsualiza el build de producción |

**Nota:** este contenido debe quedar en un único archivo `README.md` y estar correctamente formateado en Markdown.
