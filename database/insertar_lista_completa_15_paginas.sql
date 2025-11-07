-- =====================================================
-- 📱 LISTA COMPLETA DE PRODUCTOS - 15 PÁGINAS
-- =====================================================
-- Análisis profundo del PDF de Maldonado
-- Incluye: iPhone, Samsung, Huawei, Xiaomi, Motorola
-- Tipos: Display, Batería, Placa Carga, Flex, Botón, Antena
-- =====================================================

USE zarparDataBase;

-- =====================================================
-- 🍎 iPHONE - DISPLAYS (PÁGINA 1-2)
-- =====================================================

-- iPhone 6/6S/7/8 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('iPhone 6', 'iPhone', 'Display', 'OEM', 1),
('iPhone 6 Plus', 'iPhone', 'Display', 'OEM', 1),
('iPhone 6S', 'iPhone', 'Display', 'OEM', 1),
('iPhone 6S Plus', 'iPhone', 'Display', 'OEM', 1),
('iPhone 7', 'iPhone', 'Display', 'Original', 1),
('iPhone 7 Plus', 'iPhone', 'Display', 'Original', 1),
('iPhone 8', 'iPhone', 'Display', 'Original', 1),
('iPhone 8 Plus', 'iPhone', 'Display', 'Original', 1);

-- iPhone X/XR/XS Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('iPhone X', 'iPhone', 'Display', 'Original', 1),
('iPhone XR', 'iPhone', 'Display', 'Original', 1),
('iPhone XS', 'iPhone', 'Display', 'Original', 1),
('iPhone XS Max', 'iPhone', 'Display', 'Original', 1);

-- iPhone 11 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('iPhone 11', 'iPhone', 'Display', 'Original', 1),
('iPhone 11 Pro', 'iPhone', 'Display', 'Original', 1),
('iPhone 11 Pro Max', 'iPhone', 'Display', 'Original', 1);

-- iPhone 12 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('iPhone 12', 'iPhone', 'Display', 'Original', 1),
('iPhone 12 Mini', 'iPhone', 'Display', 'Original', 1),
('iPhone 12 Pro', 'iPhone', 'Display', 'Original', 1),
('iPhone 12 Pro Max', 'iPhone', 'Display', 'Original', 1);

-- iPhone 13 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('iPhone 13', 'iPhone', 'Display', 'Original', 1),
('iPhone 13 Mini', 'iPhone', 'Display', 'Original', 1),
('iPhone 13 Pro', 'iPhone', 'Display', 'Original', 1),
('iPhone 13 Pro Max', 'iPhone', 'Display', 'Original', 1);

-- iPhone 14 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('iPhone 14', 'iPhone', 'Display', 'Original', 1),
('iPhone 14 Plus', 'iPhone', 'Display', 'Original', 1),
('iPhone 14 Pro', 'iPhone', 'Display', 'Original', 1),
('iPhone 14 Pro Max', 'iPhone', 'Display', 'Original', 1);

-- iPhone 15 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('iPhone 15', 'iPhone', 'Display', 'Original', 1),
('iPhone 15 Plus', 'iPhone', 'Display', 'Original', 1),
('iPhone 15 Pro', 'iPhone', 'Display', 'Original', 1),
('iPhone 15 Pro Max', 'iPhone', 'Display', 'Original', 1);

-- =====================================================
-- 🍎 iPHONE - BATERÍAS
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Batería iPhone 6', 'iPhone', 'Batería', 'OEM', 1),
('Batería iPhone 6 Plus', 'iPhone', 'Batería', 'OEM', 1),
('Batería iPhone 7', 'iPhone', 'Batería', 'OEM', 1),
('Batería iPhone 8', 'iPhone', 'Batería', 'OEM', 1),
('Batería iPhone X', 'iPhone', 'Batería', 'Original', 1),
('Batería iPhone 11', 'iPhone', 'Batería', 'Original', 1),
('Batería iPhone 12', 'iPhone', 'Batería', 'Original', 1),
('Batería iPhone 13', 'iPhone', 'Batería', 'Original', 1),
('Batería iPhone 14', 'iPhone', 'Batería', 'Original', 1);

