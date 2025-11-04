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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_productos`
--

LOCK TABLES `categorias_productos` WRITE;
/*!40000 ALTER TABLE `categorias_productos` DISABLE KEYS */;
INSERT INTO `categorias_productos` VALUES (9,'tipo','Display','2025-10-28 19:40:36'),(10,'tipo','Bateria','2025-10-28 19:40:36'),(11,'tipo','Flex','2025-10-28 19:40:36'),(12,'tipo','Boton','2025-10-28 19:40:36'),(13,'tipo','Herramienta','2025-10-28 19:40:36'),(15,'tipo','antena','2025-10-28 19:40:36'),(16,'tipo','placa carga','2025-10-28 19:40:36'),(17,'tipo','main sub','2025-10-28 19:40:36'),(18,'tipo','Otro','2025-10-28 19:40:36'),(19,'calidad','Incell jk','2025-10-28 21:04:41'),(20,'calidad','Oled','2025-10-28 21:04:41'),(21,'calidad','Original','2025-10-28 21:04:41'),(22,'calidad','Oem','2025-10-28 21:04:41'),(23,'calidad','Incell zy','2025-10-28 21:04:41'),(24,'calidad','Incell','2025-10-28 21:04:41'),(25,'calidad','Otro','2025-10-28 21:04:41'),(26,'marca','Iphone','2025-10-29 21:55:23'),(27,'marca','Samsung','2025-10-29 21:55:31'),(28,'marca','Huawei','2025-10-29 21:55:42'),(29,'marca','Xiaomi','2025-10-29 21:55:50'),(30,'marca','Tcl','2025-10-29 21:55:59'),(31,'marca','Honor','2025-10-29 21:56:05'),(32,'marca','Motorola','2025-10-29 21:56:51'),(33,'marca','Nokia','2025-10-29 21:57:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Maldonado';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_maldonado`
--

