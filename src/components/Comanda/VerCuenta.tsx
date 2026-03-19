// src/components/Comanda/VerCuenta.tsx
// VERIFICADO - Sin errores de sintaxis

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase, apiService } from '@/services/api';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { printerService } from '@/services/printerService';

interface Pedido {
  id: string;
  numero_pedido: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: string;
  lineas: any[];
  created_at: string;
}

export function VerCuenta() {
  const { mesaId } = useParams<{ mesaId: string }>();
  const navigate = useNavigate();
  const [cerrando, setCerrando] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [mesaNombre, setMesaNombre] = useState<string>('');

  useEffect(() => {
    if (mesaId) {
      apiService.obtenerMesaPorId(mesaId).then(({ data }) => {
        if (data) setMesaNombre(`Mesa ${data.numero}`);
      });
    }
  }, [mesaId]);

  const { data: pedidos, isLoading, refetch } = useQuery({
    queryKey: ['pedidos-mesa', mesaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('mesa_id', mesaId)
        .neq('estado', 'PAGADO')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Pedido[];
    },
    refetchInterval: 3000,
  });

  const pedidoActual = pedidos?.[0];

  const handleCerrarCuenta = async () => {
    if (!pedidoActual) return;

    setCerrando(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: 'POR_PAGAR' })
        .eq('id', pedidoActual.id);

      if (error) throw error;

      alert('✅ Cuenta lista. Cliente debe pagar');
      refetch();
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Error al cerrar cuenta');
    } finally {
      setCerrando(false);
    }
  };

  const handlePagar = async () => {
    if (!pedidoActual) return;

    setPagando(true);
    try {
      const { error: errorPedido } = await supabase
        .from('pedidos')
        .update({
          estado: 'PAGADO',
          updated_at: new Date().toISOString(),
        })
        .eq('id', pedidoActual.id);

      if (errorPedido) throw errorPedido;

      const { error: errorMesa } = await supabase
        .from('mesas')
        .update({ estado: 'LIBRE' })
        .eq('id', mesaId);

      if (errorMesa) throw errorMesa;

      alert('✅ Pago registrado. Mesa liberada');
      navigate('/salon');
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Error al procesar pago');
    } finally {
      setPagando(false);
    }
  };

  const handleImprimirCuenta = async () => {
    if (!pedidoActual) return;

    const estado = printerService.getEstado();

    if (!estado.conectado) {
      alert('❌ Impresora no conectada. Ve a Configurar');
      return;
    }

    setImprimiendo(true);
    try {
      await printerService.imprimirCuenta({
        numero_pedido: pedidoActual.numero_pedido,
        numero_mesa: mesaNombre || mesaId,
        subtotal: pedidoActual.subtotal,
        igv: pedidoActual.igv,
        total: pedidoActual.total,
        lineas: pedidoActual.lineas,
      });
      alert('✅ Cuenta impresa');
    } catch (err) {
      alert('❌ Error al imprimir');
    } finally {
      setImprimiendo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!pedidoActual) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-red-600 text-white p-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/salon')}
            className="p-2 hover:bg-red-700 rounded"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Cuenta</h1>
        </div>
        <div className="p-4 text-center">
          <p className="text-gray-600 mb-4">No hay pedidos activos en esta mesa</p>
          <button
            onClick={() => navigate('/salon')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver al Salón
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      <div className="bg-red-600 text-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/salon')}
            className="p-2 hover:bg-red-700 rounded transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">💰 Cuenta</h1>
            <p className="text-sm text-red-100">Mesa {pedidoActual.created_at}</p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="text-red-100">Estado:</p>
          <p className="font-bold text-lg">{pedidoActual.estado}</p>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
          <div className="flex justify-between items-start mb-3 pb-3 border-b">
            <div>
              <p className="text-sm text-gray-600">Número de Pedido</p>
              <p className="font-bold text-lg">{pedidoActual.numero_pedido}</p>
            </div>
          
           
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
          <h2 className="font-bold text-lg mb-3">🍗 Detalle del Pedido</h2>

          {pedidoActual.lineas && pedidoActual.lineas.length > 0 ? (
            <div className="space-y-2">
              {pedidoActual.lineas.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start pb-2 border-b last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-bold">
                      {item.cantidad}x {item.producto_nombre}
                    </p>
                    {item.notas && (
                      <p className="text-xs text-gray-600">📝 {item.notas}</p>
                    )}
                  </div>
                  <p className="font-bold text-right whitespace-nowrap ml-2">
                    S/{' '}
                    {item.subtotal?.toFixed(2) ||
                      (item.cantidad * item.precio_unitario).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-3">Sin items registrados</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-bold">
                S/ {pedidoActual.subtotal.toFixed(2)}
              </span>
            </div>
            
            <div className="border-t-2 border-red-600 pt-3 flex justify-between text-lg font-bold bg-red-50 p-3 rounded">
              <span>TOTAL:</span>
              <span className="text-red-600">S/ {pedidoActual.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 sticky bottom-0 bg-gray-100 p-4">
          <button
            onClick={() =>
              navigate(`/comanda/${mesaId}?pedido_id=${pedidoActual.id}`)
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
          >
            ➕ Agregar Más Items
          </button>

          {pedidoActual.estado === 'ABIERTO' && (
            <button
              onClick={handleCerrarCuenta}
              disabled={cerrando}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
            >
              {cerrando ? 'Cerrando...' : '📋 Cerrar Cuenta (Mostrar Total)'}
            </button>
          )}

          {pedidoActual.estado === 'POR_PAGAR' && (
            <button
              onClick={handleImprimirCuenta}
              disabled={imprimiendo}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
            >
              {imprimiendo ? '⏳ Imprimiendo...' : '🖨️ Imprimir Cuenta'}
            </button>
          )}

          {pedidoActual.estado === 'POR_PAGAR' && (
            <button
              onClick={handlePagar}
              disabled={pagando}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
            >
              {pagando ? 'Procesando...' : '💳 Marcar como Pagado'}
            </button>
          )}

          <button
            onClick={() => navigate('/salon')}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition"
          >
            ← Volver al Salón
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          <p className="font-bold mb-1">💡 Flujo de Caja:</p>
          <p>1️⃣ ABIERTO → Mozo toma el pedido</p>
          <p>2️⃣ Click "Cerrar Cuenta" → POR_PAGAR (mostrar total)</p>
          <p>3️⃣ Click "Imprimir Cuenta" → 🖨️ Imprime ticket</p>
          <p>4️⃣ Cliente paga → Click "Marcar como Pagado"</p>
          <p>5️⃣ PAGADO → Mesa se libera</p>
        </div>
      </div>
    </div>
  );
}