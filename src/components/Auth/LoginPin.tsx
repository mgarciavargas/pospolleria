// src/components/Auth/LoginPin.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/store/index';
import {   LogIn } from 'lucide-react';
import logoImg from '@/assets/logo1.png';

export function LoginPin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleLogin = async () => {
    if (pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: err } = await apiService.obtenerUsuario(pin);

      if (err || !data) {
        setError('PIN incorrecto');
        setPin('');
        return;
      }

      setAuth(data);
      
      if (data.rol === 'ADMIN' || data.rol === 'GERENTE') {
        navigate('/admin');
      } else {
        navigate('/salon');
      }
    } catch (err) {
      setError('Error al conectar');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-2">
          <div className="inline-block p-4 rounded-full mb-4">
             <img 
                src={logoImg}
                alt="YAMI CHICKEN" 
                className="w-32 h-32 object-contain"
              />
          </div>
        </div>
        {error && (
          <div className="mb-6 bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        <div className="mb-8">
          <div className="bg-gray-100 rounded-xl p-6 text-center">
            <p className="text-5xl font-bold tracking-widest text-gray-700">
              {'●'.repeat(pin.length)}{'○'.repeat(4 - pin.length)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              disabled={pin.length >= 4 || loading}
              className="aspect-square bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl font-bold text-xl transition"
            >
              {num}
            </button>
          ))}
          
          <button
            onClick={() => handleDigit('0')}
            disabled={pin.length >= 4 || loading}
            className="col-span-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl font-bold text-xl transition"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            disabled={pin.length === 0 || loading}
            className="col-span-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition disabled:opacity-50"
          >
            ← Borrar
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            disabled={pin.length !== 4 || loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>

          <button
            onClick={handleClear}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
