import { BluetoothPrinter } from '@kduma-autoid/capacitor-bluetooth-printer';
import { BleClient } from '@capacitor-community/bluetooth-le';

interface PrinterConfig {
  deviceId: string;
  deviceName: string;
}

class PrinterService {
  private config: PrinterConfig | null = null;
  private conectado = false;

  async inicializarBluetooth(): Promise<void> {
    try {
      await BleClient.initialize({ androidNeverForLocation: true });
      console.log('✅ Bluetooth inicializado y permisos concedidos');
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  async obtenerDispositivosBluetooth(): Promise<Array<{ id: string; name: string }>> {
    try {
      console.log('📱 Buscando dispositivos Bluetooth emparejados...');
      
      const result = await BluetoothPrinter.list();
      
      if (!result || !result.devices || result.devices.length === 0) {
        console.log('⚠️ No se encontraron dispositivos');
        return [];
      }

      const dispositivos = result.devices.map((device: any) => ({
        id: device.address,
        name: device.name || 'Dispositivo desconocido'
      }));

      console.log(`✅ Se encontraron ${dispositivos.length} dispositivos:`);
      dispositivos.forEach((d: any) => {
        console.log(`  - ${d.name} (${d.id})`);
      });

      return dispositivos;
    } catch (err) {
      console.error('Error:', err);
      return [];
    }
  }

  async conectarBluetooth(deviceId: string, deviceName: string): Promise<boolean> {
    try {
      console.log(`🔌 Conectando a: ${deviceName}`);
      
      await BluetoothPrinter.connect({
        address: deviceId
      });

      console.log('✅ Conectado exitosamente');
      
      this.config = {
        deviceId,
        deviceName
      };
      this.conectado = true;
      return true;
    } catch (err) {
      console.error('Error conectando:', err);
      this.conectado = false;
      throw err;
    }
  }

  private async enviarRaw(datos: Uint8Array): Promise<void> {
    if (!this.conectado || !this.config) {
      throw new Error('No conectado');
    }

    try {
      console.log(`📤 Enviando ${datos.length} bytes...`);
      
      let dataString = '';
      for (let i = 0; i < datos.length; i++) {
        dataString += String.fromCharCode(datos[i]);
      }
      
      await BluetoothPrinter.print({ data: dataString });

      console.log('✅ Datos enviados');
    } catch (err) {
      console.error('Error enviando:', err);
      throw err;
    }
  }

  async desconectar(): Promise<void> {
    try {
      await BluetoothPrinter.disconnect();
      this.config = null;
      this.conectado = false;
      console.log('✅ Desconectado');
    } catch (err) {
      console.log('Error desconectando (ignorado)');
      this.config = null;
      this.conectado = false;
    }
  }

  private generarEncabezado(): string[] {
    return [
      '                YAMI CHICKEN                  ',
      ' ============================================ ',
      ' AV. NUEVE DE OCTUBRE 581 P.J. CRUZ DEL PERDON',
      '         CHICLAYO - CHICLAYO - LAMBAYEQUE     ',
      '                 RUC 10441993311              ',
      '       RESTAURANTE - POLLERIA - CHIFA         ',
      ' ============================================ ',
    ];
  }

  private generarESCPOS(lineas: string[]): Uint8Array {
    const commands: number[] = [];
    
    commands.push(...[0x1B, 0x40]);
    commands.push(0x0A);
    commands.push(...[0x1B, 0x61, 0x01]);

    lineas.forEach(linea => {
      if (linea.trim()) {
        for (let i = 0; i < linea.length; i++) {
          commands.push(linea.charCodeAt(i) & 0xFF);
        }
      }
      commands.push(0x0A);
    });

    commands.push(0x0A);
    commands.push(...[0x1B, 0x61, 0x00]);
    commands.push(...[0x0A, 0x0A, 0x0A]);
    // Corte de papel: GS V 66 0 (corte parcial, compatible con la mayoría de impresoras)
    commands.push(...[0x1D, 0x56, 0x42, 0x00]);

    return new Uint8Array(commands);
  }

  async imprimirComanda(pedido: any): Promise<boolean> {
    try {
      const lineas = [
        ...this.generarEncabezado(),
        ' ============================================ ',
        '',
        `COMANDA #${pedido.numero_pedido || 'N/A'}`,
        `Mesa: ${pedido.numero_mesa || 'N/A'}`,
        `Mozo: ${pedido.mozo_nombre || 'N/A'}`,
        `Hora: ${new Date().toLocaleTimeString('es-PE')}`,
        '',
        ' ============================================ ',
        'ITEMS:',
        ''
      ];

      let total = 0;
      if (pedido.lineas?.length) {
        pedido.lineas.forEach((item: any) => {
          const subtotal = item.subtotal || (item.precio_unitario || 0) * (item.cantidad || 1);
          const precioText = `S/${subtotal.toFixed(2)}`;
          const itemText = `${item.cantidad || 1}x ${item.producto_nombre}`;
          const espacios = Math.max(1, 44 - itemText.length - precioText.length);
          lineas.push(`${itemText}${' '.repeat(espacios)}${precioText}`);
          if (item.notas) lineas.push(`   Nota: ${item.notas}`);
          total += subtotal;
        });
      }

      lineas.push('');
      lineas.push('============================================');
      lineas.push(`TOTAL:                             S/${total.toFixed(2)}`);
      lineas.push('============================================');

      await this.enviarRaw(this.generarESCPOS(lineas));
      return true;
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  async imprimirCuenta(pedido: any): Promise<boolean> {
    try {
      const fecha = new Date();
      const lineas = [
        ...this.generarEncabezado(),
        '============================================',
        '',
        '         CUENTA FINAL',
        '',
        `Número: ${pedido.numero_pedido || 'N/A'}`,
        `Mesa: ${pedido.numero_mesa || 'N/A'}`,
        `Fecha: ${fecha.toLocaleDateString('es-PE')}`,
        `Hora: ${fecha.toLocaleTimeString('es-PE')}`,
        '',
        '============================================',
        'DETALLE:',
        '',
        ''
      ];

      let totalConIGV = 0;
      if (pedido.lineas?.length) {
        pedido.lineas.forEach((item: any) => {
          const precio = item.subtotal || 0;
          const cantidad = item.cantidad || 1;
          const nombre = item.producto_nombre || 'Producto';
          
          lineas.push(`${cantidad}x ${nombre}`);
          lineas.push(`${' '.repeat(20)}S/ ${precio.toFixed(2)}`);
          totalConIGV += precio;
        });
      }

      const subtotal = totalConIGV / 1.18;
      const igv = totalConIGV - subtotal;

      lineas.push('');
      lineas.push('============================================');
      lineas.push(`Subtotal:     S/ ${subtotal.toFixed(2)}`);
      lineas.push(`IGV (18%):    S/ ${igv.toFixed(2)}`);
      lineas.push('============================================');
      lineas.push(`TOTAL:        S/ ${totalConIGV.toFixed(2)}`);
      lineas.push('');
      lineas.push('============================================');
      lineas.push('');
      lineas.push('   ¡GRACIAS POR VENIR!');
      lineas.push('');

      await this.enviarRaw(this.generarESCPOS(lineas));
      return true;
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  async imprimirPrueba(): Promise<boolean> {
    try {
      const lineas = [
        ...this.generarEncabezado(),
        '============================================',
        '',
        '   PRUEBA DE IMPRESORA',
        '',
        `Fecha: ${new Date().toLocaleString('es-PE')}`,
        'Conexión: Bluetooth Classic',
        '',
        '============================================',
        '',
        '¡Sistema listo para usar!',
        '',
      ];

      await this.enviarRaw(this.generarESCPOS(lineas));
      return true;
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  getEstado() {
    return {
      conectado: this.conectado,
      dispositivo: this.config?.deviceName || 'No conectado'
    };
  }
}

export const printerService = new PrinterService();