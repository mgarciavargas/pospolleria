// src/services/print.ts

export class ESCPOSFormatter {
  private buffer: Uint8Array[] = [];

  private static ESC = '\x1B';
  private static GS = '\x1D';
  private static LF = '\x0A';

  init() {
    this.addCommand(ESCPOSFormatter.ESC + '@');
    return this;
  }

  text(content: string) {
    this.buffer.push(new TextEncoder().encode(content));
    return this;
  }

  newLine(count: number = 1) {
    for (let i = 0; i < count; i++) {
      this.buffer.push(new TextEncoder().encode(ESCPOSFormatter.LF));
    }
    return this;
  }

  center() {
    this.addCommand(ESCPOSFormatter.ESC + 'a' + String.fromCharCode(1));
    return this;
  }

  left() {
    this.addCommand(ESCPOSFormatter.ESC + 'a' + String.fromCharCode(0));
    return this;
  }

  bold(on: boolean = true) {
    const cmd = on
      ? ESCPOSFormatter.ESC + 'E' + String.fromCharCode(1)
      : ESCPOSFormatter.ESC + 'E' + String.fromCharCode(0);
    this.addCommand(cmd);
    return this;
  }

  largeSize(on: boolean = true) {
    const cmd = on
      ? ESCPOSFormatter.GS + '!' + String.fromCharCode(0x11)
      : ESCPOSFormatter.GS + '!' + String.fromCharCode(0x00);
    this.addCommand(cmd);
    return this;
  }

  extraLargeSize(on: boolean = true) {
    const cmd = on
      ? ESCPOSFormatter.GS + '!' + String.fromCharCode(0x22)
      : ESCPOSFormatter.GS + '!' + String.fromCharCode(0x00);
    this.addCommand(cmd);
    return this;
  }

  dottedLine(width: number = 32) {
    this.text('.'.repeat(width));
    return this;
  }

  solidLine(width: number = 32) {
    this.text('='.repeat(width));
    return this;
  }

  cut() {
    this.addCommand(ESCPOSFormatter.GS + 'V' + String.fromCharCode(66) + String.fromCharCode(0));
    return this;
  }

  getBytes() {
    const totalLength = this.buffer.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const arr of this.buffer) {
      result.set(arr, offset);
      offset += arr.length;
    }

    return result;
  }

  private addCommand(cmd: string) {
    this.buffer.push(new TextEncoder().encode(cmd));
  }
}

export function crearTicketCocina(pedido: any) {
  const formatter = new ESCPOSFormatter();

  formatter
    .init()
    .center()
    .bold(true)
    .extraLargeSize(true)
    .text('POLLERÍA YAMI CHICKEN')
    .extraLargeSize(false)
    .bold(false)
    .newLine(2)
    .left()
    .text(`MESA: ${pedido.mesa_numero}`)
    .newLine()
    .text(`MOZO: ${pedido.mozo_nombre}`)
    .newLine()
    .text(`HORA: ${new Date().toLocaleTimeString()}`)
    .newLine(2)
    .solidLine()
    .newLine();

  pedido.lineas.forEach((linea: any) => {
    formatter
      .bold(true)
      .largeSize(true)
      .text(`${linea.cantidad}x ${linea.producto_nombre}`)
      .largeSize(false)
      .bold(false)
      .newLine();

    if (linea.modificadores && linea.modificadores.length > 0) {
      formatter.text('  • ' + linea.modificadores.join(', ')).newLine();
    }

    if (linea.notas) {
      formatter.text(`  Nota: ${linea.notas}`).newLine();
    }

    formatter.newLine();
  });

  formatter
    .newLine()
    .solidLine()
    .newLine(3)
    .cut();

  return formatter.getBytes();
}

export function crearTicketCuenta(pedido: any) {
  const formatter = new ESCPOSFormatter();

  formatter
    .init()
    .center()
    .bold(true)
    .extraLargeSize(true)
    .text('POLLERÍA YAMI CHICKEN')
    .extraLargeSize(false)
    .bold(false)
    .newLine()
    .text(`Nit: 123456789-0`)
    .newLine(2)
    .left()
    .text(`MESA: ${pedido.mesa_numero}`)
    .newLine()
    .text(`FECHA: ${new Date().toLocaleDateString()}`)
    .newLine()
    .text(`HORA: ${new Date().toLocaleTimeString()}`)
    .newLine(2)
    .solidLine()
    .newLine();

  pedido.lineas.forEach((linea: any) => {
    const totalLinea = linea.cantidad * linea.precio_unitario;
    const cantText = `${linea.cantidad}x`;
    const nameText = linea.producto_nombre;
    const precioText = `S/ ${totalLinea.toFixed(2)}`;

    const espacios = 32 - cantText.length - nameText.length - precioText.length;
    const liniaFormato = `${cantText} ${nameText}${' '.repeat(Math.max(1, espacios))}${precioText}`;

    formatter.text(liniaFormato).newLine();
  });

  formatter
    .newLine()
    .dottedLine()
    .newLine()
    .left()
    .text(`Subtotal:   S/ ${pedido.subtotal.toFixed(2)}`)
    .newLine()
    .text(`IGV (18%):  S/ ${pedido.igv.toFixed(2)}`)
    .newLine()
    .bold(true)
    .largeSize(true)
    .text(`TOTAL:      S/ ${pedido.total.toFixed(2)}`)
    .largeSize(false)
    .bold(false)
    .newLine(3)
    .left()
    .center()
    .text('¡Gracias por su compra!')
    .newLine()
    .text('Vuelva pronto')
    .newLine(3)
    .cut();

  return formatter.getBytes();
}
