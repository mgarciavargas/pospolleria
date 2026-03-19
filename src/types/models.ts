// src/types/models.ts

export interface Usuario {
  id: string;
  nombre: string;
  pin: string;
  rol: 'MOZO' | 'ADMIN' | 'GERENTE';
  activo: boolean;
  created_at?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  created_at?: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria_id: string;
  activo: boolean;
  created_at?: string;
}

export interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: 'LIBRE' | 'OCUPADA' | 'POR_PAGAR';
  created_at?: string;
}

export interface ItemCarrito {
  id: string;
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas: string;
}

export interface Pedido {
  id: string;
  numero_pedido: string;
  mesa_id: string;
  mozo_id: string;
  total: number;
  estado: string;
  created_at?: string;
}
