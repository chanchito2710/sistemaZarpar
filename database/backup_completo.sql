-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: zarparDataBase
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `zarparDataBase`
--

/*!40000 DROP DATABASE IF EXISTS `zarparDataBase`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `zarparDataBase` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `zarparDataBase`;

--
-- Table structure for table `categorias_productos`
--

DROP TABLE IF EXISTS `categorias_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('marca','tipo','calidad') NOT NULL,
  `valor` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tipo` (`tipo`,`valor`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_productos`
--

LOCK TABLES `categorias_productos` WRITE;
/*!40000 ALTER TABLE `categorias_productos` DISABLE KEYS */;
INSERT INTO `categorias_productos` (`id`, `tipo`, `valor`, `created_at`) VALUES (9,'tipo','Display','2025-10-28 19:40:36'),(10,'tipo','Bateria','2025-10-28 19:40:36'),(11,'tipo','Flex','2025-10-28 19:40:36'),(12,'tipo','Boton','2025-10-28 19:40:36'),(13,'tipo','Herramienta','2025-10-28 19:40:36'),(15,'tipo','antena','2025-10-28 19:40:36'),(16,'tipo','placa carga','2025-10-28 19:40:36'),(17,'tipo','main sub','2025-10-28 19:40:36'),(18,'tipo','Otro','2025-10-28 19:40:36'),(19,'calidad','Incell jk','2025-10-28 21:04:41'),(20,'calidad','Oled','2025-10-28 21:04:41'),(21,'calidad','Original','2025-10-28 21:04:41'),(22,'calidad','Oem','2025-10-28 21:04:41'),(23,'calidad','Incell zy','2025-10-28 21:04:41'),(24,'calidad','Incell','2025-10-28 21:04:41'),(25,'calidad','Otro','2025-10-28 21:04:41');
/*!40000 ALTER TABLE `categorias_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_maldonado`
--

DROP TABLE IF EXISTS `clientes_maldonado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_maldonado` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del cliente',
  `nombre_fantasia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasÃ­a o comercial',
  `rut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del cliente (puede ser NULL)',
  `direccion` text COLLATE utf8mb4_unicode_ci COMMENT 'DirecciÃ³n completa',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del cliente',
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RazÃ³n social (puede ser NULL)',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'TelÃ©fono principal',
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  CONSTRAINT `clientes_maldonado_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Maldonado';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_maldonado`
--

LOCK TABLES `clientes_maldonado` WRITE;
/*!40000 ALTER TABLE `clientes_maldonado` DISABLE KEYS */;
INSERT INTO `clientes_maldonado` (`id`, `nombre`, `apellido`, `nombre_fantasia`, `rut`, `direccion`, `email`, `razon_social`, `telefono`, `vendedor_id`, `fecha_registro`, `activo`, `created_at`, `updated_at`) VALUES (1,'Fernando','DÃ­az','Celulares del Este','214567890019','Rambla 890','fernando@celuest.com','Celulares del Este S.A.','099 333 444',2,'2024-02-15',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'MÃ³nica','Torres',NULL,NULL,'Av. Gorlero 234','monica.torres@hotmail.com',NULL,'099 444 555',2,'2024-03-01',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(3,'Gonzalo Matias','Fernández Zeballos',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',2,'2025-10-28',1,'2025-10-28 17:51:07','2025-10-28 17:51:07');
/*!40000 ALTER TABLE `clientes_maldonado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_melo`
--

DROP TABLE IF EXISTS `clientes_melo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_melo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del cliente',
  `nombre_fantasia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasÃ­a o comercial',
  `rut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del cliente (puede ser NULL)',
  `direccion` text COLLATE utf8mb4_unicode_ci COMMENT 'DirecciÃ³n completa',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del cliente',
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RazÃ³n social (puede ser NULL)',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'TelÃ©fono principal',
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  CONSTRAINT `clientes_melo_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Melo';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_melo`
--

LOCK TABLES `clientes_melo` WRITE;
/*!40000 ALTER TABLE `clientes_melo` DISABLE KEYS */;
INSERT INTO `clientes_melo` (`id`, `nombre`, `apellido`, `nombre_fantasia`, `rut`, `direccion`, `email`, `razon_social`, `telefono`, `vendedor_id`, `fecha_registro`, `activo`, `created_at`, `updated_at`) VALUES (1,'Gustavo','RamÃ­rez','Tech Store Melo','219876543012','Av. Artigas 321','gustavo@techstore.com','Tech Store S.R.L.','099 777 888',4,'2024-02-05',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Silvia','NÃºÃ±ez',NULL,NULL,'Calle Treinta y Tres 654','silvia.nunez@gmail.com',NULL,'099 888 999',4,'2024-03-15',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
/*!40000 ALTER TABLE `clientes_melo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_pando`
--

DROP TABLE IF EXISTS `clientes_pando`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_pando` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del cliente',
  `nombre_fantasia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasÃ­a o comercial',
  `rut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del cliente (puede ser NULL)',
  `direccion` text COLLATE utf8mb4_unicode_ci COMMENT 'DirecciÃ³n completa',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del cliente',
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RazÃ³n social (puede ser NULL)',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'TelÃ©fono principal',
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  CONSTRAINT `clientes_pando_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Pando';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_pando`
--

LOCK TABLES `clientes_pando` WRITE;
/*!40000 ALTER TABLE `clientes_pando` DISABLE KEYS */;
INSERT INTO `clientes_pando` (`id`, `nombre`, `apellido`, `nombre_fantasia`, `rut`, `direccion`, `email`, `razon_social`, `telefono`, `vendedor_id`, `fecha_registro`, `activo`, `created_at`, `updated_at`) VALUES (1,'Roberto','GarcÃ­a','TecnoFix Pando','212345670018','Av. Wilson 1234','roberto@tecnofix.com','TecnoFix S.R.L.','099 111 222',1,'2024-01-20',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Patricia','LÃ³pez',NULL,NULL,'Calle Italia 567','patricia.lopez@gmail.com',NULL,'099 222 333',1,'2024-02-10',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
/*!40000 ALTER TABLE `clientes_pando` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_paysandu`
--

DROP TABLE IF EXISTS `clientes_paysandu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_paysandu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del cliente',
  `nombre_fantasia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasÃ­a o comercial',
  `rut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del cliente (puede ser NULL)',
  `direccion` text COLLATE utf8mb4_unicode_ci COMMENT 'DirecciÃ³n completa',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del cliente',
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RazÃ³n social (puede ser NULL)',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'TelÃ©fono principal',
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  CONSTRAINT `clientes_paysandu_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal PaysandÃº';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_paysandu`
--

LOCK TABLES `clientes_paysandu` WRITE;
/*!40000 ALTER TABLE `clientes_paysandu` DISABLE KEYS */;
INSERT INTO `clientes_paysandu` (`id`, `nombre`, `apellido`, `nombre_fantasia`, `rut`, `direccion`, `email`, `razon_social`, `telefono`, `vendedor_id`, `fecha_registro`, `activo`, `created_at`, `updated_at`) VALUES (1,'Ricardo','MÃ©ndez','MÃ³viles PaysandÃº','216543210011','Av. 18 de Julio 987','ricardo@moviles.com','MÃ³viles PaysandÃº S.A.','099 999 000',5,'2024-01-22',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Beatriz','Flores',NULL,NULL,'Calle Zorrilla 432','beatriz.flores@hotmail.com',NULL,'099 000 111',5,'2024-02-28',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
/*!40000 ALTER TABLE `clientes_paysandu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_rivera`
--

DROP TABLE IF EXISTS `clientes_rivera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_rivera` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del cliente',
  `nombre_fantasia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasÃ­a o comercial',
  `rut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del cliente (puede ser NULL)',
  `direccion` text COLLATE utf8mb4_unicode_ci COMMENT 'DirecciÃ³n completa',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del cliente',
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RazÃ³n social (puede ser NULL)',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'TelÃ©fono principal',
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  CONSTRAINT `clientes_rivera_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Rivera';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_rivera`
--

LOCK TABLES `clientes_rivera` WRITE;
/*!40000 ALTER TABLE `clientes_rivera` DISABLE KEYS */;
INSERT INTO `clientes_rivera` (`id`, `nombre`, `apellido`, `nombre_fantasia`, `rut`, `direccion`, `email`, `razon_social`, `telefono`, `vendedor_id`, `fecha_registro`, `activo`, `created_at`, `updated_at`) VALUES (1,'AndrÃ©s','Castro','Repuestos Norte','211234567015','Calle SarandÃ­ 456','andres@norte.com','Repuestos Norte Ltda.','099 555 666',3,'2024-01-18',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Claudia','BenÃ­tez',NULL,NULL,'Av. Brasil 789','claudia.benitez@yahoo.com',NULL,'099 666 777',3,'2024-02-20',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
/*!40000 ALTER TABLE `clientes_rivera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_salto`
--

DROP TABLE IF EXISTS `clientes_salto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_salto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del cliente',
  `nombre_fantasia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasÃ­a o comercial',
  `rut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del cliente (puede ser NULL)',
  `direccion` text COLLATE utf8mb4_unicode_ci COMMENT 'DirecciÃ³n completa',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del cliente',
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RazÃ³n social (puede ser NULL)',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'TelÃ©fono principal',
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  CONSTRAINT `clientes_salto_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Salto';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_salto`
--

LOCK TABLES `clientes_salto` WRITE;
/*!40000 ALTER TABLE `clientes_salto` DISABLE KEYS */;
INSERT INTO `clientes_salto` (`id`, `nombre`, `apellido`, `nombre_fantasia`, `rut`, `direccion`, `email`, `razon_social`, `telefono`, `vendedor_id`, `fecha_registro`, `activo`, `created_at`, `updated_at`) VALUES (1,'Pablo','Vargas','Phone Service Salto','213579246017','Av. Uruguay 765','pablo@phoneservice.com','Phone Service Ltda.','099 111 000',6,'2024-02-12',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Cecilia','Rojas',NULL,NULL,'Calle Artigas 210','cecilia.rojas@gmail.com',NULL,'099 222 111',6,'2024-03-08',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
/*!40000 ALTER TABLE `clientes_salto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_tacuarembo`
--

DROP TABLE IF EXISTS `clientes_tacuarembo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_tacuarembo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del cliente',
  `nombre_fantasia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasÃ­a o comercial',
  `rut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del cliente (puede ser NULL)',
  `direccion` text COLLATE utf8mb4_unicode_ci COMMENT 'DirecciÃ³n completa',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del cliente',
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RazÃ³n social (puede ser NULL)',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'TelÃ©fono principal',
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  CONSTRAINT `clientes_tacuarembo_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal TacuarembÃ³';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_tacuarembo`
--

LOCK TABLES `clientes_tacuarembo` WRITE;
/*!40000 ALTER TABLE `clientes_tacuarembo` DISABLE KEYS */;
INSERT INTO `clientes_tacuarembo` (`id`, `nombre`, `apellido`, `nombre_fantasia`, `rut`, `direccion`, `email`, `razon_social`, `telefono`, `vendedor_id`, `fecha_registro`, `activo`, `created_at`, `updated_at`) VALUES (1,'MartÃ­n','Acosta','Repuestos TBO','218642097014','Av. Batlle 543','martin@rptbo.com','Repuestos TBO S.R.L.','099 333 222',7,'2024-01-30',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Gabriela','SuÃ¡rez',NULL,NULL,'Calle Rivera 876','gabriela.suarez@yahoo.com',NULL,'099 444 333',7,'2024-03-12',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
/*!40000 ALTER TABLE `clientes_tacuarembo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del producto (ej: Arroz)',
  `marca` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Marca del producto (ej: Saman)',
  `tipo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipo de producto (ej: Grano largo, Integral)',
  `calidad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Media',
  `codigo_barras` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CÃ³digo de barras (opcional)',
  `activo` tinyint(1) DEFAULT '1' COMMENT '1 = Producto activo, 0 = Producto desactivado',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creaciÃ³n',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de Ãºltima actualizaciÃ³n',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_barras` (`codigo_barras`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_marca` (`marca`),
  KEY `idx_activo` (`activo`),
  KEY `idx_codigo_barras` (`codigo_barras`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CatÃ¡logo maestro de productos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` (`id`, `nombre`, `marca`, `tipo`, `calidad`, `codigo_barras`, `activo`, `created_at`, `updated_at`) VALUES (8,'Samsung S24 Ultra','Samsung',NULL,'Original',NULL,0,'2025-10-29 00:47:24','2025-10-29 01:09:39'),(9,'Test Producto',NULL,'Display','Media',NULL,0,'2025-10-29 00:53:06','2025-10-29 01:09:36'),(10,'iphone 11 j','Iphone','Display','Incell jk',NULL,1,'2025-10-29 01:01:04','2025-10-29 15:35:21');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos_sucursal`
--

DROP TABLE IF EXISTS `productos_sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos_sucursal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL COMMENT 'ID del producto (FK a productos)',
  `sucursal` enum('maldonado','pando','rivera','melo','paysandu','salto','tacuarembo') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la sucursal',
  `stock` int DEFAULT '0' COMMENT 'Cantidad disponible en esta sucursal',
  `precio` decimal(10,2) NOT NULL COMMENT 'Precio de venta en esta sucursal',
  `stock_minimo` int DEFAULT '10' COMMENT 'Stock mÃ­nimo para alertas',
  `es_stock_principal` tinyint(1) DEFAULT '0' COMMENT '1 = Stock principal (Maldonado), 0 = Stock local',
  `activo` tinyint(1) DEFAULT '1' COMMENT '1 = Producto disponible en esta sucursal, 0 = No disponible',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de Ãºltima actualizaciÃ³n',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_producto_sucursal` (`producto_id`,`sucursal`) COMMENT 'Un producto solo puede tener un registro por sucursal',
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_stock` (`stock`),
  KEY `idx_es_stock_principal` (`es_stock_principal`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `productos_sucursal_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stock y precios por sucursal';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos_sucursal`
--

LOCK TABLES `productos_sucursal` WRITE;
/*!40000 ALTER TABLE `productos_sucursal` DISABLE KEYS */;
INSERT INTO `productos_sucursal` (`id`, `producto_id`, `sucursal`, `stock`, `precio`, `stock_minimo`, `es_stock_principal`, `activo`, `updated_at`) VALUES (57,8,'maldonado',0,0.00,10,1,1,'2025-10-29 13:11:43'),(58,8,'pando',0,0.00,10,0,1,'2025-10-29 13:11:43'),(59,8,'rivera',0,0.00,10,0,1,'2025-10-29 13:11:43'),(60,8,'melo',0,0.00,10,0,1,'2025-10-29 13:11:43'),(61,8,'paysandu',0,0.00,10,0,1,'2025-10-29 13:11:43'),(62,8,'salto',0,0.00,10,0,1,'2025-10-29 13:11:43'),(63,8,'tacuarembo',0,0.00,10,0,1,'2025-10-29 13:11:43'),(64,9,'maldonado',0,0.00,10,1,1,'2025-10-29 13:11:43'),(65,9,'pando',0,0.00,10,0,1,'2025-10-29 13:11:43'),(66,9,'rivera',0,0.00,10,0,1,'2025-10-29 13:11:43'),(67,9,'melo',0,0.00,10,0,1,'2025-10-29 13:11:43'),(68,9,'paysandu',0,0.00,10,0,1,'2025-10-29 13:11:43'),(69,9,'salto',0,0.00,10,0,1,'2025-10-29 13:11:43'),(70,9,'tacuarembo',0,0.00,10,0,1,'2025-10-29 13:11:43'),(71,10,'maldonado',200,0.00,200,1,1,'2025-10-29 19:22:17'),(72,10,'pando',0,0.00,10,0,1,'2025-10-29 19:21:55'),(73,10,'rivera',0,0.00,10,0,1,'2025-10-29 13:11:43'),(74,10,'melo',0,0.00,10,0,1,'2025-10-29 19:03:10'),(75,10,'paysandu',0,0.00,10,0,1,'2025-10-29 13:11:43'),(76,10,'salto',0,0.00,10,0,1,'2025-10-29 13:11:43'),(77,10,'tacuarembo',0,0.00,10,0,1,'2025-10-29 13:11:43');
/*!40000 ALTER TABLE `productos_sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendedores`
--

DROP TABLE IF EXISTS `vendedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre completo del vendedor',
  `cargo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Cargo del vendedor (Vendedor, Gerente, etc.)',
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Sucursal asignada',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'TelÃ©fono de contacto',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del vendedor',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Contraseña encriptada del vendedor',
  `fecha_ingreso` date DEFAULT NULL COMMENT 'Fecha de ingreso',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del vendedor',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Vendedores del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendedores`
--

LOCK TABLES `vendedores` WRITE;
/*!40000 ALTER TABLE `vendedores` DISABLE KEYS */;
INSERT INTO `vendedores` (`id`, `nombre`, `cargo`, `sucursal`, `telefono`, `email`, `password`, `fecha_ingreso`, `activo`, `created_at`, `updated_at`) VALUES (1,'Jonathan Witt','Vendedor','pando','099123456','pando@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-01-15',1,'2025-10-27 21:46:14','2025-10-29 15:45:45'),(2,'Maria de los Milagros Bertochi','Vendedor','maldonado','099 234 567','maldonado@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-02-01',1,'2025-10-27 21:46:14','2025-10-28 15:34:18'),(3,'Jonathan Moreira','Vendedor','rivera','099 345 678','rivera@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-03-10',1,'2025-10-27 21:46:14','2025-10-28 15:34:18'),(4,'Ivan da rosa','Vendedor','melo','099 456 789','melo@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-01-20',1,'2025-10-27 21:46:14','2025-10-28 15:34:18'),(5,'Yandy Clavero','Vendedor','paysandu','099 567 890','paysandu@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-02-15',1,'2025-10-27 21:46:14','2025-10-28 15:34:18'),(6,'Diego Silva','Vendedor','salto','099 678 901','salto@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-03-05',1,'2025-10-27 21:46:14','2025-10-28 15:34:18'),(7,'Maicol Fagundez','Vendedor','tacuarembo','099 789 012','tacuarembo@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-01-25',1,'2025-10-27 21:46:14','2025-10-28 15:34:18'),(8,'Nicolas Fernandez','Director General','Administrador ','093666885','admin@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy',NULL,1,'2025-10-28 14:08:00','2025-10-29 15:46:07');
/*!40000 ALTER TABLE `vendedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'zarparDataBase'
--

--
-- Dumping routines for database 'zarparDataBase'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-29 21:17:21
