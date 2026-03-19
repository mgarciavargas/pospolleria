// src/components/Admin/GestionMozos.tsx
// Gestión de Mozos - COMPLETO CON CRUD

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { FormularioMozo } from './FormularioMozo';

interface Usuario {
  id: string;
  nombre: string;
  pin: string;
  rol: 'MOZO' | 'ADMIN' | 'GERENTE' | 'COCINERO';
  activo: boolean;
  created_at: string;
}

export function GestionMozos() {
  const [buscar, setBuscar] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | undefined>(); 
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const { data: usuarios, isLoading, refetch } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error: err } = await apiService.obtenerTodosLosUsuarios();
      if (err) throw err;
      return (data || []) as Usuario[];
    }
  });

  const usuariosFiltrados = (usuarios || []).filter(u =>
    u.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    u.pin.includes(buscar)
  );

  const handleNuevo = () => {
    setUsuarioEditando(undefined);
    setMostrarFormulario(true);
    setError('');
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setMostrarFormulario(true);
    setError('');
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setUsuarioEditando(undefined);
    setError('');
  };

  const handleGuardar = async (datos: {
    nombre: string;
    pin: string;
    rol: 'MOZO' | 'ADMIN' | 'GERENTE' | 'COCINERO';
    activo: boolean;
  }) => {
    try {
      setGuardando(true);
      setError('');

      if (usuarioEditando) {
        // Actualizar
        const { error: err } = await apiService.actualizarUsuario(
          usuarioEditando.id,
          datos
        );

        if (err) throw err;
        alert('✅ Mozo actualizado');
      } else {
        // Crear
        const { error: err } = await apiService.crearUsuario(datos);

        if (err) throw err;
        alert('✅ Mozo creado');
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

  const handleToggleActivo = async (usuario: Usuario) => {
    try {
      const { error: err } = await apiService.actualizarUsuario(usuario.id, {
        activo: !usuario.activo
      });

      if (err) throw err;
      refetch();
      alert('✅ Mozo actualizado');
    } catch (err) {
      alert('❌ Error al actualizar');
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar mozo "${nombre}"?`)) return;

    try {
      const { error: err } = await apiService.eliminarUsuario(id);

      if (err) throw err;
      refetch();
      alert('✅ Mozo eliminado');
    } catch (err) {
      alert('❌ Error al eliminar');
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MOZO':
        return 'bg-blue-100 text-blue-800';
      case 'COCINERO':
        return 'bg-orange-100 text-orange-800';
      case 'GERENTE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">👥 Gestión de Mozos</h2>
        <button
          onClick={handleNuevo}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Mozo
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6 flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
        <Search className="w-5 h-5 text-gray-600" />
        <input
          type="text"
          placeholder="Buscar por nombre o PIN..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          className="flex-1 bg-transparent outline-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        {usuariosFiltrados.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Nombre</th>
                <th className="px-4 py-3 text-left font-bold">PIN</th>
                <th className="px-4 py-3 text-left font-bold">Rol</th>
                <th className="px-4 py-3 text-center font-bold">Estado</th>
                <th className="px-4 py-3 text-left font-bold">Desde</th>
                <th className="px-4 py-3 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">{usuario.nombre}</td>
                  <td className="px-4 py-3 font-mono text-sm bg-gray-50 rounded">
                    {usuario.pin}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getRolColor(usuario.rol)}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActivo(usuario)}
                      className={`px-3 py-1 rounded-lg text-white font-bold text-xs transition ${
                        usuario.activo
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {usuario.activo ? '✓ Activo' : '✕ Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(usuario.created_at).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditar(usuario)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(usuario.id, usuario.nombre)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p>👥 {buscar ? 'No hay mozos que coincidan' : 'No hay mozos registrados'}</p>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Total Mozos</p>
          <p className="font-bold text-lg">{usuariosFiltrados.length}</p>
        </div>
        <div>
          <p className="text-gray-600">Activos</p>
          <p className="font-bold text-lg text-green-600">
            {usuariosFiltrados.filter(u => u.activo).length}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Inactivos</p>
          <p className="font-bold text-lg text-red-600">
            {usuariosFiltrados.filter(u => !u.activo).length}
          </p>
        </div>
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioMozo
          usuario={usuarioEditando}
          onGuardar={handleGuardar}
          onCancelar={handleCancelar}
          cargando={guardando}
        />
      )}
    </div>
  );
}