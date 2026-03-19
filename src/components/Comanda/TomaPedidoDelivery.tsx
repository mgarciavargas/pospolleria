// src/components/Comanda/TomaPedidoDelivery.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProductos, useCategorias } from '@/hooks/index';
import { supabase } from '@/services/api';
import { useAuthStore, useComandaStore } from '@/store/index';
import { ChevronLeft, ShoppingCart, Send, X } from 'lucide-react';
import { printerService } from '@/services/printerService';

interface ModalProductoProps {
  nombre: string;
  precio: number;
  onClose: () => void;
  onAgregar: (item: any) => void;
}

function ModalProducto({ nombre, precio, onClose, onAgregar }: ModalProductoProps) {
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');

  const handleAgregar = () => {
    onAgregar({
      id: `${Date.now()}`,
      producto_id: Date.now().toString(),
      producto_nombre: nombre,
      cantidad,
      precio_unitario: precio,
      subtotal: precio * cantidad,
      notas
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{nombre}</h2>
            <p className="text-red-600 text-xl font-bold">S/ {precio.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-y py-4">
          <label className="block text-sm font-bold mb-3">Cantidad</label>
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
            >
              −
            </button>
            <span className="text-3xl font-bold">{cantidad}</span>
            <button
              onClick={() => setCantidad(cantidad + 1)}
              className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>

        <div className="border-b pb-4">
          <label className="block text-sm font-bold mb-2">Notas</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej: bien frito, sin ají"
            className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
            rows={3}
          />
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex justify-between font-bold text-lg">
            <span>Subtotal</span>
            <span className="text-red-600">S/ {(precio * cantidad).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregar}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

export function TomaPedidoDelivery() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const usuario = useAuthStore(state => state.usuario);
  const carrito = useComandaStore(state => state.carrito);
  const agregarAlCarrito = useComandaStore(state => state.agregarAlCarrito);
  const eliminarDelCarrito = useComandaStore(state => state.eliminarDelCarrito);
  const limpiarCarrito = useComandaStore(state => state.limpiarCarrito);

  const numeroPedido = searchParams.get('numero');
  const [pedidoDelivery, setPedidoDelivery] = useState<any>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [productoModal, setProductoModal] = useState<any>(null);
  const [enviando, setEnviando] = useState(false);

  const { data: categorias } = useCategorias();
  const { data: productos } = useProductos(categoriaSeleccionada || undefined);

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);
  const igv = total * 0.18;
  const totalConIGV = total ;

  const productosFiltrados = categoriaSeleccionada
    ? productos?.filter((p: { categoria_id: string }) => p.categoria_id === categoriaSeleccionada)
    : productos;

  // Cargar delivery actual
  useEffect(() => {
    if (numeroPedido) {
      cargarDelivery();
    }
  }, [numeroPedido]);

  const cargarDelivery = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('numero_pedido', numeroPedido)
        .single();

      if (error) throw error;
      setPedidoDelivery(data);
    } catch (err) {
      console.error('Error al cargar delivery:', err);
      alert('❌ Error al cargar pedido delivery');
    }
  };

  const handleEnviarCocina = async () => {
    if (carrito.length === 0) {
      alert('Agrega productos primero');
      return;
    }

    setEnviando(true);

    try {
      // Actualizar el pedido delivery con los productos
      const { error } = await supabase
        .from('pedidos')
        .update({
          lineas: carrito,
          subtotal: total,
          igv: igv,
          total: totalConIGV,
          estado: 'EN_PREPARACION',
          updated_at: new Date().toISOString()
        })
        .eq('id', pedidoDelivery.id);

      if (error) throw error;

      // Imprimir comanda
      const estado = printerService.getEstado();
      if (estado.conectado) {
        try {
          await printerService.imprimirComanda({
            numero_pedido: pedidoDelivery.numero_pedido,
            cliente_nombre: pedidoDelivery.cliente_nombre,
            cliente_direccion: pedidoDelivery.cliente_direccion,
            mozo_nombre: usuario?.nombre,
            lineas: carrito,
            tipo: 'DELIVERY'
          });
        } catch (err) {
          console.log('Error impresión, pero pedido creado');
        }
      }

      alert('✅ Pedido enviado a cocina');
      limpiarCarrito();
      navigate('/salon');
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Error al enviar pedido');
    } finally {
      setEnviando(false);
    }
  };

  if (!pedidoDelivery) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      <div className="bg-orange-600 text-white p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/salon')} className="p-2 hover:bg-orange-700 rounded">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">🛵 Pedido Delivery</h1>
          <p className="text-sm text-orange-100">
            {pedidoDelivery.cliente_nombre} • {pedidoDelivery.cliente_telefono}
          </p>
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="bg-white p-4 mx-4 mt-4 rounded-lg shadow border-l-4 border-orange-600">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 font-bold">Cliente</p>
            <p className="font-bold">{pedidoDelivery.cliente_nombre}</p>
          </div>
          <div>
            <p className="text-gray-600 font-bold">Teléfono</p>
            <p className="font-bold">{pedidoDelivery.cliente_telefono}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600 font-bold">Dirección</p>
            <p className="font-bold">{pedidoDelivery.cliente_direccion}</p>
          </div>
          <div>
            <p className="text-gray-600 font-bold">Hora Entrega</p>
            <p className="font-bold">{pedidoDelivery.hora_entrega}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 bg-white p-3 rounded-lg">
            <button
              onClick={() => setCategoriaSeleccionada(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-bold ${
                !categoriaSeleccionada
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            {categorias?.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaSeleccionada(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-bold ${
                  categoriaSeleccionada === cat.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {productosFiltrados?.map((producto: any) => (
              <button
                key={producto.id}
                onClick={() => setProductoModal(producto)}
                className="bg-white p-3 rounded-lg shadow hover:shadow-lg transition text-left"
              >
                <h3 className="font-bold text-sm">{producto.nombre}</h3>
                <p className="text-xs text-gray-600">{producto.descripcion}</p>
                <p className="text-orange-600 font-bold text-lg mt-1">S/ {producto.precio.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 h-fit sticky top-20 space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              <h2 className="font-bold text-lg">Carrito</h2>
              <span className="ml-auto bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {carrito.length}
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-4 pb-4 border-b">
              {carrito.map((item) => (
                <div key={item.id} className="bg-gray-50 p-2 rounded text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold">{item.cantidad}x {item.producto_nombre}</span>
                    <button
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="text-red-600 hover:text-red-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  {item.notas && (
                    <p className="text-xs text-orange-600">📝 {item.notas}</p>
                  )}
                  <p className="text-orange-600 font-bold">S/ {item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
               
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span className="text-orange-600">S/ {totalConIGV.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleEnviarCocina}
                disabled={carrito.length === 0 || enviando}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Send className="w-5 h-5" />
                {enviando ? 'Enviando...' : 'Enviar a Cocina'}
              </button>
              <button
                onClick={limpiarCarrito}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 rounded-lg transition"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {productoModal && (
        <ModalProducto
          nombre={productoModal.nombre}
          precio={productoModal.precio}
          onClose={() => setProductoModal(null)}
          onAgregar={(item) => {
            agregarAlCarrito({ ...item, producto_id: productoModal.id });
            setProductoModal(null);
          }}
        />
      )}
    </div>
  );
}
