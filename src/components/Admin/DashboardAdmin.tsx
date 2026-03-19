// src/components/Admin/DashboardAdmin.tsx
// COMPLETO - Con todas las opciones + Gestión de Mesas + Deliveries

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/index';
import { LogOut, ChevronLeft, Printer, Package, Users, BarChart3, Cog, Utensils, Truck } from 'lucide-react';
import { ConfiguradorImpresora } from './ConfiguradorImpresora';
import { GestionProductos } from './GestionProductos';
import { GestionMozos } from './GestionMozos';
import { GestionMesas } from './GestionMesas';
import { PedidosDelivery } from './PedidosDelivery';
import { Reportes } from './Reportes';
import { ConfiguracionSistema } from './ConfiguracionSistema';
import { useState } from 'react'; 

type Vista = 'menu' | 'impresora' | 'productos' | 'mozos' | 'mesas' | 'delivery' | 'reportes' | 'configuracion';

export function DashboardAdmin() {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const usuario = useAuthStore(state => state.usuario);
  const [vistaActual, setVistaActual] = useState<Vista>('menu');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getTitulo = () => {
    switch (vistaActual) {
      case 'impresora':
        return '🖨️ Configurar Impresora';
      case 'productos':
        return '📦 Gestión de Productos';
      case 'mozos':
        return '👥 Gestión de Mozos';
      case 'mesas':
        return '🍽️ Gestión de Mesas';
      case 'delivery':
        return '🛵 Gestión de Deliveries';
      case 'reportes':
        return '📊 Reportes';
      case 'configuracion':
        return '⚙️ Configuración del Sistema';
      default:
        return '⚙️ Panel Administrativo';
    }
  };

  const renderVista = () => {
    switch (vistaActual) {
      case 'impresora':
        return <ConfiguradorImpresora />;
      case 'productos':
        return <GestionProductos />;
      case 'mozos':
        return <GestionMozos />;
      case 'mesas':
        return <GestionMesas />;
      case 'delivery':
        return <PedidosDelivery />;
      case 'reportes':
        return <Reportes />;
      case 'configuracion':
        return <ConfiguracionSistema />;
      default:
        return null;
    }
  };

  // Si está en una vista específica (no en menú)
  if (vistaActual !== 'menu') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVistaActual('menu')}
              className="p-2 hover:bg-gray-800 rounded-lg transition"
              title="Volver al menú"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">{getTitulo()}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition"
            title="Cerrar sesión"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {renderVista()}
        </div>
      </div>
    );
  }

  // Vista de Menú Principal
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-lg">
        <h1 className="text-2xl font-bold">⚙️ Panel Administrativo</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{usuario?.nombre}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition"
            title="Cerrar sesión"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Configurar Impresora */}
          <div
            onClick={() => setVistaActual('impresora')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Printer className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold">Configurar Impresora</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Conectar y configurar la impresora térmica POS-D por red WiFi.
            </p>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition">
              Abrir
            </button>
          </div>

          {/* Gestión de Productos */}
          <div
            onClick={() => setVistaActual('productos')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Gestión de Productos</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Editar precios, activar/desactivar productos y gestionar categorías.
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
              Abrir
            </button>
          </div>

          {/* Gestión de Mozos */}
          <div
            onClick={() => setVistaActual('mozos')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">Gestión de Mozos</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Crear, editar o desactivar usuarios y mozos del sistema.
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
              Abrir
            </button>
          </div>

          {/* Gestión de Mesas */}
          <div
            onClick={() => setVistaActual('mesas')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Utensils className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold">Gestión de Mesas</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Crear, editar o eliminar mesas y configurar capacidades.
            </p>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition">
              Abrir
            </button>
          </div>

          {/* Gestión de Deliveries - NUEVO */}
          <div
            onClick={() => setVistaActual('delivery')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-100 p-3 rounded-lg">
                <Truck className="w-6 h-6 text-pink-600" />
              </div>
              <h2 className="text-xl font-bold">Gestión de Deliveries</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Administra pedidos para entrega a domicilio y seguimiento.
            </p>
            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition">
              Abrir
            </button>
          </div>

          {/* Reportes */}
          <div
            onClick={() => setVistaActual('reportes')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold">Reportes</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Ver ventas del día, ganancias y estadísticas generales.
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition">
              Abrir
            </button>
          </div>

          {/* Configuración del Sistema */}
          <div
            onClick={() => setVistaActual('configuracion')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Cog className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold">Configuración</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Ajustes generales del sistema y datos de la empresa.
            </p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition">
              Abrir
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            💡 Información Rápida
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-sm text-gray-700">
              <p className="font-bold mb-2">📦 Productos:</p>
              <p>Gestiona el catálogo de productos con precios y disponibilidad.</p>
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-bold mb-2">👥 Mozos:</p>
              <p>Administra usuarios del sistema y permisos de acceso.</p>
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-bold mb-2">🍽️ Mesas:</p>
              <p>Crea y configura mesas del restaurante con capacidades.</p>
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-bold mb-2">🛵 Deliveries:</p>
              <p>Administra pedidos a domicilio y estado de entregas.</p>
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-bold mb-2">📊 Reportes:</p>
              <p>Consulta estadísticas de ventas y desempeño.</p>
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-bold mb-2">⚙️ Configuración:</p>
              <p>Datos de la empresa y ajustes del sistema.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}