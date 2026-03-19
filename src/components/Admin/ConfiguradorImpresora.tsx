import { useState, useEffect } from 'react';
import { printerService } from '@/services/printerService';
import { Printer, Bluetooth, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface Dispositivo {
  id: string;
  name: string;
}

export function ConfiguradorImpresora() {
  const [cargando, setCargando] = useState(false);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [conectado, setConectado] = useState(false);
  const [dispositivo, setDispositivo] = useState<Dispositivo | null>(null);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [error, setError] = useState('');
  const [conectando, setConectando] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    inicializar();
  }, []);

  const inicializar = async () => {
    try {
      agregarLog('🔄 Inicializando Bluetooth...');
      await printerService.inicializarBluetooth();
      agregarLog('✅ Bluetooth inicializado correctamente');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      agregarLog(`❌ Error iniciando: ${msg}`);
    }
  };

  const agregarLog = (mensaje: string) => {
    const timestamp = new Date().toLocaleTimeString('es-PE');
    const logCompleto = `[${timestamp}] ${mensaje}`;
    console.log(logCompleto);
    setLogs(prev => [...prev, logCompleto].slice(-50)); // Últimos 50 logs
  };

  const cargarDispositivos = async () => {
    setCargando(true);
    setError('');
    setDispositivos([]);
    agregarLog('🔍 INICIANDO BÚSQUEDA DE DISPOSITIVOS BLUETOOTH CLASSIC...');
    agregarLog('⏱️ Esto puede tomar 30-60 segundos');

    try {
      agregarLog('📡 Llamando a obtenerDispositivosBluetooth()...');
      const encontrados = await printerService.obtenerDispositivosBluetooth();
      
      agregarLog(`📊 Respuesta: ${encontrados.length} dispositivo(s) encontrado(s)`);

      if (!encontrados || encontrados.length === 0) {
        const msg = '⚠️ NO SE ENCONTRARON DISPOSITIVOS';
        agregarLog(msg);
        setError('❌ No se encontraron dispositivos Bluetooth.\n\nVerifica:\n✓ Bluetooth está ACTIVADO\n✓ La impresora está ENCENDIDA\n✓ La impresora está EMPAREJADA en Bluetooth del teléfono');
        return;
      }

      agregarLog('✅ DISPOSITIVOS ENCONTRADOS:');
      encontrados.forEach((d, i) => {
        agregarLog(`   ${i + 1}. ${d.name} (${d.id})`);
      });

      setDispositivos(encontrados);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      agregarLog(`❌ EXCEPCIÓN: ${msg}`);
      setError(`Error: ${msg}`);
    } finally {
      setCargando(false);
    }
  };

  const conectar = async (disp: Dispositivo) => {
    setConectando(true);
    setError('');
    agregarLog(`🔌 CONECTANDO A: ${disp.name}`);
    agregarLog(`   Address: ${disp.id}`);

    try {
      agregarLog('⏳ Esperando conexión...');
      await printerService.conectarBluetooth(disp.id, disp.name);
      
      agregarLog('✅ ¡CONEXIÓN EXITOSA!');
      setDispositivo(disp);
      setConectado(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      agregarLog(`❌ ERROR DE CONEXIÓN: ${msg}`);
      setError(`No se pudo conectar: ${msg}`);
    } finally {
      setConectando(false);
    }
  };

  const desconectar = async () => {
    agregarLog('🔓 Desconectando...');
    try {
      await printerService.desconectar();
      agregarLog('✅ Desconectado correctamente');
    } catch (err) {
      agregarLog(`⚠️ Error al desconectar (ignorado)`);
    }
    setConectado(false);
    setDispositivo(null);
    setError('');
  };

  const imprimir = async () => {
    setImprimiendo(true);
    setError('');
    agregarLog('📤 ENVIANDO COMANDA DE PRUEBA...');

    try {
      agregarLog('⏳ Imprimiendo...');
      const ok = await printerService.imprimirPrueba();
      
      if (ok) {
        agregarLog('✅ ¡PRUEBA IMPRESA EXITOSAMENTE!');
        alert('✅ ¡Impresora funcionando correctamente!');
      } else {
        agregarLog('❌ No se obtuvo confirmación de impresión');
        setError('Error: No se confirmó la impresión');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      agregarLog(`❌ ERROR AL IMPRIMIR: ${msg}`);
      setError(`Error: ${msg}`);
    } finally {
      setImprimiendo(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Printer className="w-8 h-8 text-red-600" />
        <h1 className="text-2xl font-bold">🖨️ Configurador de Impresora Bluetooth</h1>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex gap-2">
          <Bluetooth className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">Modo: Bluetooth CLASSIC (SPP)</p>
            <p>Compatible con impresoras térmicas POS tradicionales</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4 flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {!conectado && (
            <>
              <button
                onClick={cargarDispositivos}
                disabled={cargando || conectando}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-lg"
              >
                <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
                {cargando ? '🔍 Buscando dispositivos...' : '🔍 Buscar Impresoras'}
              </button>

              {dispositivos.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <p className="font-bold mb-3 text-gray-800">✅ {dispositivos.length} dispositivo(s) encontrado(s):</p>
                  <div className="space-y-2">
                    {dispositivos.map(disp => (
                      <div key={disp.id} className="flex items-center justify-between bg-white p-4 rounded border-2 border-gray-200 hover:border-green-500 transition">
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{disp.name}</p>
                          <p className="text-xs text-gray-500">MAC: {disp.id}</p>
                        </div>
                        <button
                          onClick={() => conectar(disp)}
                          disabled={conectando}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded ml-2 whitespace-nowrap"
                        >
                          {conectando ? '⏳ Conectando...' : '🔗 Conectar'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dispositivos.length === 0 && !cargando && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300 text-sm text-yellow-900">
                  <p className="font-bold mb-3">📝 PASOS PARA EMPAREJAR LA IMPRESORA:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li>Abre <strong>Configuración</strong> del teléfono</li>
                    <li>Ve a <strong>Bluetooth</strong></li>
                    <li>Activa Bluetooth si no está activo</li>
                    <li>Busca dispositivos y selecciona tu impresora</li>
                    <li>Usa PIN si lo solicita (generalmente <strong>1234</strong>)</li>
                    <li>Vuelve aquí y haz click en "Buscar Impresoras"</li>
                  </ol>
                </div>
              )}
            </>
          )}

          {conectado && dispositivo && (
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-600">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-6 h-6 text-green-600" />
                <p className="font-bold text-lg text-green-700">✅ CONECTADO</p>
              </div>
              <p className="text-base text-green-800 font-bold mb-4 p-3 bg-white rounded border border-green-300">
                📱 {dispositivo.name}
              </p>

              <div className="space-y-2">
                <button
                  onClick={imprimir}
                  disabled={imprimiendo}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded text-lg"
                >
                  {imprimiendo ? '⏳ Imprimiendo...' : '📄 Imprimir Prueba'}
                </button>

                <button
                  onClick={desconectar}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded text-lg"
                >
                  🔓 Desconectar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Panel de logs */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg p-3 flex flex-col h-96 border border-gray-700">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
              <p className="text-white text-xs font-bold">📋 LOGS (tiempo real)</p>
              <button
                onClick={() => setLogs([])}
                className="text-gray-400 hover:text-white text-xs font-bold hover:bg-gray-800 px-2 py-1 rounded"
              >
                Limpiar
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto rounded p-2 bg-black font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-600">Esperando acciones...</p>
              ) : (
                <div className="space-y-0">
                  {logs.map((log, i) => (
                    <div 
                      key={i} 
                      className={`text-green-400 whitespace-pre-wrap break-words ${
                        log.includes('❌') ? 'text-red-400' : 
                        log.includes('✅') ? 'text-green-400' : 
                        log.includes('⏳') ? 'text-yellow-400' : 
                        'text-green-400'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}