-- =====================================================
-- 🍎 iPHONE - PLACA CARGA, FLEX, BOTONES
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Placa Carga iPhone 7', 'iPhone', 'Placa Carga', 'OEM', 1),
('Placa Carga iPhone 8', 'iPhone', 'Placa Carga', 'OEM', 1),
('Placa Carga iPhone X', 'iPhone', 'Placa Carga', 'OEM', 1),
('Placa Carga iPhone 11', 'iPhone', 'Placa Carga', 'OEM', 1),
('Flex Power iPhone 7', 'iPhone', 'Flex', 'OEM', 1),
('Flex Volume iPhone 8', 'iPhone', 'Flex', 'OEM', 1),
('Botón Home iPhone 7', 'iPhone', 'Botón', 'OEM', 1),
('Botón Home iPhone 8', 'iPhone', 'Botón', 'OEM', 1);

-- =====================================================
-- 📱 SAMSUNG - GALAXY S SERIES (PÁGINA 3-4)
-- =====================================================

-- Galaxy S6-S10
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Galaxy S6', 'Samsung', 'Display', 'OEM', 1),
('Galaxy S7', 'Samsung', 'Display', 'OEM', 1),
('Galaxy S8', 'Samsung', 'Display', 'Original', 1),
('Galaxy S8 Plus', 'Samsung', 'Display', 'Original', 1),
('Galaxy S9', 'Samsung', 'Display', 'Original', 1),
('Galaxy S9 Plus', 'Samsung', 'Display', 'Original', 1),
('Galaxy S10', 'Samsung', 'Display', 'Original', 1),
('Galaxy S10 Plus', 'Samsung', 'Display', 'Original', 1),
('Galaxy S10e', 'Samsung', 'Display', 'Original', 1);

-- Galaxy S20 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Galaxy S20', 'Samsung', 'Display', 'Original', 1),
('Galaxy S20 Plus', 'Samsung', 'Display', 'Original', 1),
('Galaxy S20 Ultra', 'Samsung', 'Display', 'Original', 1),
('Galaxy S20 FE', 'Samsung', 'Display', 'Original', 1);

-- Galaxy S21 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Galaxy S21', 'Samsung', 'Display', 'Original', 1),
('Galaxy S21 Plus', 'Samsung', 'Display', 'Original', 1),
('Galaxy S21 Ultra', 'Samsung', 'Display', 'Original', 1),
('Galaxy S21 FE', 'Samsung', 'Display', 'Original', 1);

-- Galaxy S22 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Galaxy S22', 'Samsung', 'Display', 'Original', 1),
('Galaxy S22 Plus', 'Samsung', 'Display', 'Original', 1),
('Galaxy S22 Ultra', 'Samsung', 'Display', 'Original', 1);

-- Galaxy S23 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Galaxy S23', 'Samsung', 'Display', 'Original', 1),
('Galaxy S23 Plus', 'Samsung', 'Display', 'Original', 1),
('Galaxy S23 Ultra', 'Samsung', 'Display', 'Original', 1);

-- Galaxy S24 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Galaxy S24', 'Samsung', 'Display', 'Original', 1),
('Galaxy S24 Plus', 'Samsung', 'Display', 'Original', 1),
('Galaxy S24 Ultra', 'Samsung', 'Display', 'Original', 1);

-- =====================================================
-- 📱 SAMSUNG - GALAXY A SERIES (PÁGINA 5-7)
-- =====================================================

-- Galaxy A10-A20 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Galaxy A10', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A10s', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A11', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A12', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A13', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A14', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A20', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A20s', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A21s', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A22', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A23', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A24', 'Samsung', 'Display', 'OEM', 1);

-- Galaxy A30-A40 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Galaxy A30', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A30s', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A31', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A32', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A33', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A34', 'Samsung', 'Display', 'OEM', 1),
('Galaxy A40', 'Samsung', 'Display', 'OEM', 1);

