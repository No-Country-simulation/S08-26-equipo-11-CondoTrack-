# 🏢 CondoTrack — Plataforma de Gestión Operativa para Edificios

> **Plataforma centralizada para la gestión, comunicación y trazabilidad operativa de edificios y condominios.**

**CondoTrack** integra en un único sistema la administración de residentes, unidades, accesos por QR, deliveries, reservas, mudanzas, incidentes y mantenimiento, proporcionando **trazabilidad completa de la operación** en tiempo real.

---

## 🎯 Problema y Solución

La información operativa de los edificios suele estar dispersa entre portería, WhatsApp, planillas y sistemas aislados. Esto dificulta el seguimiento de accesos, reservas, deliveries, incidentes y tareas de mantenimiento.

**CondoTrack** propone una fuente única de información que centraliza estos procesos y los relaciona directamente:

```text
Edificio → Unidad → Residente → Accesos → Deliveries
                         ↓
                    Reservas
                         ↓
                    Mudanzas
                         ↓
                   Incidentes
                         ↓
                  Mantenimiento
                         ↓
                  Notificaciones
```

El objetivo es que un usuario pueda consultar la información relevante de un edificio o unidad, junto con el historial unificado de acciones, sin depender de herramientas informales.

---

## ✨ Características Principales

- 👥 **Gestión de Estructura:** Unidades, departamentos y vinculación de residentes.
- 🔐 **Control de Accesos:** Generación de invitaciones y validación mediante código QR en recepción.
- 📦 **Trazabilidad de Deliveries:** Registro de paquetes en portería, alertas automáticas y confirmación de entrega.
- 🏊 **Módulo de Reservas:** Gestión y disponibilidad en tiempo real para espacios comunes (Parrilla, SUM, Coworking).
- 🚚 **Gestión de Mudanzas:** Solicitud y coordinación de fechas/horarios de mudanzas.
- ⚠️ **Incidentes y Mantenimiento:** Reporte de fallas, asignación a personal técnico y seguimiento de estados.
- 🔔 **Centro de Notificaciones:** Envío de avisos generales e informativos por edificio.
- 📝 **Bitácora Unificada:** Historial centralizado y ejecuciones operativas filtrables por fecha.

---

## 🔐 Roles y Sistema de Permisos (RBAC)

El sistema implementa un modelo de seguridad basado en **5 roles explícitos**:

| Rol | Descripción |
| --- | --- |
| `SUPER_ADMIN` | Administrador global del sistema (alta de administraciones, edificios y métricas consolidadas). |
| `ADMIN` | Gestión operativa de los edificios a su cargo, asignación de mantenimiento y aprobaciones. |
| `RECEPTION` | Personal de portería encargado del control de accesos, verificación de QR y recepción/entrega de paquetes. |
| `RESIDENT` | Propietarios o inquilinos vinculados a una unidad específica (solicitudes, reservas, invitaciones y avisos). |
| `MAINTENANCE` | Personal encargado de la recepción, atención y resolución de reportes de mantenimiento. |

---

## 🧱 Stack Tecnológico

### Backend

| Tecnología | Uso |
| --- | --- |
| Node.js | Entorno de ejecución |
| Express | Framework para API REST |
| TypeScript | Tipado y desarrollo del backend |
| PostgreSQL / Neon | Base de datos relacional |
| Sequelize | ORM para la gestión de modelos y migraciones |
| Neon | Serverless |
| Swagger | Documentación interactiva de la API |
| dotenv / CORS | Variables de entorno y configuración de orígenes |

### Frontend

| Tecnología | Uso |
| --- | --- |
| React | Interfaz de usuario basada en componentes |
| Vite | Herramienta de desarrollo y empaquetado rápido |
| JavaScript (ES6+) | Lenguaje base de desarrollo UI |
| Bootstrap | Estilos, maquetación y componentes UI |
| Axios | Cliente HTTP para consumo de la API REST |
| Zustand | Manejo del estado global de la aplicación |
| react-router-dom | Enrutamiento y navegación entre vistas |

### Gestión y QA

| Herramienta | Uso |
| --- | --- |
| GitHub Projects | Gestión del Backlog, Épicas e Historias de Usuario |
| Testing / QA | Pruebas funcionales, validación de API REST y casos de prueba |

---

## 🏗 Arquitectura del Proyecto

El backend utiliza una arquitectura modular, organizada mediante la carpeta `modules/`. Cada módulo agrupa los componentes relacionados con una determinada funcionalidad:

```text
Módulo
├── routes
├── controllers
├── services
└── models
```

La solución se divide formalmente en dos capas principales:

```text
CondoTrack
├── backend/    ──> API REST y Lógica de Negocio
└── frontend/   ──> Aplicación Web SPA
```

---

## 📁 Estructura de Carpetas

### Backend

```text
backend/
├── src/
│   ├── config/
│   ├── modules/
│   │   ├── buildings/
│   │   ├── units/
│   │   ├── residents/
│   │   ├── accesses/
│   │   ├── deliveries/
│   │   ├── reservations/
│   │   ├── moves/
│   │   ├── incidents/
│   │   ├── maintenance/
│   │   └── notifications/
│   ├── middlewares/
│   ├── routes/
│   ├── app.ts
│   └── server.ts
├── .env
├── package.json
└── tsconfig.json
```

### Frontend

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── modules/
│   ├── services/
│   ├── store/
│   ├── routes/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── vite.config.js
```

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/No-Country-simulation/S08-26-equipo-11-CondoTrack-.git
```

### 2. Configurar y levantar el Backend

```bash
cd backend
npm install
```

Crear un archivo `.env` dentro de la carpeta `backend/`:

```env
PORT=3000
DATABASE_URL=tu_url_de_postgresql
```

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

La API quedará disponible en `http://localhost:3000`.

### 3. Configurar y levantar el Frontend

Desde la carpeta raíz:

```bash
cd frontend
npm install
npm run dev
```

Vite desplegará el entorno local (habitualmente en `http://localhost:5173`).

---

## 📚 Documentación de API (Swagger)

La API REST del backend se encuentra documentada interactivamente mediante Swagger. Una vez iniciado el servidor backend, ingresá a:

```text
http://localhost:3000/api-docs
```

---

## 👥 Equipo de Desarrollo

| Nombre y Apellido | Rol en el Proyecto |
| --- | --- |
| Alejandro Camacho | Project Manager / Full Stack Developer |
| Laura Espindola | Frontend Developer |
| Valen Flores | Frontend Developer |
| Alejandro Anchundia | Frontend Developer |
| Justina Mutigliengo | Backend Developer |
| Marcos Soria | Backend Developer (Manejo de GitHub) |
| María Grillo | QA Lead / QA Tester |

---
