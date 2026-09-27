# Backend — CondoTrack API

API REST de CondoTrack, desarrollada con Node.js, TypeScript y Express para gestionar edificios, unidades y autenticación de usuarios. Utiliza PostgreSQL y Sequelize para la persistencia de datos.

## Stack tecnológico

- Node.js, TypeScript y Express
- PostgreSQL, Sequelize y Sequelize CLI
- Zod para validar datos de entrada
- JWT y bcrypt para la autenticación local
- Passport y Google OAuth 2.0 para el acceso con Google
- `swagger-jsdoc` y Swagger UI para la documentación de la API

## Estructura del backend

```text
backend/
├── config/            # Configuración de Sequelize CLI
├── migrations/        # Cambios en la estructura de la base de datos
├── seeders/           # Datos iniciales
├── src/
│   ├── config/        # Variables de entorno y Swagger
│   ├── database/      # Conexión y relaciones entre modelos
│   ├── docs/          # Documentación OpenAPI
│   ├── middlewares/
│   ├── modules/       # Módulos de autenticación, edificios y unidades
│   ├── routes/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Instalación

Clonar el repositorio e ingresar al backend:

```bash
git clone https://github.com/No-Country-simulation/S08-26-equipo-11-CondoTrack-.git
cd S08-26-equipo-11-CondoTrack-/backend
npm install
```

## Variables de entorno

Crear un archivo `backend/.env` tomando como referencia `backend/.env.example`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=tu_url_de_postgresql

JWT_SECRET=una_clave_larga_y_secreta
JWT_EXPIRES_IN=90d

GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

SEED_SUPER_ADMIN_EMAIL=superadmin@example.com
SEED_SUPER_ADMIN_PASSWORD=una_contraseña_segura
```

## Base de datos

La configuración de Sequelize CLI se encuentra en `backend/config/config.cjs`. Las migraciones están en `backend/migrations/` y los seeders en `backend/seeders/`.

Desde la carpeta `backend`, ejecutar:

```bash
npm run db:migrate
npm run db:seed
```

## Ejecución

Iniciar el servidor en desarrollo:

```bash
npm run dev
```

Compilar TypeScript:

```bash
npm run build
```

Ejecutar la versión compilada:

```bash
npm start
```

## Autenticación y permisos

CondoTrack ofrece registro e inicio de sesión con email y contraseña, además de autenticación con Google OAuth 2.0.

| Método | Ruta                        | Función                                                        |
| ------ | --------------------------- | -------------------------------------------------------------- |
| `POST` | `/api/auth/register`        | Registrar un usuario con email y contraseña                    |
| `POST` | `/api/auth/login`           | Iniciar sesión con email y contraseña                          |
| `GET`  | `/api/auth/google`          | Iniciar el flujo de autenticación con Google                   |
| `GET`  | `/api/auth/google/callback` | Recibir la respuesta de Google y devolver un JWT de CondoTrack |

Para llamar a un endpoint protegido, enviar el token en el encabezado:

```http
Authorization: Bearer <token>
```

## Documentación Swagger

Las especificaciones OpenAPI se mantienen en `backend/src/docs/*.docs.ts` mediante `swagger-jsdoc`. Con el servidor iniciado, Swagger UI está disponible en:

```text
http://localhost:3000/api-docs
```

Para probar rutas protegidas desde Swagger, usar **Authorize** e ingresar un JWT válido.