-- Galaxy A50-A70 Series
INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Galaxy A50', 'Samsung', 'Display', 'Original', 1),
('Galaxy A50s', 'Samsung', 'Display', 'Original', 1),
('Galaxy A51', 'Samsung', 'Display', 'Original', 1),
('Galaxy A52', 'Samsung', 'Display', 'Original', 1),
('Galaxy A53', 'Samsung', 'Display', 'Original', 1),
('Galaxy A54', 'Samsung', 'Display', 'Original', 1),
('Galaxy A70', 'Samsung', 'Display', 'Original', 1),
('Galaxy A71', 'Samsung', 'Display', 'Original', 1),
('Galaxy A72', 'Samsung', 'Display', 'Original', 1);

-- =====================================================
-- 📱 SAMSUNG - GALAXY J & NOTE SERIES
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Galaxy J2', 'Samsung', 'Display', 'OEM', 1),
('Galaxy J4', 'Samsung', 'Display', 'OEM', 1),
('Galaxy J5', 'Samsung', 'Display', 'OEM', 1),
('Galaxy J6', 'Samsung', 'Display', 'OEM', 1),
('Galaxy J7', 'Samsung', 'Display', 'OEM', 1),
('Galaxy J8', 'Samsung', 'Display', 'OEM', 1),
('Galaxy Note 8', 'Samsung', 'Display', 'Original', 1),
('Galaxy Note 9', 'Samsung', 'Display', 'Original', 1),
('Galaxy Note 10', 'Samsung', 'Display', 'Original', 1),
('Galaxy Note 10 Plus', 'Samsung', 'Display', 'Original', 1),
('Galaxy Note 20', 'Samsung', 'Display', 'Original', 1),
('Galaxy Note 20 Ultra', 'Samsung', 'Display', 'Original', 1);

-- =====================================================
-- 📱 SAMSUNG - BATERÍAS
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Batería Galaxy S8', 'Samsung', 'Batería', 'OEM', 1),
('Batería Galaxy S9', 'Samsung', 'Batería', 'OEM', 1),
('Batería Galaxy S10', 'Samsung', 'Batería', 'Original', 1),
('Batería Galaxy S20', 'Samsung', 'Batería', 'Original', 1),
('Batería Galaxy S21', 'Samsung', 'Batería', 'Original', 1),
('Batería Galaxy A10', 'Samsung', 'Batería', 'OEM', 1),
('Batería Galaxy A30', 'Samsung', 'Batería', 'OEM', 1),
('Batería Galaxy A50', 'Samsung', 'Batería', 'OEM', 1),
('Batería Galaxy J7', 'Samsung', 'Batería', 'OEM', 1),
('Batería Galaxy Note 10', 'Samsung', 'Batería', 'Original', 1);

-- =====================================================
-- 🤖 HUAWEI/HONOR - P SERIES (PÁGINA 8-9)
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('P8 Lite', 'Huawei', 'Display', 'OEM', 1),
('P9 Lite', 'Huawei', 'Display', 'OEM', 1),
('P10 Lite', 'Huawei', 'Display', 'OEM', 1),
('P20 Lite', 'Huawei', 'Display', 'Original', 1),
('P20 Pro', 'Huawei', 'Display', 'Original', 1),
('P30 Lite', 'Huawei', 'Display', 'Original', 1),
('P30 Pro', 'Huawei', 'Display', 'Original', 1),
('P40 Lite', 'Huawei', 'Display', 'Original', 1),
('P40 Pro', 'Huawei', 'Display', 'Original', 1),
('P Smart', 'Huawei', 'Display', 'OEM', 1),
('P Smart 2019', 'Huawei', 'Display', 'OEM', 1),
('P Smart 2020', 'Huawei', 'Display', 'OEM', 1),
('P Smart 2021', 'Huawei', 'Display', 'OEM', 1);

-- =====================================================
-- 🤖 HUAWEI/HONOR - Y SERIES
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Y5 2018', 'Huawei', 'Display', 'OEM', 1),
('Y5 2019', 'Huawei', 'Display', 'OEM', 1),
('Y6 2018', 'Huawei', 'Display', 'OEM', 1),
('Y6 2019', 'Huawei', 'Display', 'OEM', 1),
('Y7 2018', 'Huawei', 'Display', 'OEM', 1),
('Y7 2019', 'Huawei', 'Display', 'OEM', 1),
('Y9 2018', 'Huawei', 'Display', 'OEM', 1),
('Y9 2019', 'Huawei', 'Display', 'OEM', 1),
('Y9 Prime 2019', 'Huawei', 'Display', 'OEM', 1),
('Y9s', 'Huawei', 'Display', 'OEM', 1);

