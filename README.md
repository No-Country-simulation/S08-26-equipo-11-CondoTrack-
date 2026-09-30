# 🏢 CondoTrack

## Sistema Integral de Gestión de Edificios y Condominios

> Plataforma web Full Stack orientada a centralizar la gestión operativa de edificios y condominios, relacionando edificios, unidades, personas, usuarios, roles y actividades operativas en un único sistema.

CondoTrack busca reducir la dispersión de información entre portería, planillas, WhatsApp y sistemas independientes mediante una fuente centralizada de información y trazabilidad.

---

## 🎯 Contexto

La administración de edificios y condominios involucra diariamente a diferentes actores:

- Administración.
- Recepción y portería.
- Residentes.
- Propietarios.
- Personal de mantenimiento.
- Proveedores.

Estas operaciones generan información relacionada con:

- Edificios y unidades.
- Personas y residentes.
- Usuarios y roles.
- Accesos y visitantes.
- Deliveries y correspondencia.
- Reservas de espacios comunes.
- Mudanzas.
- Incidentes.
- Mantenimiento.
- Comunicaciones y notificaciones.

Cuando esta información se encuentra distribuida entre diferentes herramientas, resulta más difícil conocer el estado real de una operación y reconstruir su historial.

CondoTrack propone centralizar esta información mediante una aplicación web Full Stack.

---

## ❗ Problema

La operación de un edificio puede depender de diferentes canales y registros:

```text
Portería
   ├── Registros manuales
   ├── Planillas
   ├── WhatsApp
   └── Sistemas externos
```

Esta fragmentación puede dificultar:

- Identificar quién realizó una solicitud.
- Conocer cuándo ocurrió una acción.
- Determinar quién gestionó una operación.
- Consultar el estado actual de una solicitud.
- Relacionar una actividad con una unidad determinada.
- Mantener un historial centralizado.

El desafío principal es lograr **centralización y trazabilidad de la operación**.

---

## 💡 Oportunidad

CondoTrack plantea transformar la operación en un flujo digital centralizado:

```text
Edificio
   ↓
Unidad
   ↓
Persona / Usuario
   ↓
Actividad
   ↓
Estado
   ↓
Historial
```

Conceptualmente, el sistema busca integrar dominios como:

```text
Edificio
   ↓
Unidad
   ↓
Residente / Propietario
   ↓
Accesos
   ↓
Deliveries
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

El objetivo no es únicamente reemplazar herramientas manuales por una interfaz, sino construir una **fuente centralizada de información para la operación del edificio**.

---

## 🎯 Objetivos

- Centralizar información operativa.
- Relacionar edificios, unidades y personas.
- Gestionar usuarios y roles.
- Implementar control de acceso mediante autenticación y autorización.
- Mejorar la trazabilidad de las operaciones.
- Reducir procesos manuales.
- Facilitar la administración de edificios.
- Gestionar unidades y sus vínculos con personas.
- Proporcionar una API REST documentada.
- Mantener una arquitectura modular y escalable.

---

## 🔐 Roles y permisos

El backend define cinco roles de sistema:

| Rol | Propósito |
|---|---|
| `SUPER_ADMIN` | Acceso global sobre los edificios y operaciones autorizadas a nivel de sistema. |
| `ADMIN` | Administración de edificios dentro de su alcance asignado. |
| `RECEPTION` | Rol destinado a operaciones de recepción y portería. |
| `RESIDENT` | Rol destinado a residentes vinculados a edificios/unidades. |
| `MAINTENANCE` | Rol destinado a operaciones de mantenimiento. |

---

## 🧰 Stack tecnológico

### Backend

| Tecnología | Uso |
|---|---|
| Node.js | Entorno de ejecución |
| Express | Framework para API REST |
| TypeScript | Tipado estático |
| PostgreSQL | Base de datos relacional |
| Neon | Plataforma utilizada para PostgreSQL |
| Sequelize | ORM |
| Sequelize CLI | Migraciones y seeders |
| sequelize-typescript | Integración de Sequelize con TypeScript |
| JWT / `jsonwebtoken` | Autenticación mediante tokens |
| Passport | Estrategias de autenticación |
| Google OAuth 2.0 | Autenticación con Google |
| bcrypt | Hash de contraseñas |
| Zod | Validación de datos |
| Swagger JSDoc | Generación de especificación OpenAPI |
| Swagger UI Express | Documentación interactiva |
| dotenv | Variables de entorno |
| CORS | Configuración de orígenes |

### Frontend

| Tecnología | Uso |
|---|---|
| React | Interfaz de usuario |
| Vite | Desarrollo y build |
| JavaScript | Lenguaje principal del frontend |
| Axios | Cliente HTTP |
| React Router DOM | Routing |
| Bootstrap | Estilos y componentes visuales |
| React Bootstrap | Componentes Bootstrap para React |
| Zustand | Gestión de estado |
| `html5-qrcode` | Funcionalidades relacionadas con lectura de QR |
| PropTypes | Validación de props |
| ESLint | Calidad y linting |

---

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

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/No-Country-simulation/S08-26-equipo-11-CondoTrack-.git
cd S08-26-equipo-11-CondoTrack-
```

### 2. Backend

```bash
cd backend
npm install
```

Configurar el archivo:

```text
backend/.env
```

Ejecutar las migraciones:

```bash
npm run db:migrate
```

Ejecutar los seeders cuando corresponda:

```bash
npm run db:seed
```

### 3. Frontend

Desde la raíz del proyecto:

```bash
cd frontend
npm install
```

Configurar:

```text
frontend/.env
```

con:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## ▶️ Ejecución local

### Backend

Desde `backend/`:

```bash
npm run dev
```

El servidor utiliza:

```text
http://localhost:3000
```

### Frontend

Desde `frontend/`:

```bash
npm run dev
```

Vite está configurado para utilizar:

```text
http://localhost:5173
```


## 📚 Documentación de la API (Swagger)

El backend utiliza:

- `swagger-jsdoc`
- `swagger-ui-express`

Con el backend ejecutándose localmente:

```text
http://localhost:3000/api-docs
```

---

## 👥 Equipo de desarrollo 

| Integrante | Rol |
|---|---|
| Alejandro Camacho | Project Manager |
| Alejandro Anchundia | Frontend Developer |
| Justina Mutigliengo | Backend Developer |
| Marcos Soria | Backend Developer (Manejo de GitHub) |
| María Grillo | QA Lead / QA Tester |

---

## 📌 Criterio de éxito

El objetivo funcional de CondoTrack es que un usuario pueda seleccionar un edificio o una unidad y consultar, desde un único sistema, la información relevante de las personas relacionadas y las actividades operativas correspondientes, junto con el historial de acciones disponible.

La evolución del sistema busca reducir la necesidad de consultar diferentes planillas, chats, registros manuales o herramientas independientes.

---

