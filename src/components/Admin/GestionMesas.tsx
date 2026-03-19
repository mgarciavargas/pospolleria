// src/components/Admin/GestionMesas.tsx
// Gestión de Mesas - CRUD Completo

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { FormularioMesa } from './FormularioMesa';

interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: string;
  created_at: string;
}

export function GestionMesas() {
  const [buscar, setBuscar] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mesaEditando, setMesaEditando] = useState<Mesa | undefined>();
  const [error, setError] = useState('');

  const { data: mesas, isLoading, refetch } = useQuery({
    queryKey: ['mesas'],
    queryFn: async () => {
      const { data, error: err } = await apiService.obtenerMesas();
      if (err) throw err;
      return (data || []) as Mesa[];
    },
    refetchInterval: 5000
  });

  const mesasFiltradas = (mesas || []).filter(m =>
    m.numero.toString().includes(buscar) ||
    m.estado.toLowerCase().includes(buscar.toLowerCase())
  );

  const handleNuevo = () => {
    setMesaEditando(undefined);
    setMostrarFormulario(true);
    setError('');
  };

  const handleEditar = (mesa: Mesa) => {
    setMesaEditando(mesa);
    setMostrarFormulario(true);
    setError('');
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setMesaEditando(undefined);
    setError('');
  };

  const handleGuardar = async (datos: {
    numero: number;
    capacidad: number;
    estado?: string;
  }) => {
    try {
      setError('');

      if (mesaEditando) {
        // Actualizar
        const { error: err } = await apiService.actualizarMesa(
          mesaEditando.id,
          datos
        );

        if (err) throw err;
        alert('✅ Mesa actualizada');
      } else {
        // Crear
        const { error: err } = await apiService.crearMesa(datos);

        if (err) throw err;
        alert('✅ Mesa creada');
      }

      refetch();
      handleCancelar();
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido';
      setError(mensaje);
      alert(`❌ Error: ${mensaje}`);
    }
  };

  const handleEliminar = async (id: string, numero: number) => {
    if (!confirm(`¿Eliminar mesa ${numero}?`)) return;

    try {
      const { error: err } = await apiService.eliminarMesa(id);

      if (err) throw err;
      refetch();
      alert('✅ Mesa eliminada');
    } catch (err) {
      alert('❌ Error al eliminar');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'LIBRE':
        return 'bg-green-100 text-green-800';
      case 'OCUPADA':
        return 'bg-red-100 text-red-800';
      case 'POR_PAGAR':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoEmoji = (estado: string) => {
    switch (estado) {
      case 'LIBRE':
        return '✅';
      case 'OCUPADA':
        return '🔴';
      case 'POR_PAGAR':
        return '⏳';
      default:
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">🍽️ Gestión de Mesas</h2>
        <button
          onClick={handleNuevo}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Nueva Mesa
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6 flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
        <Search className="w-5 h-5 text-gray-600" />
        <input
          type="text"
          placeholder="Buscar por número o estado..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          className="flex-1 bg-transparent outline-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tabla de Mesas */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        {mesasFiltradas.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-center font-bold">Mesa #</th>
                <th className="px-4 py-3 text-center font-bold">Capacidad</th>
                <th className="px-4 py-3 text-center font-bold">Estado</th>
                <th className="px-4 py-3 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mesasFiltradas.map(mesa => (
                <tr key={mesa.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-center">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold text-lg">
                      {mesa.numero}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold">
                    👥 {mesa.capacidad} personas
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getEstadoColor(mesa.estado)}`}>
                      {getEstadoEmoji(mesa.estado)} {mesa.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditar(mesa)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(mesa.id, mesa.numero)}
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
            <p>🍽️ {buscar ? 'No hay mesas que coincidan' : 'No hay mesas disponibles'}</p>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm">Total Mesas</p>
          <p className="font-bold text-2xl text-blue-600">{mesasFiltradas.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm">Libres</p>
          <p className="font-bold text-2xl text-green-600">
            {mesasFiltradas.filter(m => m.estado === 'LIBRE').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm">Ocupadas</p>
          <p className="font-bold text-2xl text-red-600">
            {mesasFiltradas.filter(m => m.estado === 'OCUPADA').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-gray-600 text-sm">Por Pagar</p>
          <p className="font-bold text-2xl text-yellow-600">
            {mesasFiltradas.filter(m => m.estado === 'POR_PAGAR').length}
          </p>
        </div>
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioMesa
          mesa={mesaEditando}
          onGuardar={handleGuardar}
          onCancelar={handleCancelar}
        />
      )}
    </div>
  );
}