-- =====================================================
-- 🤖 HUAWEI/HONOR - MATE SERIES
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Mate 10 Lite', 'Huawei', 'Display', 'OEM', 1),
('Mate 20 Lite', 'Huawei', 'Display', 'Original', 1),
('Mate 20 Pro', 'Huawei', 'Display', 'Original', 1),
('Mate 30 Lite', 'Huawei', 'Display', 'Original', 1),
('Mate 30 Pro', 'Huawei', 'Display', 'Original', 1);

-- =====================================================
-- 🤖 HONOR - X SERIES
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Honor X5', 'Huawei', 'Display', 'OEM', 1),
('Honor X6', 'Huawei', 'Display', 'OEM', 1),
('Honor X6A', 'Huawei', 'Display', 'OEM', 1),
('Honor X6S', 'Huawei', 'Display', 'OEM', 1),
('Honor X7', 'Huawei', 'Display', 'OEM', 1),
('Honor X7A', 'Huawei', 'Display', 'OEM', 1),
('Honor X8', 'Huawei', 'Display', 'OEM', 1),
('Honor X8 5G', 'Huawei', 'Display', 'OEM', 1),
('Honor X9', 'Huawei', 'Display', 'Original', 1),
('Honor X9A 5G', 'Huawei', 'Display', 'Original', 1),
('Honor X9B 5G', 'Huawei', 'Display', 'Original', 1);

-- =====================================================
-- 🤖 HONOR - OTROS MODELOS
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Honor 8A', 'Huawei', 'Display', 'OEM', 1),
('Honor 8X', 'Huawei', 'Display', 'OEM', 1),
('Honor 9 Lite', 'Huawei', 'Display', 'OEM', 1),
('Honor 10 Lite', 'Huawei', 'Display', 'OEM', 1),
('Honor 20 Lite', 'Huawei', 'Display', 'OEM', 1),
('Honor View 20', 'Huawei', 'Display', 'Original', 1);

-- =====================================================
-- 🤖 HUAWEI/HONOR - BATERÍAS
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Batería P20 Lite', 'Huawei', 'Batería', 'OEM', 1),
('Batería P30 Lite', 'Huawei', 'Batería', 'OEM', 1),
('Batería Y9 2019', 'Huawei', 'Batería', 'OEM', 1),
('Batería Mate 20 Lite', 'Huawei', 'Batería', 'OEM', 1),
('Batería Honor X6', 'Huawei', 'Batería', 'OEM', 1),
('Batería Honor 8X', 'Huawei', 'Batería', 'OEM', 1);

-- =====================================================
-- 📱 XIAOMI - REDMI NOTE SERIES (PÁGINA 10-11)
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Redmi Note 7', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi Note 8', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi Note 8 Pro', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi Note 9', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi Note 9 Pro', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi Note 9S', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi Note 10', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi Note 10 Pro', 'Xiaomi', 'Display', 'Original', 1),
('Redmi Note 10S', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi Note 11', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi Note 11 Pro', 'Xiaomi', 'Display', 'Original', 1),
('Redmi Note 11S', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi Note 12', 'Xiaomi', 'Display', 'Original', 1),
('Redmi Note 12 Pro', 'Xiaomi', 'Display', 'Original', 1),
('Redmi Note 13', 'Xiaomi', 'Display', 'Original', 1),
('Redmi Note 13 Pro', 'Xiaomi', 'Display', 'Original', 1);

-- =====================================================
-- 📱 XIAOMI - REDMI SERIES
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Redmi 7', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 7A', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 8', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 8A', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 9', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 9A', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 9C', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 10', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 10A', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 10C', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 11', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 12', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 12C', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 13', 'Xiaomi', 'Display', 'OEM', 1),
('Redmi 13C', 'Xiaomi', 'Display', 'OEM', 1);

