# Backend — API REST

El backend de **CondoTrack** consiste en una **API REST** desarrollada con Node.js, TypeScript y Express. Se encarga de gestionar la lógica del sistema, el acceso a la base de datos y la exposición de los endpoints utilizados por el frontend.

## 🛠️ Stack tecnológico

* **Node.js** — entorno de ejecución
* **TypeScript** — lenguaje de programación
* **Express** — framework para la API REST
* **PostgreSQL** — sistema de gestión de bases de datos
* **Sequelize** — ORM para PostgreSQL
* **Sequelize CLI** — gestión de migraciones y seeders
* **Neon** — servicio de PostgreSQL en la nube
* **Swagger** — documentación de la API
* **swagger-autogen** — generación automática de la documentación Swagger
* **dotenv** — gestión de variables de entorno
* **CORS** — configuración de acceso entre dominios

## 🌐 API REST

La API utiliza una arquitectura REST y expone diferentes endpoints para permitir la comunicación entre el frontend y el backend.

## 📁 Estructura

```text
backend/
├── src/
│   ├── config/
│   ├── modules/
│   ├── middlewares/
│   ├── routes/
│   ├── app.ts
│   └── server.ts
├── config/
├── migrations/
├── seeders/
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

## 📋 Requisitos

Antes de comenzar, es necesario contar con las siguientes herramientas instaladas:

- **Node.js** — versión 18 o superior
- **npm** — incluido con Node.js
- **Git** — para clonar y gestionar el repositorio

## 📥 Instalación

Clonar el repositorio:

```bash
git clone https://github.com/No-Country-simulation/S08-26-equipo-11-CondoTrack-.git
```

Ingresar a la carpeta del backend

```bash
cd backend
```

Instalar las dependencias

```bash
npm install
```

## ⚙️ Configuración

### Variables de entorno

Crear un archivo `.env` en la raíz del backend a partir de `.env.example`.

Ejemplo:

```env
PORT=3000
DATABASE_URL=tu_url_de_postgresql
```

> El archivo `.env` contiene información sensible y no debe subirse al repositorio.

### Sequelize

La configuración de Sequelize se encuentra en:

```text
config/config.js
```

Las migraciones y los seeders se encuentran en:

```text
migrations/
seeders/
```

## 🗄️ Base de datos

El proyecto utiliza **PostgreSQL** como motor de base de datos y **Sequelize** como ORM.
Las migraciones permiten crear y modificar la estructura de la base de datos de manera controlada.

Ejecutar las migraciones:

```bash
npx sequelize-cli db:migrate
```

Deshacer la última migración:

```bash
npx sequelize-cli db:migrate:undo
```

Los seeders permiten cargar datos iniciales o de prueba.

Ejecutar los seeders:

```bash
npx sequelize-cli db:seed:all
```

## ▶️ Ejecución

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

Compilar el proyecto:

```bash
npm run build
```

Ejecutar la versión compilada:

```bash
npm start
```

## 📚 Swagger

La documentación de la API se genera mediante **swagger-autogen** y está disponible a través de Swagger UI:

```text
http://localhost:3000/api-docs
```

## 📌 Endpoints

Esta sección se completará a medida que se implementen los diferentes módulos y endpoints de la API.

