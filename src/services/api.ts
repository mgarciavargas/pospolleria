// src/services/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchData(query: any) {
  try {
    const { data, error } = await query;
    if (error) {
      console.error('🔴 Error Supabase:', error); // ← AGREGA ESTO
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('🔴 Error completo:', error); // ← AGREGA ESTO
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Error desconocido')
    };
  }
}
export const apiService = {
  // ============== USUARIOS - LOGIN ==============
  async obtenerUsuario(pin: string) {
    return fetchData(
      supabase
        .from('usuarios')
        .select('*')
        .eq('pin', pin)
        .single()
    );
  },

  // ============== USUARIOS - CRUD (ADMIN) ==============
  async obtenerTodosLosUsuarios() {
    return fetchData(
      supabase
        .from('usuarios')
        .select('*')
        .order('nombre')
    );
  },

  async obtenerUsuarioPorId(id: string) {
    return fetchData(
      supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single()
    );
  },

  async crearUsuario(usuario: {
    nombre: string;
    pin: string;
    rol: 'MOZO' | 'ADMIN' | 'GERENTE' | 'COCINERO';
    activo: boolean;
  }) {
    return fetchData(
      supabase
        .from('usuarios')
        .insert([usuario])
        .select()
        .single()
    );
  },

  async actualizarUsuario(
    id: string,
    usuario: {
      nombre?: string;
      pin?: string;
      rol?: 'MOZO' | 'ADMIN' | 'GERENTE' | 'COCINERO';
      activo?: boolean;
    }
  ) {
    return fetchData(
      supabase
        .from('usuarios')
        .update(usuario)
        .eq('id', id)
        .select()
        .single()
    );
  },

  async eliminarUsuario(id: string) {
    return fetchData(
      supabase
        .from('usuarios')
        .delete()
        .eq('id', id)
    );
  },

  // ============== CATEGORÍAS ==============
  async obtenerCategorias() {
    return fetchData(
      supabase
        .from('categorias')
        .select('*')
        .order('orden')
    );
  },

  // ============== PRODUCTOS - LECTURA ==============
  async obtenerProductos(categoriaId?: string) {
    let query = supabase
      .from('productos')
      .select('*')
      .eq('activo', true);
    
    if (categoriaId) {
      query = query.eq('categoria_id', categoriaId);
    }
    
    return fetchData(query.order('nombre'));
  },

  // ============== PRODUCTOS - CRUD (ADMIN) ==============
  async obtenerTodosLosProductos() {
    return fetchData(
      supabase
        .from('productos')
        .select('*')
        .order('nombre')
    );
  },

  async obtenerProductoPorId(id: string) {
    return fetchData(
      supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single()
    );
  },

  async crearProducto(producto: {
    nombre: string;
    descripcion: string;
    precio: number;
    categoria_id: string;
    activo: boolean;
  }) {
    return fetchData(
      supabase
        .from('productos')
        .insert([producto])
        .select()
        .single()
    );
  },

  async actualizarProducto(
    id: string,
    producto: {
      nombre?: string;
      descripcion?: string;
      precio?: number;
      categoria_id?: string;
      activo?: boolean;
    }
  ) {
    return fetchData(
      supabase
        .from('productos')
        .update(producto)
        .eq('id', id)
        .select()
        .single()
    );
  },

  async eliminarProducto(id: string) {
    // Soft delete - marcar como inactivo
    return fetchData(
      supabase
        .from('productos')
        .update({ activo: false })
        .eq('id', id)
    );
  },

  async reactivarProducto(id: string) {
    return fetchData(
      supabase
        .from('productos')
        .update({ activo: true })
        .eq('id', id)
        .select()
        .single()
    );
  },

  async buscarProductos(termino: string) {
    return fetchData(
      supabase
        .from('productos')
        .select('*')
        .or(`nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
        .order('nombre')
    );
  },

  // ============== MESAS - CRUD ==============
  async obtenerMesas() {
    return fetchData(
      supabase
        .from('mesas')
        .select('*')
        .order('numero')
    );
  },

  async obtenerMesaPorId(id: string) {
    return fetchData(
      supabase
        .from('mesas')
        .select('*')
        .eq('id', id)
        .single()
    );
  },

  async crearMesa(mesa: {
    numero: number;
    capacidad: number;
    estado?: string;
  }) {
    return fetchData(
      supabase
        .from('mesas')
        .insert([{ ...mesa, estado: mesa.estado || 'LIBRE' }])
        .select()
        .single()
    );
  },

  async actualizarMesa(
    id: string,
    mesa: {
      numero?: number;
      capacidad?: number;
      estado?: string;
    }
  ) {
    return fetchData(
      supabase
        .from('mesas')
        .update(mesa)
        .eq('id', id)
        .select()
        .single()
    );
  },

  async eliminarMesa(id: string) {
    return fetchData(
      supabase
        .from('mesas')
        .delete()
        .eq('id', id)
    );
  },

  async actualizarEstadoMesa(mesaId: string, estado: string) {
    return fetchData(
      supabase
        .from('mesas')
        .update({ estado })
        .eq('id', mesaId)
    );
  },

  // ============== PEDIDOS ==============
  async crearPedido(pedido: any) {
    return fetchData(
      supabase
        .from('pedidos')
        .insert(pedido)
        .select()
        .single()
    );
  },

  async obtenerPedidosMesa(mesaId: string) {
    return fetchData(
      supabase
        .from('pedidos')
        .select('*')
        .eq('mesa_id', mesaId)
        .neq('estado', 'PAGADO')
        .order('created_at', { ascending: false })
    );
  },

  // ============== DELIVERY ==============
 async crearDelivery(delivery: {
  numero_pedido: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_direccion: string;
  hora_entrega: string;
  mozo_id: string;
  total: number;
  estado: string;
}) {
  return fetchData(
    supabase
      .from('pedidos')
      .insert([{
        numero_pedido: delivery.numero_pedido,
        mesa_id: '258ce788-7de8-481a-b5e1-e6212a5a5c89', // ← UUID dummy
        mozo_id: delivery.mozo_id,
        lineas: [], // ← Array vacío
        subtotal: delivery.total,
        igv: 0,
        total: delivery.total,
        cliente_nombre: delivery.cliente_nombre,
        cliente_telefono: delivery.cliente_telefono,
        cliente_direccion: delivery.cliente_direccion,
        hora_entrega: delivery.hora_entrega,
        estado: delivery.estado,
        tipo: 'DELIVERY',
        sync_pending: false
      }])
      .select()
      .single()
  );
},

  async obtenerDeliverys() {
    return fetchData(
      supabase
        .from('pedidos')
        .select('*')
        .eq('tipo', 'DELIVERY')
        .order('created_at', { ascending: false })
    );
  },

  async actualizarEstadoDelivery(pedidoId: string, estado: string) {
    return fetchData(
      supabase
        .from('pedidos')
        .update({ estado })
        .eq('id', pedidoId)
    );
  }

};