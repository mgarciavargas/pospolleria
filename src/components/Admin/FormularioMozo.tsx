import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface Usuario {
  id: string;
  nombre: string;
  pin: string;
  rol: 'MOZO' | 'ADMIN' | 'GERENTE' | 'COCINERO';
  activo: boolean;
  created_at: string;
}

interface FormularioMozoProps {
  usuario?: Usuario;
  onGuardar: (datos: {
    nombre: string;
    pin: string;
    rol: 'MOZO' | 'ADMIN' | 'GERENTE' | 'COCINERO';
    activo: boolean;
  }) => Promise<void>;
  onCancelar: () => void;
  cargando?: boolean;
}

const ROLES = [
  { value: 'MOZO', label: 'Mozo' },
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'GERENTE', label: 'Gerente' },
  { value: 'COCINERO', label: 'Cocinero' }
];

export function FormularioMozo({
  usuario,
  onGuardar,
  onCancelar
}: FormularioMozoProps) {
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    pin: usuario?.pin || '',
    rol: usuario?.rol || 'MOZO' as const,
    activo: usuario?.activo ?? true
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const isEditar = !!usuario;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.pin || formData.pin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos');
      return;
    }

    if (!/^\d+$/.test(formData.pin)) {
      setError('El PIN debe contener solo números');
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
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditar ? 'Editar Mozo' : 'Nuevo Mozo'}
          </h2>
          <button
            onClick={onCancelar}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={enviando}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Carlos Mora"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              disabled={enviando}
              maxLength={150}
            />
          </div>

          {/* PIN */}
          <div>
            <label className="block text-sm font-bold mb-1">PIN *</label>
            <input
              type="text"
              name="pin"
              value={formData.pin}
              onChange={handleChange}
              placeholder="Ej: 1234"
              inputMode="numeric"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              disabled={enviando}
              maxLength={4}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 4 dígitos numéricos</p>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-bold mb-1">Rol *</label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              disabled={enviando}
            >
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Activo */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-4 h-4 rounded"
              disabled={enviando}
            />
            <label className="text-sm font-bold">Usuario activo</label>
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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
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
