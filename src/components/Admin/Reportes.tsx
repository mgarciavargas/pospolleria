// src/components/Admin/Reportes.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/services/api';
import { TrendingUp, Package } from 'lucide-react';

type Periodo = 'dia' | 'semana' | 'mes';

export function Reportes() {
  const [periodVentas, setPeriodVentas] = useState<Periodo>('dia');
  const [periodProductos, setPeriodProductos] = useState<Periodo>('dia');
  const [ventasData, setVentasData] = useState<any[]>([]);
  const [productosData, setProductosData] = useState<any[]>([]);
  const [totalVentas, setTotalVentas] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [periodVentas, periodProductos]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      await Promise.all([
        cargarVentas(),
        cargarProductosMasVendidos()
      ]);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setCargando(false);
    }
  };

  const cargarVentas = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('total, created_at')
        .neq('estado', 'ABIERTO')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const datos = procesarVentas(data || [], periodVentas);
      setVentasData(datos);

      const total = datos.reduce((sum, item) => sum + item.total, 0);
      setTotalVentas(total);
    } catch (err) {
      console.error('Error ventas:', err);
    }
  };

  const cargarProductosMasVendidos = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('lineas, created_at')
        .neq('estado', 'ABIERTO')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const datos = procesarProductos(data || [], periodProductos);
      setProductosData(datos);
    } catch (err) {
      console.error('Error productos:', err);
    }
  };

  const procesarVentas = (pedidos: any[], periodo: Periodo) => {
    const grupos: { [key: string]: number } = {};

    pedidos.forEach(pedido => {
      const fecha = new Date(pedido.created_at);
      let key: string;

      if (periodo === 'dia') {
        key = fecha.toLocaleDateString('es-PE');
      } else if (periodo === 'semana') {
        const semana = Math.ceil((fecha.getDate()) / 7);
        key = `Sem ${semana} - ${fecha.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}`;
      } else {
        key = fecha.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
      }

      grupos[key] = (grupos[key] || 0) + (pedido.total || 0);
    });

    return Object.entries(grupos)
      .map(([fecha, total]) => ({ fecha, total: parseFloat(total.toFixed(2)) }))
      .reverse();
  };

  const procesarProductos = (pedidos: any[], periodo: Periodo) => {
    const productos: { [key: string]: { cantidad: number; veces: number } } = {};

    const fechaCorte = new Date();
    if (periodo === 'dia') {
      fechaCorte.setHours(0, 0, 0, 0);
    } else if (periodo === 'semana') {
      fechaCorte.setDate(fechaCorte.getDate() - 7);
    } else {
      fechaCorte.setDate(1);
      fechaCorte.setHours(0, 0, 0, 0);
    }

    pedidos.forEach(pedido => {
      if (new Date(pedido.created_at) >= fechaCorte) {
        const lineas = pedido.lineas || [];
        lineas.forEach((item: any) => {
          const nombre = item.producto_nombre;
          if (!productos[nombre]) {
            productos[nombre] = { cantidad: 0, veces: 0 };
          }
          productos[nombre].cantidad += item.cantidad || 1;
          productos[nombre].veces += 1;
        });
      }
    });

    return Object.entries(productos)
      .map(([nombre, datos]) => ({
        nombre,
        cantidad: datos.cantidad,
        veces: datos.veces
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  };

  const maxVenta = Math.max(...ventasData.map(v => v.total), 1);
  const maxProducto = Math.max(...productosData.map(p => p.cantidad), 1);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECCIÓN 1: VENTAS */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">💰 Ventas</h2>
              <p className="text-gray-600 text-sm">Ingresos por período</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-red-600">S/ {totalVentas.toFixed(2)}</p>
            <p className="text-gray-600 text-sm">Total {periodVentas}</p>
          </div>
        </div>

        {/* Botones de período */}
        <div className="flex gap-2 mb-6">
          {(['dia', 'semana', 'mes'] as Periodo[]).map(periodo => (
            <button
              key={periodo}
              onClick={() => setPeriodVentas(periodo)}
              className={`px-4 py-2 rounded-lg font-bold transition capitalize ${
                periodVentas === periodo
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {periodo === 'dia' && '📅 Hoy'}
              {periodo === 'semana' && '📊 Esta Semana'}
              {periodo === 'mes' && '📈 Este Mes'}
            </button>
          ))}
        </div>

        {/* Gráfico visual con barras */}
        {ventasData.length > 0 ? (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              {ventasData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-700">{item.fecha}</span>
                    <span className="text-sm font-bold text-red-600">S/ {item.total.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-400 to-red-600 h-full flex items-center justify-end pr-2"
                      style={{ width: `${(item.total / maxVenta) * 100}%` }}
                    >
                      {(item.total / maxVenta) * 100 > 5 && (
                        <span className="text-white text-xs font-bold">{Math.round((item.total / maxVenta) * 100)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>📊 No hay datos disponibles para este período</p>
          </div>
        )}

        {/* Tabla de detalle */}
        {ventasData.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">Fecha</th>
                  <th className="px-4 py-2 text-right font-bold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {ventasData.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{item.fecha}</td>
                    <td className="px-4 py-2 text-right font-bold text-red-600">
                      S/ {item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: PRODUCTOS MÁS VENDIDOS */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">🏆 Productos Más Vendidos</h2>
              <p className="text-gray-600 text-sm">Top 10 de la venta</p>
            </div>
          </div>
        </div>

        {/* Botones de período */}
        <div className="flex gap-2 mb-6">
          {(['dia', 'semana', 'mes'] as Periodo[]).map(periodo => (
            <button
              key={periodo}
              onClick={() => setPeriodProductos(periodo)}
              className={`px-4 py-2 rounded-lg font-bold transition capitalize ${
                periodProductos === periodo
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {periodo === 'dia' && '📅 Hoy'}
              {periodo === 'semana' && '📊 Esta Semana'}
              {periodo === 'mes' && '📈 Este Mes'}
            </button>
          ))}
        </div>

        {/* Gráfico visual con barras */}
        {productosData.length > 0 ? (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              {productosData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-700">#{idx + 1} {item.nombre}</span>
                    <span className="text-sm font-bold text-orange-600">{item.cantidad}x</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-full flex items-center justify-end pr-2"
                      style={{ width: `${(item.cantidad / maxProducto) * 100}%` }}
                    >
                      {(item.cantidad / maxProducto) * 100 > 5 && (
                        <span className="text-white text-xs font-bold">{Math.round((item.cantidad / maxProducto) * 100)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>📊 No hay productos vendidos en este período</p>
          </div>
        )}

        {/* Tabla detallada */}
        {productosData.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">Ranking</th>
                  <th className="px-4 py-2 text-left font-bold">Producto</th>
                  <th className="px-4 py-2 text-center font-bold">Cantidad</th>
                  <th className="px-4 py-2 text-center font-bold">Veces Vendido</th>
                </tr>
              </thead>
              <tbody>
                {productosData.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-bold">{item.nombre}</td>
                    <td className="px-4 py-2 text-center">
                      <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded font-bold">
                        {item.cantidad}x
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-gray-600">
                      {item.veces} {item.veces === 1 ? 'pedido' : 'pedidos'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESUMEN RÁPIDO */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">📊 Resumen Rápido</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
            <p className="text-gray-600 text-sm">Total de Ventas</p>
            <p className="text-3xl font-bold text-red-600">S/ {totalVentas.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
            <p className="text-gray-600 text-sm">Productos Únicos Vendidos</p>
            <p className="text-3xl font-bold text-orange-600">{productosData.length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm">Total de Unidades</p>
            <p className="text-3xl font-bold text-blue-600">
              {productosData.reduce((sum, p) => sum + p.cantidad, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}