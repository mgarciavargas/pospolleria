# 🍗 Pollería El YAMI CHICKEN  - Sistema POS Completo

Sistema híbrido (Web + Android) para gestión de pedidos en restaurante.

## 🚀 INSTALACIÓN RÁPIDA

```bash
# 1. Instalar dependencias
npm install

# 2. Crear cuenta en Supabase (https://supabase.com)
# Copiar las credenciales en .env.local

# 3. Ejecutar en desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:5173
```

## 📱 USUARIOS DE PRUEBA

| PIN  | Nombre | Rol   | Acceso |
|------|--------|-------|--------|
| 1111 | Carlos | MOZO  | /salon |
| 2222 | Juan   | MOZO  | /salon |
| 0000 | Admin  | ADMIN | /admin |
| 3333 | Gerente| GERENTE | /admin |

## 📋 FLUJO BÁSICO

1. **Login**: Ingresa PIN de 4 dígitos
2. **Salón**: Selecciona una mesa
3. **Comanda**: Toma el pedido
4. **Enviar**: El pedido se sincroniza automáticamente

## 🔌 CONFIGURAR BASE DE DATOS

En Supabase, ejecuta el SQL que está en `docs/schema.sql`

```bash
# Copiar el contenido de docs/schema.sql
# Ir a Supabase → SQL Editor
# Pegar y ejecutar
```

## 📱 BUILD PARA ANDROID

```bash
# Build web
npm run build

# Agregar Capacitor
npx cap add android

# Sincronizar
npx cap sync

# Abrir en Android Studio
npx cap open android
```

## 📚 DOCUMENTACIÓN

- `docs/MANUAL.md` - Manual completo
- `docs/API.md` - Documentación de servicios
- `docs/schema.sql` - Schema de BD

## 🛠️ TECNOLOGÍAS

- React 18 + TypeScript
- Supabase (PostgreSQL)
- Tailwind CSS
- Capacitor (Android)
- TanStack Query (Caché)
- Zustand (Estado global)

## 📞 SOPORTE

Revisa `docs/TROUBLESHOOTING.md` para problemas comunes.
