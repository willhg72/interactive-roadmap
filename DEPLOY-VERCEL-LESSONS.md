# Lecciones Aprendidas: Despliegue de una App Full-Stack (React + Express) en Vercel

Esta guía resume los puntos críticos y las soluciones que encontramos al desplegar esta aplicación en Vercel. Seguir estos pasos asegurará futuros despliegues exitosos.

## 1. Configuración de `vercel.json`: La Clave del Éxito

El archivo `vercel.json` es fundamental para que Vercel entienda cómo construir y enrutar una aplicación full-stack.

### Build para Monorepos (Código Compartido)

Si tu API (en la carpeta `api/`) depende de código que está fuera de ella (como nuestra carpeta `shared/`), es **obligatorio** decirle a Vercel que incluya esos archivos en el paquete de la función serverless. De lo contrario, obtendrás un error `MODULE_NOT_FOUND`.

```json
{
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": "shared/**" // <-- ¡Esta línea es crucial!
      }
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ]
}
```

### Enrutamiento (Routing)

Las rutas deben configurarse para dirigir las peticiones `/api/...` al backend y todo lo demás al frontend (manejando el enrutamiento de una SPA).

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 2. Compatibilidad con Módulos ESM en Node.js

El entorno de Node.js en Vercel es estricto con las reglas de los Módulos de ECMAScript (ESM).

**Regla de Oro:** Todas las importaciones de archivos relativos en tu código de backend **deben** terminar con la extensión `.js`.

- **Incorrecto:** `import { storage } from './storage';`
- **Correcto:** `import { storage } from './storage.js';`

- **Incorrecto:** `import { schema } from '../shared/schema';`
- **Correcto:** `import { schema } from '../shared/schema.js';`

La ausencia de esta extensión es la causa más común del error `ERR_MODULE_NOT_FOUND` en los logs de Vercel.

## 3. Separar Entorno de Desarrollo y Producción

El código específico para desarrollo local no debe ejecutarse ni incluirse en el paquete de producción.

- **Servidor de Vite:** El servidor de desarrollo de Vite debe cargarse únicamente en desarrollo. La mejor práctica es usar una importación dinámica y condicional.
  ```typescript
  if (process.env.NODE_ENV === "development") {
    (async () => {
      const { setupVite } = await import("./vite.js");
      setupVite(app, server);
    })();
  }
  ```

- **Body Parser (`express.json`):** Aunque se creía que Vercel lo manejaba, la solución final y más segura fue habilitar el middleware `express.json()` para **todos los entornos**. Esto previene errores de validación (`400 Bad Request`) causados por un cuerpo de petición vacío o mal parseado.

- **Inicio del Servidor (`server.listen`):** El servidor HTTP solo debe iniciarse en local. En Vercel, la función serverless se encarga de ello. Usa una variable de entorno para controlarlo.
  ```typescript
  if (!process.env.VERCEL) {
    server.listen(port, () => { /* ... */ });
  }
  ```

## 4. Debugging en Vercel

El error `500: FUNCTION_INVOCATION_FAILED` es una pantalla genérica. **La verdadera causa del error siempre está en los logs.**

1.  Ve al **Dashboard** de tu proyecto en Vercel.
2.  Abre la pestaña **Logs**.
3.  Filtra por **Runtime Logs**.
4.  Busca el mensaje de error en rojo. Ese es el que te dirá exactamente qué está fallando.
