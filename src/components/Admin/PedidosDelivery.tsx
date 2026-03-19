import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Phone, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Pedido {
  id: string;
  numero_pedido: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_direccion: string;
  hora_entrega: string;
  total: number;
  estado: string;
  created_at: string;
}

export function PedidosDelivery() {
  const [filtroEstado, setFiltroEstado] = useState('ABIERTO');

  const { data: pedidos, isLoading, refetch } = useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const { data, error: err } = await apiService.obtenerDeliverys();
      if (err) throw err;
      return (data || []) as Pedido[];
    },
    refetchInterval: 5000
  });

  const pedidosFiltrados = (pedidos || []).filter(p => 
    filtroEstado === 'TODOS' ? true : p.estado === filtroEstado
  );

  const handleMarcarEntregado = async (id: string) => {
    try {
      const { error: err } = await apiService.actualizarEstadoDelivery(id, 'ENTREGADO');
      if (err) throw err;
      refetch();
      alert('✅ Pedido marcado como entregado');
    } catch (err) {
      alert('❌ Error al actualizar estado');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ABIERTO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'EN_PREPARACION':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'LISTO':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ENTREGADO':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoEmoji = (estado: string) => {
    switch (estado) {
      case 'ABIERTO':
        return '📋';
      case 'EN_PREPARACION':
        return '👨‍🍳';
      case 'LISTO':
        return '📦';
      case 'ENTREGADO':
        return '✅';
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
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">🛵 Gestión de Deliveries</h2>
        <p className="text-gray-600">Administra los pedidos para entrega a domicilio</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['TODOS', 'ABIERTO', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'].map(estado => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              filtroEstado === estado
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {estado === 'TODOS' && '📊 Todos'}
            {estado === 'ABIERTO' && '📋 Abiertos'}
            {estado === 'EN_PREPARACION' && '👨‍🍳 Preparando'}
            {estado === 'LISTO' && '📦 Listos'}
            {estado === 'ENTREGADO' && '✅ Entregados'}
          </button>
        ))}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
          <p className="text-xs text-blue-600 font-bold">Abiertos</p>
          <p className="text-2xl font-bold text-blue-700">
            {pedidos?.filter(p => p.estado === 'ABIERTO').length || 0}
          </p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg text-center border border-orange-200">
          <p className="text-xs text-orange-600 font-bold">Preparando</p>
          <p className="text-2xl font-bold text-orange-700">
            {pedidos?.filter(p => p.estado === 'EN_PREPARACION').length || 0}
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
          <p className="text-xs text-green-600 font-bold">Listos</p>
          <p className="text-2xl font-bold text-green-700">
            {pedidos?.filter(p => p.estado === 'LISTO').length || 0}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
          <p className="text-xs text-gray-600 font-bold">Entregados</p>
          <p className="text-2xl font-bold text-gray-700">
            {pedidos?.filter(p => p.estado === 'ENTREGADO').length || 0}
          </p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-200">
          <p className="text-xs text-purple-600 font-bold">Total</p>
          <p className="text-2xl font-bold text-purple-700">
            {pedidos?.length || 0}
          </p>
        </div>
      </div>

      {/* Lista de Deliveries */}
      <div className="space-y-4">
        {pedidosFiltrados.length > 0 ? (
          pedidosFiltrados.map(pedido => (
            <div
              key={pedido.id}
              className={`border-2 rounded-lg p-4 transition hover:shadow-lg ${getEstadoColor(pedido.estado)}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Datos del Cliente */}
                <div>
                  <p className="font-bold text-lg mb-2">
                    {getEstadoEmoji(pedido.estado)} {pedido.cliente_nombre}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {pedido.cliente_telefono}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {pedido.cliente_direccion}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {pedido.hora_entrega}
                    </p>
                  </div>
                </div>

                {/* Información del Pedido */}
                <div>
                  <p className="text-sm text-gray-600">Pedido #{pedido.numero_pedido}</p>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    S/ {pedido.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(pedido.created_at).toLocaleString('es-PE')}
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <select
                  value={pedido.estado}
                  onChange={async (e) => {
                    const { error: err } = await apiService.actualizarEstadoDelivery(pedido.id, e.target.value);
                    if (!err) {
                      refetch();
                    }
                  }}
                  className="flex-1 border rounded px-3 py-2 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-600">
                  <option value="ABIERTO">📋 Abierto</option>
                  <option value="EN_PREPARACION">👨‍🍳 En Preparación</option>
                  <option value="LISTO">📦 Listo</option>
                  <option value="ENTREGADO">✅ Entregado</option>
                </select>

                {pedido.estado !== 'ENTREGADO' && (
                  <button
                    onClick={() => handleMarcarEntregado(pedido.id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Entregado
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay pedidos {filtroEstado.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
