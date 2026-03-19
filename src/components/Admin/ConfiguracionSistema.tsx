// src/components/Admin/ConfiguracionSistema.tsx
// Configuración del Sistema

import { useState } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

interface Configuracion {
  nombreEmpresa: string;
  telefonoEmpresa: string;
  direccionEmpresa: string;
  porcentajeIGV: number;
  moneda: string;
  zonaHoraria: string;
  idioma: string;
}

export function ConfiguracionSistema() {
  const [config, setConfig] = useState<Configuracion>({
    nombreEmpresa: 'Pollería YAMI CHICKEN',
    telefonoEmpresa: '+51 987654321',
    direccionEmpresa: 'Calle Principal 123, Chiclayo',
    porcentajeIGV: 18,
    moneda: 'PEN',
    zonaHoraria: 'America/Lima',
    idioma: 'es'
  });

  const [guardado, setGuardado] = useState(false);
  const [editando, setEditando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'porcentajeIGV' ? parseFloat(value) : value
    }));
    setGuardado(false);
  };

  const handleGuardar = () => {
    // Simular guardado
    setGuardado(true);
    setEditando(false);
    setTimeout(() => setGuardado(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">⚙️ Configuración del Sistema</h2>
        <button
          onClick={() => setEditando(!editando)}
          className={`font-bold py-2 px-4 rounded-lg transition ${
            editando
              ? 'bg-gray-400 hover:bg-gray-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {editando ? '✖ Cancelar' : '✏️ Editar'}
        </button>
      </div>

      {/* Mensaje de guardado */}
      {guardado && (
        <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700 font-bold">✅ Configuración guardada exitosamente</p>
        </div>
      )}

      {/* Formulario */}
      <div className="space-y-6">
        {/* Datos de Empresa */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            🏢 Datos de la Empresa
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">Nombre de Empresa</label>
              <input
                type="text"
                name="nombreEmpresa"
                value={config.nombreEmpresa}
                onChange={handleChange}
                disabled={!editando}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 disabled:bg-gray-200"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Teléfono</label>
              <input
                type="text"
                name="telefonoEmpresa"
                value={config.telefonoEmpresa}
                onChange={handleChange}
                disabled={!editando}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 disabled:bg-gray-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold mb-2">Dirección</label>
              <input
                type="text"
                name="direccionEmpresa"
                value={config.direccionEmpresa}
                onChange={handleChange}
                disabled={!editando}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 disabled:bg-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Sistema */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            🔧 Configuración del Sistema
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">Porcentaje IGV (%)</label>
              <input
                type="number"
                name="porcentajeIGV"
                value={config.porcentajeIGV}
                onChange={handleChange}
                disabled={!editando}
                min="0"
                max="100"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 disabled:bg-gray-200"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Moneda</label>
              <select
                name="moneda"
                value={config.moneda}
                onChange={handleChange}
                disabled={!editando}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 disabled:bg-gray-200"
              >
                <option value="PEN">Soles Peruanos (S/)</option>
                <option value="USD">Dólares (USD $)</option>
                <option value="EUR">Euros (€)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Zona Horaria</label>
              <select
                name="zonaHoraria"
                value={config.zonaHoraria}
                onChange={handleChange}
                disabled={!editando}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 disabled:bg-gray-200"
              >
                <option value="America/Lima">Perú (Lima) - GMT-5</option>
                <option value="America/New_York">New York - GMT-5</option>
                <option value="Europe/London">Londres - GMT+0</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Idioma</label>
              <select
                name="idioma"
                value={config.idioma}
                onChange={handleChange}
                disabled={!editando}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 disabled:bg-gray-200"
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="pt">Portugués</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            ℹ️ Información del Sistema
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Versión del Sistema</p>
              <p className="font-bold">v1.0.0</p>
            </div>
            <div>
              <p className="text-gray-600">Base de Datos</p>
              <p className="font-bold">Supabase PostgreSQL</p>
            </div>
            <div>
              <p className="text-gray-600">Última Actualización</p>
              <p className="font-bold">{new Date().toLocaleDateString('es-PE')}</p>
            </div>
            <div>
              <p className="text-gray-600">Respaldo Automático</p>
              <p className="font-bold">✅ Activo</p>
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        {editando && (
          <div className="flex gap-4">
            <button
              onClick={handleGuardar}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Save className="w-5 h-5" />
              Guardar Cambios
            </button>
            <button
              onClick={() => setEditando(false)}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Advertencia */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
        <p className="text-yellow-800">
          ⚠️ <strong>Importante:</strong> Algunos cambios de configuración pueden requerir reiniciar la aplicación para tomar efecto.
        </p>
      </div>
    </div>
  );
}
