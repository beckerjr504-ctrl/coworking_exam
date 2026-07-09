# Nido Coworking

Sistema de coworking para el examen de Seminario de Software II.

## Qué es este proyecto

Es una aplicación fullstack para buscar y reservar espacios de coworking.
Incluye:

- Registro e inicio de sesión con JWT
- Página de exploración de espacios
- Detalle de espacio con reservas
- Mis reservas con estado y cancelación
- Favoritos y notificaciones
- Backend en NestJS + Prisma + PostgreSQL
- Frontend en Next.js 15 + Tailwind CSS + TypeScript

## Tecnologías usadas

- Backend: NestJS, Prisma, PostgreSQL, Passport JWT
- Frontend: Next.js 15 (App Router), React, Tailwind CSS, Axios
- Base de datos: Supabase / PostgreSQL en producción
- Despliegue: Render (backend) y Vercel (frontend)

## Cómo correr el backend localmente

1. Instala dependencias en la raíz del repo:

```bash
npm install
```

2. Crea un archivo `.env` en la raíz con las variables de entorno:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu_clave_secreta"
JWT_EXPIRES_IN="1d"
```

3. Ejecuta el backend en modo desarrollo:

```bash
npm run start:dev
```

4. El backend estará disponible en:

```bash
http://localhost:3000
```

## Cómo correr el frontend localmente

1. Entra a la carpeta `frontend`:

```bash
cd frontend
```

2. Instala dependencias:

```bash
npm install
```

3. Crea un archivo `frontend/.env.local` con la URL del backend local:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Ejecuta el frontend en modo desarrollo:

```bash
npm run dev
```

5. El frontend estará disponible en:

```bash
http://localhost:3001
```

## Despliegue

- Backend desplegado en Render como servicio Node/NestJS.
- Frontend desplegado en Vercel como proyecto Next.js.
- En Vercel configura `NEXT_PUBLIC_API_URL` con la URL pública del backend en Render.
- En Render configura `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ALLOWED_ORIGINS` y `PORT`.

## Link de despliegue

Frontend en Vercel: `https://<tu-proyecto>.vercel.app`

> Reemplaza con la URL real de tu despliegue.

## Comandos Git finales

```bash
git add .
git commit -m "Final commit: coworking exam app complete"
git push origin main
```

> Si tu rama principal no es `main`, usa la rama correcta en el push.
