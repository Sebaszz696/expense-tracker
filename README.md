# AhoraGasto

Aplicación web para control de gastos personales. Dark mode elegante, gráficas interactivas, sincronización en la nube y acceso desde PC y celular.

## Características

- **Dashboard** con balance mensual, porcentaje de presupuesto usado y torta de categorías
- **Registro de gastos** con categorías, búsqueda y filtro por mes
- **Ingresos** — salario fijo mensual + ingresos adicionales
- **Presupuesto por categoría** con barras de progreso y alertas de color
- **4 gráficas**: distribución, gastos diarios, acumulado vs ingreso, presupuesto vs gastado
- **Login con JWT** — datos sincronizados entre dispositivos
- **Modo oscuro** por defecto, cambiable a claro desde Ajustes
- **Responsive** — sidebar en escritorio, barra inferior en móvil
- **Moneda COP** con formato colombiano

## Tecnologías

| Capa       | Stack                                      |
|------------|--------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS   |
| Gráficas   | Recharts                                   |
| Backend    | Node.js, Express, TypeScript               |
| Base datos | SQLite (better-sqlite3)                    |
| Auth       | JWT + bcryptjs                             |

## Requisitos

- [Node.js](https://nodejs.org) v18 o superior

## Instalación y desarrollo local

```bash
# 1. Instalar todas las dependencias (raíz, client y server)
npm install

# 2. Ejecutar en modo desarrollo (frontend + backend simultáneos)
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

> El archivo `.env` en `server/` ya tiene valores por defecto para desarrollo. Cámbia el `JWT_SECRET` antes de subir a producción.

## Comandos disponibles

```bash
npm run dev          # Inicia frontend y backend en paralelo
npm run build        # Compila frontend y backend para producción
npm start            # Ejecuta el servidor de producción (sirve el frontend compilado)
npm run dev:client   # Solo el frontend
npm run dev:server   # Solo el backend
```

## Variables de entorno

Archivo: `server/.env`

```env
JWT_SECRET=cambia-esto-por-un-string-seguro
PORT=3001
```

## Despliegue gratis en Render.com

1. Sube el proyecto a GitHub
2. Crea cuenta en [render.com](https://render.com)
3. **New → Web Service** → conecta el repositorio
4. Configura:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Agrega la variable de entorno `JWT_SECRET` con un valor seguro
6. Deploy — Render te da un dominio gratuito tipo `ahoragasto.onrender.com`

> El plan gratuito de Render puede tardar ~30 segundos en responder tras períodos de inactividad.

## Estructura del proyecto

```
expense-tracker/
├── client/          # Frontend React
├── server/          # Backend Express + SQLite
├── package.json     # Scripts raíz
├── README.md
└── CONTEXTO_PROYECTO.md  # Documentación técnica detallada
```

Para documentación técnica detallada (decisiones de arquitectura, API endpoints, esquema de base de datos) ver [CONTEXTO_PROYECTO.md](./CONTEXTO_PROYECTO.md).
