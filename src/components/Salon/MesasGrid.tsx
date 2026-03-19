// src/components/Salon/MesasGrid.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMesas } from '@/hooks/index';
import { useAuthStore } from '@/store/index';
import { Users, LogOut, Truck } from 'lucide-react';
import { FormularioDelivery } from './FormularioDelivery';
import { apiService } from '@/services/api';

export function MesasGrid() {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const usuario = useAuthStore(state => state.usuario);
  const { data: mesas, isLoading, error } = useMesas();
  const [mostrarFormDelivery, setMostrarFormDelivery] = useState(false);

  const handleMesaClick = (mesa: any) => {
    if (mesa.estado === 'LIBRE') {
      navigate(`/comanda/${mesa.id}`);
    } else if (mesa.estado === 'OCUPADA' || mesa.estado === 'POR_PAGAR') {
      navigate(`/cuenta/${mesa.id}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeliveryGuardar = async (datos: {
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_direccion: string;
    hora_entrega: string;
  }) => {
    try {
      const numero_pedido = `DLV-${Date.now()}`;
       
      console.log('📋 Creando delivery:', numero_pedido); // ← AGREGA ESTO

      const { error: err } = await apiService.crearDelivery({
        numero_pedido,
        cliente_nombre: datos.cliente_nombre,
        cliente_telefono: datos.cliente_telefono,
        cliente_direccion: datos.cliente_direccion,
        hora_entrega: datos.hora_entrega,
        mozo_id: usuario?.id || '',
        total: 0,
        estado: 'ABIERTO'
      });

      console.log('🔍 Resultado:', { error: err }); //

      if (err) throw err;
      
      alert('✅ Delivery creado. Procede a tomar el pedido.');
      setMostrarFormDelivery(false);
      navigate(`/comanda-delivery?numero=${numero_pedido}`);

    } catch (err) {
      console.error('❌ Error completo:', err); // 
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const getEstadoEmoji = (estado: string) => {
    switch (estado) {
      case 'LIBRE':
        return '✅';
      case 'OCUPADA':
        return '🍽️';
      case 'POR_PAGAR':
        return '💳';
      default:
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <style>{`
        .hexagon {
          width: 120px;
          height: 140px;
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          transition: transform 0.3s ease;
        }
        
        @media (min-width: 768px) {
          .hexagon {
            width: 140px;
            height: 160px;
          }
        }

        .hexagon:hover {
          transform: scale(1.1);
        }

        .hexagon::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: inherit;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          z-index: -1;
        }

        .hexagon-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          z-index: 1;
          color: white;
          font-weight: bold;
        }

        .hexagon-numero {
          font-size: 2rem;
        }

        .hexagon-capacidad {
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .hexagon-emoji {
          font-size: 1rem;
        }
      `}</style>

      <div className="bg-red-600 text-white p-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold">🍗 Salón</h1>
          <p className="text-sm text-red-100">Mozo: {usuario?.nombre}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-700 hover:bg-red-800 p-2 rounded-lg transition"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            Error al cargar mesas
          </div>
        )}

        {/* Botón DELIVERY */}
        <div className="mb-8">
          <button
            onClick={() => setMostrarFormDelivery(true)}
            className="w-full md:w-64 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition transform hover:scale-105"
          >
            <Truck className="w-7 h-7" />
            <div className="text-left">
              <p className="text-lg">🛵 Nuevo Delivery</p>
              <p className="text-xs opacity-90">Tomar pedido para entrega</p>
            </div>
          </button>
        </div>

        {/* Grid de Mesas Circulares - 3 Columnas */}
        <div className="grid grid-cols-3 gap-6 md:gap-8 mb-8 place-items-center">
          {mesas?.map((mesa: any) => (
            <button
              key={mesa.id}
              onClick={() => handleMesaClick(mesa)}
              className={`w-28 h-28 rounded-full font-bold transition transform hover:scale-110 shadow-lg flex flex-col items-center justify-center gap-2 ${
                mesa.estado === 'LIBRE'
                  ? 'bg-green-500 hover:bg-green-600 text-white hover:shadow-2xl'
                  : mesa.estado === 'OCUPADA'
                  ? 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-2xl'
                  : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-2xl'
              }`}
              title={`Mesa ${mesa.numero} - ${mesa.capacidad} personas - ${mesa.estado}`}
            >
              {/* Número de Mesa Grande */}
              <span className="text-4xl font-bold">{mesa.numero}</span>

              {/* Capacidad */}
              <span className="text-sm flex items-center gap-1">
                <Users className="w-4 h-4" /> {mesa.capacidad}
              </span>

              {/* Emoji de Estado */}
              <span className="text-2xl">{getEstadoEmoji(mesa.estado)}</span>
            </button>
          ))}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-lg border-2 border-green-500">
            <p className="text-green-700 font-bold text-sm">✅ Libres</p>
            <p className="text-3xl font-bold text-green-600">
              {mesas?.filter((m: any) => m.estado === 'LIBRE').length}
            </p>
          </div>
          <div className="bg-orange-100 p-4 rounded-lg border-2 border-orange-500">
            <p className="text-orange-700 font-bold text-sm">🍽️ Ocupadas</p>
            <p className="text-3xl font-bold text-orange-600">
              {mesas?.filter((m: any) => m.estado === 'OCUPADA').length}
            </p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg border-2 border-red-500">
            <p className="text-red-700 font-bold text-sm">💳 Por Pagar</p>
            <p className="text-3xl font-bold text-red-600">
              {mesas?.filter((m: any) => m.estado === 'POR_PAGAR').length}
            </p>
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-8 bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-700 font-bold mb-2">📌 Leyenda:</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500"></div>
              <span>Mesa Libre - Haz clic para nueva comanda</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500"></div>
              <span>Mesa Ocupada - Ver pedido en curso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500"></div>
              <span>Por Pagar - Procesar cobro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario Delivery */}
      {mostrarFormDelivery && (
        <FormularioDelivery
          onGuardar={handleDeliveryGuardar}
          onCancelar={() => setMostrarFormDelivery(false)}
        />
      )}
    </div>
  );
}