-- =====================================================
-- 📱 XIAOMI - MI & POCO SERIES
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Mi 8 Lite', 'Xiaomi', 'Display', 'OEM', 1),
('Mi 9 Lite', 'Xiaomi', 'Display', 'OEM', 1),
('Mi 10 Lite', 'Xiaomi', 'Display', 'Original', 1),
('Mi 11 Lite', 'Xiaomi', 'Display', 'Original', 1),
('Mi A2', 'Xiaomi', 'Display', 'OEM', 1),
('Mi A3', 'Xiaomi', 'Display', 'OEM', 1),
('Poco X3', 'Xiaomi', 'Display', 'OEM', 1),
('Poco X3 Pro', 'Xiaomi', 'Display', 'Original', 1),
('Poco X4 Pro', 'Xiaomi', 'Display', 'Original', 1),
('Poco X5 Pro', 'Xiaomi', 'Display', 'Original', 1),
('Poco M3', 'Xiaomi', 'Display', 'OEM', 1),
('Poco M4 Pro', 'Xiaomi', 'Display', 'OEM', 1),
('Poco M5', 'Xiaomi', 'Display', 'OEM', 1),
('Poco F3', 'Xiaomi', 'Display', 'Original', 1);

-- =====================================================
-- 📱 XIAOMI - BATERÍAS
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Batería Redmi Note 8', 'Xiaomi', 'Batería', 'OEM', 1),
('Batería Redmi Note 9', 'Xiaomi', 'Batería', 'OEM', 1),
('Batería Redmi Note 10', 'Xiaomi', 'Batería', 'OEM', 1),
('Batería Redmi Note 11', 'Xiaomi', 'Batería', 'OEM', 1),
('Batería Redmi 9', 'Xiaomi', 'Batería', 'OEM', 1),
('Batería Poco X3', 'Xiaomi', 'Batería', 'OEM', 1);

-- =====================================================
-- 📱 MOTOROLA - MOTO G SERIES (PÁGINA 12-13)
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Moto G5', 'Motorola', 'Display', 'OEM', 1),
('Moto G5 Plus', 'Motorola', 'Display', 'OEM', 1),
('Moto G6', 'Motorola', 'Display', 'OEM', 1),
('Moto G6 Plus', 'Motorola', 'Display', 'OEM', 1),
('Moto G7', 'Motorola', 'Display', 'OEM', 1),
('Moto G7 Plus', 'Motorola', 'Display', 'OEM', 1),
('Moto G7 Power', 'Motorola', 'Display', 'OEM', 1),
('Moto G8', 'Motorola', 'Display', 'OEM', 1),
('Moto G8 Plus', 'Motorola', 'Display', 'OEM', 1),
('Moto G8 Power', 'Motorola', 'Display', 'OEM', 1),
('Moto G9', 'Motorola', 'Display', 'OEM', 1),
('Moto G9 Plus', 'Motorola', 'Display', 'OEM', 1),
('Moto G9 Power', 'Motorola', 'Display', 'OEM', 1),
('Moto G10', 'Motorola', 'Display', 'OEM', 1),
('Moto G20', 'Motorola', 'Display', 'OEM', 1),
('Moto G30', 'Motorola', 'Display', 'OEM', 1),
('Moto G40', 'Motorola', 'Display', 'OEM', 1),
('Moto G50', 'Motorola', 'Display', 'OEM', 1),
('Moto G60', 'Motorola', 'Display', 'Original', 1),
('Moto G71', 'Motorola', 'Display', 'OEM', 1),
('Moto G72', 'Motorola', 'Display', 'Original', 1),
('Moto G73', 'Motorola', 'Display', 'Original', 1),
('Moto G82', 'Motorola', 'Display', 'Original', 1),
('Moto G84', 'Motorola', 'Display', 'Original', 1);

