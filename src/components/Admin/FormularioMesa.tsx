import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: string;
  created_at: string;
}

interface FormularioMesaProps {
  mesa?: Mesa;
  onGuardar: (datos: {
    numero: number;
    capacidad: number;
    estado?: string;
  }) => Promise<void>;
  onCancelar: () => void;
}

export function FormularioMesa({
  mesa,
  onGuardar,
  onCancelar
}: FormularioMesaProps) {
  const [formData, setFormData] = useState({
    numero: mesa?.numero || 1,
    capacidad: mesa?.capacidad || 4,
    estado: mesa?.estado || 'LIBRE'
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const isEditar = !!mesa;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.numero <= 0) {
      setError('El número de mesa debe ser mayor a 0');
      return;
    }

    if (formData.capacidad <= 0) {
      setError('La capacidad debe ser mayor a 0');
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
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditar ? 'Editar Mesa' : 'Nueva Mesa'}
          </h2>
          <button
            onClick={onCancelar}
            className="p-1 hover:bg-gray-100 rounded"
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

          {/* Número de Mesa */}
          <div>
            <label className="block text-sm font-bold mb-1">Número de Mesa *</label>
            <input
              type="number"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="Ej: 1"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-600"
              disabled={enviando}
              min={1}
              max={999}
            />
            <p className="text-xs text-gray-500 mt-1">Identificador único de la mesa</p>
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-bold mb-1">Capacidad (personas) *</label>
            <select
              name="capacidad"
              value={formData.capacidad}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-600"
              disabled={enviando}
            >
              <option value={2}>2 personas</option>
              <option value={4}>4 personas</option>
              <option value={6}>6 personas</option>
              <option value={8}>8 personas</option>
              <option value={10}>10 personas</option>
              <option value={12}>12 personas</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-bold mb-1">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-600"
              disabled={enviando || isEditar}
            >
              <option value="LIBRE">Libre</option>
              <option value="OCUPADA">Ocupada</option>
              <option value="POR_PAGAR">Por pagar</option>
            </select>
            {isEditar && (
              <p className="text-xs text-gray-500 mt-1">El estado se cambia desde el salón</p>
            )}
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
              {enviando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
