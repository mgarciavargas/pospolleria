// src/components/Admin/GestionProductos.tsx

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, RotateCw, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useCategorias } from '@/hooks/useCategorias';


interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria_id: string;
  activo: boolean;
  created_at: string;
}

interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria_id: string;
  activo: boolean;
}

export function GestionProductos() {
  const [buscar, setBuscar] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const { data: categorias } = useCategorias();

  const { data: productos, isLoading, refetch } = useQuery({
    queryKey: ['productos-admin'],
    queryFn: async () => {
      const { data, error: err } = await apiService.obtenerTodosLosProductos();
      if (err) throw err;
      return (data || []) as Producto[];
    }
  });

  const productosFiltrados = (productos || [])
    .filter(p => mostrarInactivos ? true : p.activo)
    .filter(p =>
      p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(buscar.toLowerCase())
    );

  const getNombreCategoria = (categoriaId: string) => {
    return categorias?.find(c => c.id === categoriaId)?.nombre || 'Sin categoría';
  };

  const handleNuevo = () => {
    setProductoEditando(null);
    setMostrarFormulario(true);
    setError('');
  };

  const handleEditar = (producto: Producto) => {
    setProductoEditando(producto);
    setMostrarFormulario(true);
    setError('');
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setProductoEditando(null);
    setError('');
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const datos: ProductoFormData = {
      nombre: formData.get('nombre') as string,
      descripcion: formData.get('descripcion') as string,
      precio: parseFloat(formData.get('precio') as string),
      categoria_id: formData.get('categoria_id') as string,
      activo: formData.get('activo') === 'on'
    };

    // Validaciones
    if (!datos.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (datos.precio <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    if (!datos.categoria_id) {
      setError('Selecciona una categoría');
      return;
    }

    try {
      setGuardando(true);
      setError('');

      if (productoEditando) {
        // Actualizar
        const { error: err } = await apiService.actualizarProducto(
          productoEditando.id,
          datos
        );

        if (err) throw err;
        alert('✅ Producto actualizado');
      } else {
        // Crear
        const { error: err } = await apiService.crearProducto(datos);

        if (err) throw err;
        alert('✅ Producto creado');
      }

      refetch();
      handleCancelar();
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido';
      setError(mensaje);
      alert(`❌ Error: ${mensaje}`);
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActivo = async (producto: Producto) => {
    try {
      const { error: err } = await apiService.actualizarProducto(producto.id, {
        activo: !producto.activo
      });

      if (err) throw err;
      refetch();
      alert('✅ Producto actualizado');
    } catch (err) {
      alert('❌ Error al actualizar');
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar producto "${nombre}"?`)) return;

    try {
      const { error: err } = await apiService.eliminarProducto(id);

      if (err) throw err;
      refetch();
      alert('✅ Producto eliminado');
    } catch (err) {
      alert('❌ Error al eliminar');
    }
  };

  const handleReactivar = async (id: string, nombre: string) => {
    try {
      const { error: err } = await apiService.reactivarProducto(id);

      if (err) throw err;
      refetch();
      alert(`✅ "${nombre}" reactivado`);
    } catch (err) {
      alert('❌ Error al reactivar');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">📦 Gestión de Productos</h2>
        <button
          onClick={handleNuevo}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6 flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
        <Search className="w-5 h-5 text-gray-600" />
        <input
          type="text"
          placeholder="Buscar producto por nombre o descripción..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          className="flex-1 bg-transparent outline-none"
        />
      </div>

      {/* Filtro inactivos */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="mostrarInactivos"
          checked={mostrarInactivos}
          onChange={e => setMostrarInactivos(e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <label htmlFor="mostrarInactivos" className="text-sm text-gray-600">
          Mostrar productos inactivos
        </label>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">
            {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded mb-4 flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleGuardar} className="space-y-3">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-bold mb-1">Nombre *</label>
              <input
                type="text"
                name="nombre"
                defaultValue={productoEditando?.nombre}
                placeholder="Ej: Pollo a la Brasa"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                disabled={guardando}
                maxLength={150}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-bold mb-1">Descripción</label>
              <textarea
                name="descripcion"
                defaultValue={productoEditando?.descripcion}
                placeholder="Ej: Pollo jugoso asado a fuego de carbón"
                className="w-full border rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
                rows={3}
                disabled={guardando}
                maxLength={500}
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-bold mb-1">Categoría *</label>
              <select
                name="categoria_id"
                defaultValue={productoEditando?.categoria_id || ''}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                disabled={guardando}
              >
                <option value="">-- Selecciona categoría --</option>
                {categorias?.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-bold mb-1">Precio (S/) *</label>
              <input
                type="number"
                name="precio"
                defaultValue={productoEditando?.precio || 0}
                placeholder="0.00"
                step={0.01}
                min={0}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                disabled={guardando}
              />
            </div>

            {/* Activo */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="activo"
                defaultChecked={productoEditando?.activo ?? true}
                className="w-4 h-4 rounded"
                disabled={guardando}
              />
              <label className="text-sm font-bold">Producto activo</label>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelar}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded disabled:opacity-50"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded disabled:opacity-50"
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Productos */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        {productosFiltrados.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Nombre</th>
                <th className="px-4 py-3 text-left font-bold">Descripción</th>
                <th className="px-4 py-3 text-left font-bold">Categoría</th>
                <th className="px-4 py-3 text-right font-bold">Precio</th>
                <th className="px-4 py-3 text-center font-bold">Estado</th>
                <th className="px-4 py-3 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(producto => (
                <tr key={producto.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">{producto.nombre}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {producto.descripcion || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                      {getNombreCategoria(producto.categoria_id)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    S/ {producto.precio.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActivo(producto)}
                      className={`px-3 py-1 rounded-lg text-white font-bold text-xs transition ${
                        producto.activo
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {producto.activo ? '✓ Activo' : '✕ Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {producto.activo ? (
                        <>
                          <button
                            onClick={() => handleEditar(producto)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminar(producto.id, producto.nombre)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReactivar(producto.id, producto.nombre)}
                          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition"
                          title="Reactivar"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p>📦 {buscar ? 'No hay productos que coincidan' : 'No hay productos disponibles'}</p>
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="mt-6 text-sm text-gray-600">
        <p>Total de productos: <strong>{productosFiltrados.length}</strong></p>
        {mostrarInactivos && productos && productos.filter(p => !p.activo).length > 0 && (
          <p>Activos: <strong>{productos.filter(p => p.activo).length}</strong> | Inactivos: <strong>{productos.filter(p => !p.activo).length}</strong></p>
        )}
      </div>
    </div>
  );
}