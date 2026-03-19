// Patch @kduma-autoid/capacitor-bluetooth-printer to use ISO-8859-1 encoding
// This ensures ESC/POS bytes are not corrupted when sent to the printer
const fs = require('fs');
const path = require('path');

const file = path.join(
  __dirname,
  '../node_modules/@kduma-autoid/capacitor-bluetooth-printer/android/src/main/java/dev/duma/capacitor/bluetoothprinter/BluetoothPrinter.java'
);

if (!fs.existsSync(file)) {
  console.log('patch-printer: plugin not found, skipping');
  process.exit(0);
}

let content = fs.readFileSync(file, 'utf8');

if (content.includes('data.getBytes("ISO-8859-1")')) {
  console.log('patch-printer: already patched');
  process.exit(0);
}

const patched = content.replace(
  'stream.write(data.getBytes());',
  'stream.write(data.getBytes("ISO-8859-1"));'
);

if (patched === content) {
  console.warn('patch-printer: pattern not found, patch may have failed');
  process.exit(1);
}

fs.writeFileSync(file, patched, 'utf8');
console.log('patch-printer: applied ISO-8859-1 fix to BluetoothPrinter.java');
