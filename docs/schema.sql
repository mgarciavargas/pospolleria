-- Copiar y ejecutar en Supabase SQL Editor
-- https://supabase.com → Tu proyecto → SQL Editor

-- Categorías
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usuarios (Mozos)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  pin VARCHAR(4) UNIQUE NOT NULL,
  rol VARCHAR(30) DEFAULT 'MOZO',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  categoria_id UUID NOT NULL REFERENCES categorias(id),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mesas
CREATE TABLE mesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INT UNIQUE NOT NULL,
  capacidad INT DEFAULT 4,
  estado VARCHAR(20) DEFAULT 'LIBRE',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pedido VARCHAR(20) UNIQUE NOT NULL,
  mesa_id UUID NOT NULL REFERENCES mesas(id),
  mozo_id UUID NOT NULL REFERENCES usuarios(id),
  total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(30) DEFAULT 'ABIERTO',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_pedidos_mesa ON pedidos(mesa_id);
CREATE INDEX idx_pedidos_mozo ON pedidos(mozo_id);
CREATE INDEX idx_mesas_estado ON mesas(estado);

-- Insertar datos de ejemplo
INSERT INTO categorias (nombre, descripcion, orden) VALUES
('Brasas', 'Pollo a la brasa y carnes asadas', 1),
('Entradas', 'Entrada clásicas y sopas', 2),
('Bebidas', 'Bebidas frías y calientes', 3),
('Guarniciones', 'Complementos y acompañamientos', 4),
('Postres', 'Dulces y postres', 5);

INSERT INTO productos (nombre, descripcion, precio, categoria_id, activo) VALUES
('1/4 Pollo a la Brasa', 'Cuarto de pollo jugoso asado a fuego de carbón', 18.50, (SELECT id FROM categorias WHERE nombre = 'Brasas'), TRUE),
('1/2 Pollo a la Brasa', 'Media porción de pollo tierno', 32.50, (SELECT id FROM categorias WHERE nombre = 'Brasas'), TRUE),
('Pollo Entero a la Brasa', 'Pollo completo asado con papas y ensalada', 48.00, (SELECT id FROM categorias WHERE nombre = 'Brasas'), TRUE),
('Anticuchos de Corazón', 'Corazón marinado y asado (6 unidades)', 14.50, (SELECT id FROM categorias WHERE nombre = 'Entradas'), TRUE),
('Salchipapa Especial', 'Salchicha + papas fritas + huevo frito', 12.50, (SELECT id FROM categorias WHERE nombre = 'Entradas'), TRUE),
('Inka Kola (1.5L)', 'Bebida gaseosa sabor a hierba luisa', 3.50, (SELECT id FROM categorias WHERE nombre = 'Bebidas'), TRUE),
('Coca Cola (1.5L)', 'Refresco gaseosa clásico', 3.00, (SELECT id FROM categorias WHERE nombre = 'Bebidas'), TRUE),
('Chicha Morada Natural', 'Bebida tradicional peruana de maíz morado', 2.50, (SELECT id FROM categorias WHERE nombre = 'Bebidas'), TRUE),
('Papas Fritas Extra', 'Papas amarillas fritas', 4.50, (SELECT id FROM categorias WHERE nombre = 'Guarniciones'), TRUE),
('Ensalada Fresca Extra', 'Ensalada con tomate, cebolla y limón', 5.00, (SELECT id FROM categorias WHERE nombre = 'Guarniciones'), TRUE),
('Flan Casero', 'Flan tradicional con caramelo', 6.00, (SELECT id FROM categorias WHERE nombre = 'Postres'), TRUE),
('Tres Leches', 'Torta esponjosa con tres tipos de leche', 7.00, (SELECT id FROM categorias WHERE nombre = 'Postres'), TRUE);

INSERT INTO usuarios (nombre, pin, rol, activo) VALUES
('Carlos Mora', '1111', 'MOZO', TRUE),
('Juan Pérez', '2222', 'MOZO', TRUE),
('Roberto Admin', '0000', 'ADMIN', TRUE),
('María Gerente', '3333', 'GERENTE', TRUE);

INSERT INTO mesas (numero, capacidad, estado) VALUES
(1, 2, 'LIBRE'),
(2, 2, 'LIBRE'),
(3, 4, 'LIBRE'),
(4, 4, 'LIBRE'),
(5, 6, 'LIBRE'),
(6, 8, 'LIBRE'),
(7, 4, 'LIBRE'),
(8, 2, 'LIBRE');
