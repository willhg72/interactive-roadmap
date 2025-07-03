# Interactive Roadmap

Este es un proyecto full-stack que permite a los usuarios crear y visualizar roadmaps interactivos. La aplicación cuenta con un frontend construido en React y un backend en Express.

## Stack Tecnológico

- **Frontend**:
  - React
  - Vite
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui (basado en los componentes de Radix UI)
  - Recharts para visualizaciones

- **Backend**:
  - Express.js
  - TypeScript
  - Drizzle ORM
  - Base de datos PostgreSQL (compatible con Neon)
  - Autenticación con Passport.js

- **Herramientas de Desarrollo**:
  - `tsx` para ejecución de TypeScript en desarrollo
  - `esbuild` para el empaquetado del servidor

## Prerrequisitos

- Node.js (v18 o superior)
- npm, pnpm o yarn
- Una base de datos PostgreSQL. Puedes usar una local o una en la nube como [Neon](https://neon.tech).

## Instalación y Configuración

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/willhg72/interactive-roadmap.git
   cd interactive-roadmap
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto y añade la URL de conexión a tu base de datos. Drizzle la usará para las migraciones y la aplicación para conectarse.
   ```
   DATABASE_URL="postgresql://user:password@host:port/db"
   ```

4. **Sincroniza la base de datos:**
   Aplica el esquema de Drizzle a tu base de datos.
   ```bash
   npm run db:push
   ```

## Ejecución

- **Modo de desarrollo:**
  Inicia el servidor de desarrollo de Vite para el frontend y el servidor de Express con recarga en caliente para el backend.
  ```bash
  npm run dev
  ```

- **Build de producción:**
  Este comando compila el frontend y el backend en el directorio `dist`.
  ```bash
  npm run build
  ```

- **Iniciar en producción:**
  Ejecuta la aplicación desde los archivos compilados.
  ```bash
  npm run start
  ```

## Despliegue

Este proyecto está pre-configurado para un despliegue sencillo en [Vercel](https://vercel.com). El archivo `vercel.json` contiene la configuración necesaria para que Vercel construya y sirva tanto el frontend estático como la API del backend como funciones serverless.

Para desplegar:
1. Sube tu código a un repositorio de GitHub.
2. Conecta tu repositorio a un nuevo proyecto en Vercel.
3. Vercel detectará la configuración y desplegará la aplicación automáticamente.
