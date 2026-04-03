# Contexto del Proyecto — MisGastos

## Origen y propósito

Aplicación de control de gastos personales creada para uso propio, accesible desde PC y celular. El objetivo principal es llevar un registro ordenado de ingresos y gastos, visualizar en qué se gasta el dinero y organizar un presupuesto mensual.

## Decisiones de diseño

### Moneda
- **COP (Pesos colombianos)** como moneda principal
- Formato `$ 1.250.000` usando `Intl.NumberFormat` con locale `es-CO`
- Sin soporte multimoneda por ahora (no es necesario)

### Tema visual
- **Modo oscuro por defecto** — estilo elegante, fondo `dark-950`
- Opción de cambiar a modo claro desde Ajustes (se guarda en `localStorage`)
- Paleta primaria: índigo/violeta (`primary-600` = `#4f46e5`)

### Autenticación
- JWT con expiración de **30 días** (para no pedir login frecuentemente desde el celular)
- Token guardado en `localStorage`
- Sin refresh tokens por simplicidad (la sesión dura 30 días)

### Base de datos
- **SQLite** con `better-sqlite3` — sin necesidad de base de datos externa
- El archivo `.db` vive en `server/data/expenses.db`
- Se crea automáticamente al iniciar el servidor por primera vez
- En producción (Render.com) el archivo persiste en disco mientras el servicio esté activo

### Categorías
Al registrarse, cada usuario recibe automáticamente **12 categorías predeterminadas**:

| Categoría       | Ícono | Color     |
|-----------------|-------|-----------|
| Alimentación    | 🍔    | Rojo      |
| Transporte      | 🚗    | Naranja   |
| Vivienda        | 🏠    | Amarillo  |
| Servicios       | 💡    | Verde     |
| Salud           | 🏥    | Cian      |
| Educación       | 📚    | Azul      |
| Entretenimiento | 🎮    | Violeta   |
| Ropa            | 👕    | Rosa      |
| Tecnología      | 💻    | Índigo    |
| Ahorro          | 🏦    | Verde azulado |
| Deudas          | 💳    | Rojo fuerte |
| Otros           | 📦    | Gris      |

### Presupuesto
- El presupuesto se configura **por categoría** con un límite mensual
- Las barras de progreso cambian de color: verde → amarillo (>70%) → rojo (>90% o excedido)
- El presupuesto es reutilizado cada mes (no se resetea, es un límite fijo)

### Ingresos
- **Salario mensual** fijo configurado en el perfil (se aplica a todos los meses)
- **Ingresos adicionales** registrados por fecha (freelance, bonos, etc.)
- El ingreso total del mes = salario mensual + suma de ingresos adicionales del mes

## Stack tecnológico

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS (dark mode via clase `dark` en `<html>`)
- Recharts para gráficas
- Lucide React para íconos
- React Router v6

### Backend
- Node.js + Express + TypeScript
- better-sqlite3 (SQLite síncrono, sin callbacks)
- bcryptjs para contraseñas
- jsonwebtoken para JWT
- En producción sirve el build del frontend como archivos estáticos

## Estructura de archivos

```
expense-tracker/
├── client/
│   ├── index.html
│   ├── vite.config.ts         # Proxy /api → localhost:3001 en dev
│   ├── tailwind.config.js
│   └── src/
│       ├── App.tsx            # Rutas y guards de autenticación
│       ├── main.tsx
│       ├── index.css          # Tailwind + scrollbar personalizado
│       ├── types/index.ts     # Interfaces TypeScript globales
│       ├── context/
│       │   ├── AuthContext.tsx   # Login, registro, perfil, JWT
│       │   ├── ThemeContext.tsx  # Tema oscuro/claro
│       │   └── api.ts           # Wrapper de fetch para todas las llamadas API
│       ├── components/
│       │   └── Layout.tsx        # Sidebar (PC) + nav inferior (móvil)
│       └── pages/
│           ├── Login.tsx         # Login y registro en una sola pantalla
│           ├── Dashboard.tsx     # Resumen del mes + torta de categorías
│           ├── Expenses.tsx      # CRUD de gastos, búsqueda, filtro por mes
│           ├── Income.tsx        # Ingresos adicionales + resumen salario
│           ├── Budget.tsx        # Presupuesto por categoría con barras
│           ├── Charts.tsx        # 4 gráficas interactivas
│           └── Settings.tsx      # Tema, nombre, salario mensual
├── server/
│   ├── .env                   # JWT_SECRET y PORT
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts           # Entry point, sirve frontend en producción
│       ├── db.ts              # Inicialización de SQLite y esquema de tablas
│       ├── auth.ts            # generateToken + authMiddleware
│       └── routes/
│           ├── auth.ts        # POST /register, POST /login, GET /me, PUT /profile
│           ├── expenses.ts    # CRUD + GET /summary (datos para dashboard/gráficas)
│           ├── categories.ts  # CRUD categorías
│           └── income.ts      # CRUD ingresos adicionales
└── package.json               # Scripts raíz con concurrently
```

## API Endpoints

| Método | Ruta                       | Descripción                            |
|--------|----------------------------|----------------------------------------|
| POST   | /api/auth/register         | Crear cuenta                           |
| POST   | /api/auth/login            | Iniciar sesión                         |
| GET    | /api/auth/me               | Obtener perfil propio                  |
| PUT    | /api/auth/profile          | Actualizar nombre / salario mensual    |
| GET    | /api/expenses              | Listar gastos (filtros: mes, año, cat) |
| GET    | /api/expenses/summary      | Datos agregados para dashboard         |
| POST   | /api/expenses              | Crear gasto                            |
| PUT    | /api/expenses/:id          | Editar gasto                           |
| DELETE | /api/expenses/:id          | Eliminar gasto                         |
| GET    | /api/categories            | Listar categorías del usuario          |
| POST   | /api/categories            | Crear categoría                        |
| PUT    | /api/categories/:id        | Editar categoría (incl. budget_limit)  |
| DELETE | /api/categories/:id        | Eliminar categoría                     |
| GET    | /api/income                | Listar ingresos adicionales            |
| POST   | /api/income                | Agregar ingreso adicional              |
| DELETE | /api/income/:id            | Eliminar ingreso adicional             |

## Despliegue en Render.com (gratis)

1. Subir el proyecto a un repositorio de GitHub
2. Crear cuenta en [render.com](https://render.com)
3. Nuevo **Web Service** → conectar el repositorio
4. Configurar:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variable**: `JWT_SECRET` = un string largo y aleatorio
5. Render asignará un dominio como `misgastos.onrender.com`

> **Nota**: El plan gratuito de Render suspende el servicio tras 15 minutos de inactividad. El primer acceso del día puede tardar ~30 segundos en despertar.

## Posibles mejoras futuras

- Exportar datos a CSV/Excel
- Notificaciones cuando se acerca el límite de presupuesto
- Modo offline con Service Workers
- Metas de ahorro
- Gráfica histórica comparando meses
- Categorías personalizadas con colores editables desde UI
