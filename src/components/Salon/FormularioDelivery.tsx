import { useState } from 'react';
import { X, Save, Phone, MapPin, Clock } from 'lucide-react';

interface FormularioDeliveryProps {
  onGuardar: (datos: {
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_direccion: string;
    hora_entrega: string;
  }) => Promise<void>;
  onCancelar: () => void;
}

export function FormularioDelivery({
  onGuardar,
  onCancelar
}: FormularioDeliveryProps) {
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_direccion: '',
    hora_entrega: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.cliente_nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.cliente_telefono.trim()) {
      setError('El teléfono es requerido');
      return;
    }

    if (!formData.cliente_direccion.trim()) {
      setError('La dirección es requerida');
      return;
    }

    if (!formData.hora_entrega) {
      setError('La hora de entrega es requerida');
      return;
    }

    try {
      setEnviando(true);
      await onGuardar(formData);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido';
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="bg-orange-600 text-white p-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🛵 Nuevo Delivery
          </h2>
          <button
            onClick={onCancelar}
            className="p-1 hover:bg-orange-700 rounded"
            disabled={enviando}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Nombre del Cliente */}
          <div>
            <label className="block text-sm font-bold mb-1">Nombre del Cliente *</label>
            <input
              type="text"
              name="cliente_nombre"
              value={formData.cliente_nombre}
              onChange={handleChange}
              placeholder="Ej: Juan García"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-600"
              disabled={enviando}
              maxLength={150}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-bold mb-1 flex items-center gap-1">
              <Phone className="w-4 h-4" /> Teléfono *
            </label>
            <input
              type="tel"
              name="cliente_telefono"
              value={formData.cliente_telefono}
              onChange={handleChange}
              placeholder="Ej: 987654321"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-600"
              disabled={enviando}
              maxLength={20}
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-bold mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Dirección *
            </label>
            <input
              type="text"
              name="cliente_direccion"
              value={formData.cliente_direccion}
              onChange={handleChange}
              placeholder="Ej: Calle Principal 123, Apt 4B"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-600"
              disabled={enviando}
              maxLength={250}
            />
          </div>

          {/* Hora de Entrega */}
          <div>
            <label className="block text-sm font-bold mb-1 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Hora de Entrega *
            </label>
            <input
              type="time"
              name="hora_entrega"
              value={formData.hora_entrega}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-600"
              disabled={enviando}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancelar}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 rounded disabled:opacity-50"
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={enviando}
            >
              <Save className="w-4 h-4" />
              {enviando ? 'Procesando...' : 'Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