LOCK TABLES `clientes_maldonado` WRITE;
/*!40000 ALTER TABLE `clientes_maldonado` DISABLE KEYS */;
INSERT INTO `clientes_maldonado` VALUES (1,'Fernando','DÃ­az','Celulares del Este','214567890019','Rambla 890','fernando@celuest.com','Celulares del Este S.A.','099 333 444',2,'2024-02-15',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'MÃ³nica','Torres',NULL,NULL,'Av. Gorlero 234','monica.torres@hotmail.com',NULL,'099 444 555',2,'2024-03-01',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(3,'Gonzalo Matias','Fernández Zeballos',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',2,'2025-10-28',1,'2025-10-28 17:51:07','2025-10-28 17:51:07'),(4,'Milagros','Bertochi',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',NULL,'2025-11-03',1,'2025-11-03 15:58:25','2025-11-03 15:58:25'),(5,'santiago','piriz',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',NULL,'2025-11-03',1,'2025-11-03 16:21:35','2025-11-03 16:21:35'),(6,'Gonzalo Matias sd','Fernández Zeballos dsds',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',NULL,'2025-11-03',1,'2025-11-03 17:37:25','2025-11-03 17:37:25'),(7,'Ezequiel ','Moreno',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','ezequiel@zarparuy.com','Other','0923',NULL,'2025-11-03',1,'2025-11-03 18:27:50','2025-11-03 18:27:50');
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
INSERT INTO `clientes_melo` VALUES (1,'Gustavo','RamÃ­rez','Tech Store Melo','219876543012','Av. Artigas 321','gustavo@techstore.com','Tech Store S.R.L.','099 777 888',4,'2024-02-05',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Silvia','NÃºÃ±ez',NULL,NULL,'Calle Treinta y Tres 654','silvia.nunez@gmail.com',NULL,'099 888 999',4,'2024-03-15',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Pando';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_pando`
--

LOCK TABLES `clientes_pando` WRITE;
/*!40000 ALTER TABLE `clientes_pando` DISABLE KEYS */;
INSERT INTO `clientes_pando` VALUES (1,'Roberto','GarcÃ­a','TecnoFix Pando','212345670018','Av. Wilson 1234','roberto@tecnofix.com','TecnoFix S.R.L.','099 111 222',1,'2024-01-20',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Patricia','LÃ³pez',NULL,NULL,'Calle Italia 567','patricia.lopez@gmail.com',NULL,'099 222 333',1,'2024-02-10',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(3,'Gonzalo Matias','Fernández Zeballos',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',NULL,'2025-11-03',1,'2025-11-03 20:15:10','2025-11-03 20:15:10');
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
INSERT INTO `clientes_paysandu` VALUES (1,'Ricardo','MÃ©ndez','MÃ³viles PaysandÃº','216543210011','Av. 18 de Julio 987','ricardo@moviles.com','MÃ³viles PaysandÃº S.A.','099 999 000',5,'2024-01-22',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Beatriz','Flores',NULL,NULL,'Calle Zorrilla 432','beatriz.flores@hotmail.com',NULL,'099 000 111',5,'2024-02-28',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
/*!40000 ALTER TABLE `clientes_paysandu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_rionegro`
--

DROP TABLE IF EXISTS `clientes_rionegro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_rionegro` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del cliente',
  `nombre_fantasia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasía o comercial',
  `rut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del cliente',
  `direccion` text COLLATE utf8mb4_unicode_ci COMMENT 'Dirección completa',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del cliente',
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Razón social',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Teléfono principal',
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  CONSTRAINT `fk_clientes_rionegro_vendedor` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal rionegro';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_rionegro`
--

LOCK TABLES `clientes_rionegro` WRITE;
/*!40000 ALTER TABLE `clientes_rionegro` DISABLE KEYS */;
INSERT INTO `clientes_rionegro` VALUES (1,'Gonzalo Matias','Fernández Zeballos',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',14,'2025-10-31',1,'2025-10-31 15:26:32','2025-10-31 15:26:32');
/*!40000 ALTER TABLE `clientes_rionegro` ENABLE KEYS */;
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
INSERT INTO `clientes_rivera` VALUES (1,'AndrÃ©s','Castro','Repuestos Norte','211234567015','Calle SarandÃ­ 456','andres@norte.com','Repuestos Norte Ltda.','099 555 666',3,'2024-01-18',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Claudia','BenÃ­tez',NULL,NULL,'Av. Brasil 789','claudia.benitez@yahoo.com',NULL,'099 666 777',3,'2024-02-20',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
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
INSERT INTO `clientes_salto` VALUES (1,'Pablo','Vargas','Phone Service Salto','213579246017','Av. Uruguay 765','pablo@phoneservice.com','Phone Service Ltda.','099 111 000',6,'2024-02-12',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Cecilia','Rojas',NULL,NULL,'Calle Artigas 210','cecilia.rojas@gmail.com',NULL,'099 222 111',6,'2024-03-08',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
/*!40000 ALTER TABLE `clientes_salto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_sanisidro`
--

DROP TABLE IF EXISTS `clientes_sanisidro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_sanisidro` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del cliente',
  `nombre_fantasia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasía o comercial',
  `rut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del cliente',
  `direccion` text COLLATE utf8mb4_unicode_ci COMMENT 'Dirección completa',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del cliente',
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Razón social',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Teléfono principal',
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  CONSTRAINT `fk_clientes_sanisidro_vendedor` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal sanisidro';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_sanisidro`
--

LOCK TABLES `clientes_sanisidro` WRITE;
/*!40000 ALTER TABLE `clientes_sanisidro` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes_sanisidro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes_soriano`
--

DROP TABLE IF EXISTS `clientes_soriano`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_soriano` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del cliente',
  `nombre_fantasia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre de fantasía o comercial',
  `rut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del cliente',
  `direccion` text COLLATE utf8mb4_unicode_ci COMMENT 'Dirección completa',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del cliente',
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Razón social',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Teléfono principal',
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  CONSTRAINT `fk_clientes_soriano_vendedor` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal soriano';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_soriano`
--

LOCK TABLES `clientes_soriano` WRITE;
/*!40000 ALTER TABLE `clientes_soriano` DISABLE KEYS */;
INSERT INTO `clientes_soriano` VALUES (1,'Gonzalo Matias','Fernández Zeballos',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',13,'2025-10-31',1,'2025-10-31 14:19:40','2025-10-31 14:19:40');
/*!40000 ALTER TABLE `clientes_soriano` ENABLE KEYS */;
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
INSERT INTO `clientes_tacuarembo` VALUES (1,'MartÃ­n','Acosta','Repuestos TBO','218642097014','Av. Batlle 543','martin@rptbo.com','Repuestos TBO S.R.L.','099 333 222',7,'2024-01-30',1,'2025-10-27 21:46:14','2025-10-27 21:46:14'),(2,'Gabriela','SuÃ¡rez',NULL,NULL,'Calle Rivera 876','gabriela.suarez@yahoo.com',NULL,'099 444 333',7,'2024-03-12',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
/*!40000 ALTER TABLE `clientes_tacuarembo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_sucursales`
--

DROP TABLE IF EXISTS `configuracion_sucursales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_sucursales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la sucursal',
  `es_principal` tinyint(1) DEFAULT '0' COMMENT '1 = Casa Principal, 0 = Sucursal normal',
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'DirecciÃ³n de la sucursal',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'TelÃ©fono de contacto',
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ciudad donde estÃ¡ ubicada',
  `activa` tinyint(1) DEFAULT '1' COMMENT 'Estado de la sucursal',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sucursal` (`sucursal`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_es_principal` (`es_principal`),
  KEY `idx_principal_activa` (`es_principal`,`activa`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ConfiguraciÃ³n y gestiÃ³n de sucursales del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sucursales`
--

LOCK TABLES `configuracion_sucursales` WRITE;
/*!40000 ALTER TABLE `configuracion_sucursales` DISABLE KEYS */;
INSERT INTO `configuracion_sucursales` VALUES (1,'maldonado',1,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-03 20:16:59'),(2,'melo',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-03 20:16:59'),(3,'pando',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:46:52'),(4,'paysandu',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11'),(5,'rionegro',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11'),(6,'rivera',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11'),(7,'salto',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11'),(8,'soriano',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11'),(9,'tacuarembo',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11');
/*!40000 ALTER TABLE `configuracion_sucursales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuenta_corriente_movimientos`
--

DROP TABLE IF EXISTS `cuenta_corriente_movimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuenta_corriente_movimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Sucursal',
  `cliente_id` int NOT NULL COMMENT 'ID del cliente',
  `cliente_nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente (cache)',
  `tipo` enum('venta','pago','ajuste') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de movimiento',
  `debe` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Monto que debe el cliente (ventas)',
  `haber` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Monto que paga el cliente (pagos)',
  `saldo` decimal(12,2) NOT NULL COMMENT 'Saldo acumulado despuÃ©s del movimiento',
  `venta_id` int DEFAULT NULL COMMENT 'ID de la venta relacionada (si aplica)',
  `pago_id` int DEFAULT NULL COMMENT 'ID del pago relacionado (si aplica)',
  `descripcion` text COLLATE utf8mb4_unicode_ci COMMENT 'DescripciÃ³n del movimiento',
  `fecha_movimiento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del movimiento',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_cliente` (`cliente_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_fecha` (`fecha_movimiento`),
  KEY `idx_venta` (`venta_id`),
  KEY `idx_pago` (`pago_id`),
  CONSTRAINT `cuenta_corriente_movimientos_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movimientos de cuenta corriente';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuenta_corriente_movimientos`
--

LOCK TABLES `cuenta_corriente_movimientos` WRITE;
/*!40000 ALTER TABLE `cuenta_corriente_movimientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `cuenta_corriente_movimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_transferencias`
--

DROP TABLE IF EXISTS `historial_transferencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_transferencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `producto_nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sucursal_origen` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sucursal_destino` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `usuario_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_envio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fecha_envio` (`fecha_envio`),
  KEY `idx_sucursal_destino` (`sucursal_destino`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `historial_transferencias_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_transferencias`
--

LOCK TABLES `historial_transferencias` WRITE;
/*!40000 ALTER TABLE `historial_transferencias` DISABLE KEYS */;
INSERT INTO `historial_transferencias` VALUES (1,10,'iphone 11 j','maldonado','paysandu',2,'admin@zarparuy.com','2025-11-03 13:37:34'),(2,10,'iphone 11 j','maldonado','pando',8,'admin@zarparuy.com','2025-11-03 13:37:56'),(3,10,'iphone 11 j','maldonado','melo',5,'admin@zarparuy.com','2025-11-03 13:50:53'),(4,10,'iphone 11 j','maldonado','melo',2,'admin@zarparuy.com','2025-11-03 13:55:25'),(5,10,'iphone 11 j','maldonado','pando',1,'admin@zarparuy.com','2025-11-03 13:55:25'),(6,10,'iphone 11 j','maldonado','pando',2,'admin@zarparuy.com','2025-11-03 13:56:25'),(7,10,'iphone 11 j','maldonado','paysandu',3,'admin@zarparuy.com','2025-11-03 13:56:25'),(8,10,'iphone 11 j','maldonado','melo',2,'admin@zarparuy.com','2025-11-03 14:01:19'),(9,10,'iphone 11 j','melo','maldonado',3,'admin@zarparuy.com','2025-11-03 17:36:37'),(10,10,'iphone 11 j','maldonado','pando',3,'admin@zarparuy.com','2025-11-03 20:18:17');
/*!40000 ALTER TABLE `historial_transferencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos_cuenta_corriente`
--

DROP TABLE IF EXISTS `pagos_cuenta_corriente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos_cuenta_corriente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Sucursal',
  `cliente_id` int NOT NULL COMMENT 'ID del cliente',
  `cliente_nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del cliente (cache)',
  `monto` decimal(12,2) NOT NULL COMMENT 'Monto del pago',
  `metodo_pago` enum('efectivo','transferencia') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'CÃ³mo pagÃ³ el abono',
  `comprobante` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NÃºmero de comprobante o referencia',
  `observaciones` text COLLATE utf8mb4_unicode_ci COMMENT 'Observaciones del pago',
  `fecha_pago` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del pago',
  `created_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Usuario que registrÃ³ el pago',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_cliente` (`cliente_id`),
  KEY `idx_fecha` (`fecha_pago`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pagos de cuenta corriente';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_cuenta_corriente`
--

LOCK TABLES `pagos_cuenta_corriente` WRITE;
/*!40000 ALTER TABLE `pagos_cuenta_corriente` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagos_cuenta_corriente` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CatÃ¡logo maestro de productos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (8,'Samsung S24 Ultra','Samsung',NULL,'Original',NULL,0,'2025-10-29 00:47:24','2025-10-29 01:09:39'),(10,'iphone 11 j','Iphone','Display','Incell jk','510031',1,'2025-10-29 01:01:04','2025-10-31 16:26:52'),(11,'Iphone 16 ','Iphone','Display','Incell jk',NULL,1,'2025-10-29 21:57:23','2025-10-29 21:57:23'),(12,'iphone 12/pro jk ','Iphone','Display','Otro',NULL,1,'2025-10-30 01:52:04','2025-10-30 01:52:04');
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
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock` int DEFAULT '0' COMMENT 'Cantidad disponible en esta sucursal',
  `stock_en_transito` int DEFAULT '0' COMMENT 'Stock enviado pero no confirmado',
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
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stock y precios por sucursal';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos_sucursal`
--

LOCK TABLES `productos_sucursal` WRITE;
/*!40000 ALTER TABLE `productos_sucursal` DISABLE KEYS */;
INSERT INTO `productos_sucursal` VALUES (57,8,'maldonado',165,0,3000.00,5,1,1,'2025-11-03 16:05:29'),(58,8,'pando',0,0,200.00,10,0,1,'2025-10-29 22:10:15'),(59,8,'rivera',0,0,200.00,10,0,1,'2025-10-29 22:10:15'),(60,8,'melo',0,0,41.00,10,0,1,'2025-10-29 22:10:15'),(61,8,'paysandu',0,0,35.00,10,0,1,'2025-10-29 22:10:15'),(62,8,'salto',0,0,520.00,10,0,1,'2025-10-29 22:10:15'),(63,8,'tacuarembo',0,0,242.00,10,0,1,'2025-10-29 22:10:16'),(71,10,'maldonado',103,0,1920.00,102,1,1,'2025-11-03 20:20:03'),(72,10,'pando',130,6,3000.00,10,0,1,'2025-11-03 20:18:17'),(73,10,'rivera',70,0,460.00,10,0,1,'2025-11-01 21:18:08'),(74,10,'melo',4,0,1400.00,10,0,1,'2025-11-03 17:36:09'),(75,10,'paysandu',39,0,2400.00,10,0,1,'2025-11-03 13:56:25'),(76,10,'salto',52,0,1400.00,10,0,1,'2025-10-31 16:23:25'),(77,10,'tacuarembo',35,3,1200.00,10,0,1,'2025-11-03 20:18:02'),(78,11,'maldonado',297,0,1450.00,10,1,1,'2025-11-03 17:38:34'),(79,11,'pando',0,0,200.00,10,0,1,'2025-10-29 22:09:40'),(80,11,'rivera',0,0,200.00,10,0,1,'2025-10-29 22:09:40'),(81,11,'melo',0,0,200.00,10,0,1,'2025-10-29 22:09:40'),(82,11,'paysandu',0,0,0.00,10,0,1,'2025-10-29 21:57:23'),(83,11,'salto',0,0,2200.00,10,0,1,'2025-10-29 22:09:40'),(84,11,'tacuarembo',0,0,410.00,10,0,1,'2025-10-29 22:09:40'),(85,12,'maldonado',143,0,2800.00,10,1,1,'2025-11-03 18:28:01'),(86,12,'pando',40,0,0.00,10,0,1,'2025-10-30 20:14:17'),(87,12,'rivera',0,0,0.00,10,0,1,'2025-10-30 01:52:04'),(88,12,'melo',0,0,0.00,10,0,1,'2025-11-01 21:18:08'),(89,12,'paysandu',0,0,0.00,10,0,1,'2025-10-30 01:52:04'),(90,12,'salto',0,0,0.00,10,0,1,'2025-10-30 01:52:04'),(91,12,'tacuarembo',0,0,0.00,10,0,1,'2025-10-30 01:52:04'),(95,10,'soriano',53,3,3000.00,10,0,1,'2025-11-03 17:36:09'),(96,11,'soriano',0,0,200.00,10,0,1,'2025-10-31 14:18:53'),(97,12,'soriano',0,0,0.00,10,0,1,'2025-10-31 14:18:53'),(98,10,'rionegro',14,0,3000.00,10,0,1,'2025-11-03 13:41:58'),(99,11,'rionegro',0,0,200.00,10,0,1,'2025-10-31 15:22:59'),(100,12,'rionegro',0,0,0.00,10,0,1,'2025-10-31 15:22:59'),(101,8,'rionegro',0,0,30.00,10,0,1,'2025-10-31 16:05:17'),(102,8,'soriano',0,0,30.00,10,0,1,'2025-10-31 16:05:17'),(103,10,'sanisidro',0,0,3000.00,10,0,1,'2025-11-03 17:33:59'),(104,11,'sanisidro',0,0,200.00,10,0,1,'2025-11-03 17:33:59'),(105,12,'sanisidro',0,0,0.00,10,0,1,'2025-11-03 17:33:59');
/*!40000 ALTER TABLE `productos_sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `resumen_cuenta_corriente`
--

DROP TABLE IF EXISTS `resumen_cuenta_corriente`;
/*!50001 DROP VIEW IF EXISTS `resumen_cuenta_corriente`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `resumen_cuenta_corriente` AS SELECT 
 1 AS `sucursal`,
 1 AS `cliente_id`,
 1 AS `cliente_nombre`,
 1 AS `total_debe`,
 1 AS `total_haber`,
 1 AS `saldo_actual`,
 1 AS `ultimo_movimiento`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `secuencias`
--

DROP TABLE IF EXISTS `secuencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `secuencias` (
  `nombre` varchar(50) NOT NULL,
  `valor` int NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `secuencias`
--

LOCK TABLES `secuencias` WRITE;
/*!40000 ALTER TABLE `secuencias` DISABLE KEYS */;
INSERT INTO `secuencias` VALUES ('transferencias',1,'2025-10-31 18:15:59');
/*!40000 ALTER TABLE `secuencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transferencias`
--

DROP TABLE IF EXISTS `transferencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transferencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'CÃ³digo Ãºnico: TRANS-YYYY-NNN',
  `fecha_envio` datetime NOT NULL COMMENT 'CuÃ¡ndo se enviÃ³ desde Casa Central',
  `fecha_recepcion` datetime DEFAULT NULL COMMENT 'CuÃ¡ndo se confirmÃ³ en sucursal',
  `sucursal_origen` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Siempre "maldonado" (Casa Central)',
  `sucursal_destino` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Sucursal que recibe',
  `estado` enum('pendiente','en_transito','recibida','completada','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente' COMMENT 'Estado actual de la transferencia',
  `usuario_envio` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email del usuario que enviÃ³',
  `usuario_recepcion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email del usuario que recibiÃ³',
  `total_productos` int NOT NULL COMMENT 'Cantidad de productos Ãºnicos',
  `total_unidades` int NOT NULL COMMENT 'Cantidad total de unidades',
  `notas_envio` text COLLATE utf8mb4_unicode_ci COMMENT 'Notas al momento del envÃ­o',
  `notas_recepcion` text COLLATE utf8mb4_unicode_ci COMMENT 'Notas al momento de recibir',
  `diferencias` text COLLATE utf8mb4_unicode_ci COMMENT 'DescripciÃ³n de faltantes/sobrantes',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_estado` (`estado`),
  KEY `idx_sucursal_destino` (`sucursal_destino`),
  KEY `idx_fecha_envio` (`fecha_envio`),
  KEY `idx_estado_sucursal` (`estado`,`sucursal_destino`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro principal de transferencias entre sucursales';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transferencias`
--

LOCK TABLES `transferencias` WRITE;
/*!40000 ALTER TABLE `transferencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `transferencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transferencias_detalle`
--

DROP TABLE IF EXISTS `transferencias_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transferencias_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transferencia_id` int NOT NULL COMMENT 'FK a transferencias',
  `producto_id` int NOT NULL COMMENT 'FK a productos',
  `producto_nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del producto (snapshot)',
  `producto_marca` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Marca del producto (snapshot)',
  `producto_tipo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo del producto (snapshot)',
  `cantidad_enviada` int NOT NULL COMMENT 'Cantidad que se enviÃ³',
  `cantidad_recibida` int DEFAULT NULL COMMENT 'Cantidad que se recibiÃ³ (puede diferir)',
  `cantidad_faltante` int DEFAULT '0' COMMENT 'Faltantes detectados',
  `cantidad_sobrante` int DEFAULT '0' COMMENT 'Sobrantes detectados',
  `stock_origen_antes` int NOT NULL COMMENT 'Stock en Maldonado antes de enviar',
  `stock_origen_despues` int NOT NULL COMMENT 'Stock en Maldonado despuÃ©s de enviar',
  `stock_destino_antes` int NOT NULL COMMENT 'Stock en destino antes de recibir',
  `stock_destino_despues` int DEFAULT NULL COMMENT 'Stock en destino despuÃ©s de recibir',
  `ventas_periodo` int DEFAULT '0' COMMENT 'Ventas que motivaron el envÃ­o',
  `fecha_inicio_ventas` date DEFAULT NULL COMMENT 'Inicio del perÃ­odo analizado',
  `fecha_fin_ventas` date DEFAULT NULL COMMENT 'Fin del perÃ­odo analizado',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transferencia` (`transferencia_id`),
  KEY `idx_producto` (`producto_id`),
  KEY `idx_transferencia_producto` (`transferencia_id`,`producto_id`),
  CONSTRAINT `transferencias_detalle_ibfk_1` FOREIGN KEY (`transferencia_id`) REFERENCES `transferencias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transferencias_detalle_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalle de productos por transferencia';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transferencias_detalle`
--

LOCK TABLES `transferencias_detalle` WRITE;
/*!40000 ALTER TABLE `transferencias_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `transferencias_detalle` ENABLE KEYS */;
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
  `rol` enum('administrador','gerente','vendedor','cajero') COLLATE utf8mb4_unicode_ci DEFAULT 'vendedor',
  `permisos_especiales` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON con permisos adicionales',
  `puede_aprobar_credito` tinyint(1) DEFAULT '0',
  `limite_descuento_maximo` decimal(5,2) DEFAULT '10.00' COMMENT 'MÃ¡ximo % de descuento que puede aplicar',
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Vendedores del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendedores`
--

LOCK TABLES `vendedores` WRITE;
/*!40000 ALTER TABLE `vendedores` DISABLE KEYS */;
INSERT INTO `vendedores` VALUES (1,'Jonathan Witt','Vendedor','vendedor',NULL,0,15.00,'pando','099123456','pando@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-01-15',1,'2025-10-27 21:46:14','2025-11-03 22:58:02'),(2,'Maria de los Milagros Bertochi','Vendedor','vendedor',NULL,0,15.00,'maldonado','099 234 567','maldonado@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-02-01',1,'2025-10-27 21:46:14','2025-10-29 23:18:03'),(3,'Jonathan Moreira','Vendedor','vendedor',NULL,0,15.00,'rivera','099 345 678','rivera@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-03-10',1,'2025-10-27 21:46:14','2025-10-29 23:18:03'),(4,'Ivan da rosa','Vendedor','vendedor',NULL,0,15.00,'melo','099 456 789','melo@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-01-20',1,'2025-10-27 21:46:14','2025-10-29 23:18:03'),(5,'Yandy Clavero','Vendedor','vendedor',NULL,0,15.00,'paysandu','099 567 890','paysandu@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-02-15',1,'2025-10-27 21:46:14','2025-10-29 23:18:03'),(6,'Diego Silva','Vendedor','vendedor',NULL,0,15.00,'salto','099 678 901','salto@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-03-05',1,'2025-10-27 21:46:14','2025-10-29 23:18:03'),(7,'Maicol Fagundez','Vendedor','vendedor',NULL,0,15.00,'tacuarembo','099 789 012','tacuarembo@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy','2024-01-25',1,'2025-10-27 21:46:14','2025-10-29 23:18:03'),(8,'Nicolas Fernandez','Director General','administrador','{\"acceso_total\": true, \"puede_modificar_roles\": true}',1,100.00,'Administrador ','093666885','admin@zarparuy.com','$2b$10$85X7U.Trf629Bz2fLIZj5.kQyInZ/1eM3AHzOKWQmbQA8zW.FAMdy',NULL,1,'2025-10-28 14:08:00','2025-11-03 23:23:28'),(9,'Carlos Test Mendez','Vendedor','vendedor',NULL,0,10.00,'pando','099-888-777','carlos.test@zarparuy.com','zarpar123',NULL,0,'2025-10-31 02:04:57','2025-10-31 04:13:59'),(11,'Nadia Condes','Vendedor','vendedor',NULL,0,10.00,'mercedes','093666885','mercedes@zarparuy.com','zarpar123',NULL,0,'2025-10-31 02:37:40','2025-10-31 04:37:35'),(12,'Carlos Mercedes','Vendedor','vendedor',NULL,0,10.00,'mercedes','099-888-777','carlos@mercedes.zarpar.com','mercedes123',NULL,0,'2025-10-31 02:51:47','2025-10-31 04:24:50'),(13,'Sol Pascual','Vendedor','vendedor',NULL,0,10.00,'soriano',NULL,'soriano@zarparuy.com','zarpar123',NULL,1,'2025-10-31 14:19:16','2025-10-31 14:19:16'),(14,'Sandra Zeballos','Vendedor','vendedor',NULL,0,10.00,'rionegro','+59893666885','rionegro@zarparuy.com','zarpar123',NULL,1,'2025-10-31 15:25:34','2025-10-31 15:25:34'),(15,'FRANCISCO DUBRA','Administrador','vendedor',NULL,0,10.00,'sanisidro','+59893666885','fran@zarparuy.com','zarpar123',NULL,1,'2025-11-03 17:34:20','2025-11-03 17:34:20');
/*!40000 ALTER TABLE `vendedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_venta` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'NÃºmero Ãºnico de venta (ej: PANDO-2025-0001)',
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Sucursal donde se realizÃ³ la venta',
  `cliente_id` int NOT NULL COMMENT 'ID del cliente (dinÃ¡mico segÃºn sucursal)',
  `cliente_nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre completo del cliente (cache)',
  `vendedor_id` int NOT NULL COMMENT 'ID del vendedor',
  `vendedor_nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del vendedor (cache)',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Subtotal antes de descuentos',
  `descuento` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Monto del descuento aplicado',
  `total` decimal(12,2) NOT NULL COMMENT 'Total a pagar',
  `metodo_pago` enum('efectivo','transferencia','cuenta_corriente') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MÃ©todo de pago utilizado',
  `estado_pago` enum('pagado','pendiente','parcial') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pagado' COMMENT 'Estado del pago',
  `saldo_pendiente` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Saldo pendiente (para cuenta corriente)',
  `fecha_venta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la venta',
  `fecha_vencimiento` date DEFAULT NULL COMMENT 'Fecha de vencimiento (para cuenta corriente)',
  `observaciones` text COLLATE utf8mb4_unicode_ci COMMENT 'Observaciones adicionales',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_venta` (`numero_venta`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_cliente` (`cliente_id`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_fecha` (`fecha_venta`),
  KEY `idx_metodo_pago` (`metodo_pago`),
  KEY `idx_estado_pago` (`estado_pago`),
  KEY `idx_numero_venta` (`numero_venta`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de ventas del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas_detalle`
--

DROP TABLE IF EXISTS `ventas_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venta_id` int NOT NULL COMMENT 'ID de la venta',
  `producto_id` int NOT NULL COMMENT 'ID del producto',
  `producto_nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del producto',
  `producto_marca` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Marca del producto',
  `producto_codigo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CÃ³digo del producto',
  `cantidad` int NOT NULL COMMENT 'Cantidad vendida',
  `precio_unitario` decimal(10,2) NOT NULL COMMENT 'Precio unitario al momento de la venta',
  `subtotal` decimal(12,2) NOT NULL COMMENT 'Subtotal (cantidad * precio_unitario)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_venta` (`venta_id`),
  KEY `idx_producto` (`producto_id`),
  CONSTRAINT `ventas_detalle_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ventas_detalle_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalle de productos en cada venta';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas_detalle`
--

LOCK TABLES `ventas_detalle` WRITE;
/*!40000 ALTER TABLE `ventas_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `resumen_cuenta_corriente`
--

/*!50001 DROP VIEW IF EXISTS `resumen_cuenta_corriente`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `resumen_cuenta_corriente` AS select `cuenta_corriente_movimientos`.`sucursal` AS `sucursal`,`cuenta_corriente_movimientos`.`cliente_id` AS `cliente_id`,`cuenta_corriente_movimientos`.`cliente_nombre` AS `cliente_nombre`,sum(`cuenta_corriente_movimientos`.`debe`) AS `total_debe`,sum(`cuenta_corriente_movimientos`.`haber`) AS `total_haber`,(sum(`cuenta_corriente_movimientos`.`debe`) - sum(`cuenta_corriente_movimientos`.`haber`)) AS `saldo_actual`,max(`cuenta_corriente_movimientos`.`fecha_movimiento`) AS `ultimo_movimiento` from `cuenta_corriente_movimientos` group by `cuenta_corriente_movimientos`.`sucursal`,`cuenta_corriente_movimientos`.`cliente_id`,`cuenta_corriente_movimientos`.`cliente_nombre` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-03 23:52:27