-- =====================================================
-- 📱 MOTOROLA - MOTO E SERIES
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Moto E4', 'Motorola', 'Display', 'OEM', 1),
('Moto E5', 'Motorola', 'Display', 'OEM', 1),
('Moto E6', 'Motorola', 'Display', 'OEM', 1),
('Moto E7', 'Motorola', 'Display', 'OEM', 1),
('Moto E7 Plus', 'Motorola', 'Display', 'OEM', 1),
('Moto E7 Power', 'Motorola', 'Display', 'OEM', 1),
('Moto E20', 'Motorola', 'Display', 'OEM', 1),
('Moto E22', 'Motorola', 'Display', 'OEM', 1),
('Moto E32', 'Motorola', 'Display', 'OEM', 1),
('Moto E40', 'Motorola', 'Display', 'OEM', 1);

-- =====================================================
-- 📱 MOTOROLA - ONE & EDGE SERIES
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Moto One', 'Motorola', 'Display', 'OEM', 1),
('Moto One Action', 'Motorola', 'Display', 'OEM', 1),
('Moto One Fusion', 'Motorola', 'Display', 'OEM', 1),
('Moto One Macro', 'Motorola', 'Display', 'OEM', 1),
('Moto Edge 20', 'Motorola', 'Display', 'Original', 1),
('Moto Edge 30', 'Motorola', 'Display', 'Original', 1),
('Moto Edge 40', 'Motorola', 'Display', 'Original', 1);

-- =====================================================
-- 📱 MOTOROLA - BATERÍAS
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Batería Moto G7', 'Motorola', 'Batería', 'OEM', 1),
('Batería Moto G8', 'Motorola', 'Batería', 'OEM', 1),
('Batería Moto G9', 'Motorola', 'Batería', 'OEM', 1),
('Batería Moto G30', 'Motorola', 'Batería', 'OEM', 1),
('Batería Moto E7', 'Motorola', 'Batería', 'OEM', 1);

-- =====================================================
-- 📱 PLACAS DE CARGA - VARIAS MARCAS (PÁGINA 14)
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Placa Carga Galaxy A10', 'Samsung', 'Placa Carga', 'OEM', 1),
('Placa Carga Galaxy A30', 'Samsung', 'Placa Carga', 'OEM', 1),
('Placa Carga Galaxy A50', 'Samsung', 'Placa Carga', 'OEM', 1),
('Placa Carga Galaxy S9', 'Samsung', 'Placa Carga', 'OEM', 1),
('Placa Carga P30 Lite', 'Huawei', 'Placa Carga', 'OEM', 1),
('Placa Carga Honor X6', 'Huawei', 'Placa Carga', 'OEM', 1),
('Placa Carga Redmi Note 8', 'Xiaomi', 'Placa Carga', 'OEM', 1),
('Placa Carga Redmi Note 9', 'Xiaomi', 'Placa Carga', 'OEM', 1),
('Placa Carga Redmi 9', 'Xiaomi', 'Placa Carga', 'OEM', 1),
('Placa Carga Moto G7', 'Motorola', 'Placa Carga', 'OEM', 1),
('Placa Carga Moto G8', 'Motorola', 'Placa Carga', 'OEM', 1);

-- =====================================================
-- 📱 FLEX, BOTONES Y ANTENAS (PÁGINA 15)
-- =====================================================

INSERT INTO productos (nombre, marca, tipo, calidad, activo) VALUES
('Flex Power Galaxy A10', 'Samsung', 'Flex', 'OEM', 1),
('Flex Volume Galaxy A30', 'Samsung', 'Flex', 'OEM', 1),
('Flex Power P30 Lite', 'Huawei', 'Flex', 'OEM', 1),
('Flex Power Honor X6', 'Huawei', 'Flex', 'OEM', 1),
('Flex Volume Redmi Note 8', 'Xiaomi', 'Flex', 'OEM', 1),
('Flex Power Moto G7', 'Motorola', 'Flex', 'OEM', 1),
('Botón Power Galaxy S9', 'Samsung', 'Botón', 'OEM', 1),
('Botón Volume Galaxy A50', 'Samsung', 'Botón', 'OEM', 1),
('Botón Power iPhone X', 'iPhone', 'Botón', 'OEM', 1),
('Antena WiFi Galaxy S10', 'Samsung', 'Antena', 'OEM', 1),
('Antena WiFi iPhone 11', 'iPhone', 'Antena', 'OEM', 1),
('Antena NFC P30 Lite', 'Huawei', 'Antena', 'OEM', 1);
