# 📚 Manual de Uso - Pollería El Carboncito

## 🚀 INICIO RÁPIDO

### 1. Instalar y ejecutar

```bash
npm install
npm run dev
```

Abre http://localhost:5173

### 2. Configurar Supabase

1. Crear cuenta en https://supabase.com
2. Crear nuevo proyecto
3. Copiar URL y ANON KEY
4. Crear `.env.local`:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Crear base de datos

En Supabase Dashboard → SQL Editor:
1. Crear nueva query
2. Copiar contenido de `docs/schema.sql`
3. Ejecutar

## 👥 USUARIOS DE PRUEBA

| PIN  | Nombre    | Rol    |
|------|-----------|--------|
| 1111 | Carlos    | MOZO   |
| 2222 | Juan      | MOZO   |
| 0000 | Roberto   | ADMIN  |
| 3333 | María     | GERENTE|

## 📱 FLUJO DE USO

### Para Mozos:

1. **Login**: Ingresa tu PIN (1111)
2. **Salón**: Ves todas las mesas
3. **Seleccionar Mesa**: Click en una mesa libre
4. **Tomar Pedido**:
   - Selecciona categoría
   - Elige productos
   - Especifica cantidad y notas
   - Agrega al carrito
5. **Enviar a Cocina**: Click en botón verde
6. **Mesa se marca como OCUPADA**

### Para Admin:

1. **Login**: Ingresa PIN 0000
2. **Panel Admin**: Acceso a:
   - Gestión de Productos
   - Gestión de Mozos
   - Reportes
   - Configuración

## 🔧 CARACTERÍSTICAS

### ✅ Implementadas
- Login con PIN
- Toma de pedidos
- Carrito con cálculo automático
- Sincronización offline (LocalStorage)
- Interfaz responsive (mobile-first)
- Estados de mesa (LIBRE, OCUPADA, POR_PAGAR)
- Admin panel básico

### 🔄 En LocalStorage (Offline)
Los pedidos se guardan automáticamente en el navegador si no hay conexión, y se sincronizan cuando la conexión vuelva.

## 🖨️ IMPRESIÓN TÉRMICA (Preparado para)

El código está listo para impresoras Bluetooth:
- Generador ESC/POS incluido
- Función `crearTicketCocina()` en `src/services/print.ts`
- Función `crearTicketCuenta()` en `src/services/print.ts`

Solo requiere instalar plugin Cordova Bluetooth.

## 📊 ESTRUCTURA DE CARPETAS

```
src/
├── components/       # Componentes React
│   ├── Auth/        # Login
│   ├── Salon/       # Mesas
│   ├── Comanda/     # Toma de pedido
│   └── Admin/       # Panel admin
├── services/        # Lógica de BD y utilidades
├── hooks/           # Hooks personalizados
├── store/           # Estado global (Zustand)
├── types/           # Tipos TypeScript
└── App.tsx          # Enrutamiento principal
```

## 🐛 TROUBLESHOOTING

### Conexión a Supabase rechazada
- Verificar `.env.local`
- Verificar credenciales en Supabase
- Verificar que la BD esté creada

### Componente no renderiza
- Verificar imports
- Ver consola (F12)
- Revisar nombres de archivos

### Carrito no suma
- Verificar que el store está actualizado
- Revisar console.log() en handleAgregar

### PIN no funciona
- Verificar que usuarios existen en BD
- Verificar PIN es string de 4 dígitos
- Verificar que `usuarios` tabla existe

## 📈 PRÓXIMAS MEJORAS

- [ ] CRUD completo de productos
- [ ] Reportes avanzados
- [ ] Bluetooth para impresora
- [ ] Integración con caja
- [ ] Descuentos y promociones
- [ ] Historial de pedidos
- [ ] Gráficos de ventas
- [ ] PWA (funcionar offline)

## 🤝 SOPORTE

Revisa los archivos en `docs/` para más ayuda.

---

**Versión**: 1.0.0  
**Última actualización**: 2024
