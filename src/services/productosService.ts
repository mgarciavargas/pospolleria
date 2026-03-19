import { supabase } from './api';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria_id: string;
  activo: boolean;
  created_at: string;
}

export interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria_id: string;
  activo: boolean;
}

class ProductosService {
  /**
   * Obtener todos los productos
   */
  async obtenerTodos(): Promise<Producto[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  /**
   * Obtener productos activos (para cliente)
   */
  async obtenerActivos(): Promise<Producto[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  /**
   * Obtener productos por categoría
   */
  async obtenerPorCategoria(categoriaId: string): Promise<Producto[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('categoria_id', categoriaId)
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  /**
   * Obtener un producto por ID
   */
  async obtenerPorId(id: string): Promise<Producto | null> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  /**
   * Crear nuevo producto
   */
  async crear(producto: ProductoFormData): Promise<Producto> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([producto])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  /**
   * Actualizar producto
   */
  async actualizar(id: string, producto: Partial<ProductoFormData>): Promise<Producto> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(producto)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  /**
   * Eliminar producto (soft delete)
   */
  async eliminar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  /**
   * Reactivar producto
   */
  async reactivar(id: string): Promise<Producto> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update({ activo: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  /**
   * Buscar productos por nombre o descripción
   */
  async buscar(termino: string): Promise<Producto[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .or(`nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }
}

export const productosService = new ProductosService();
