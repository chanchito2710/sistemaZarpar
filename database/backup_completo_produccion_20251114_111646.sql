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
-- Table structure for table `caja`
--

DROP TABLE IF EXISTS `caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_actual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sucursal` (`sucursal`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_caja_sucursal` (`sucursal`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caja`
--

LOCK TABLES `caja` WRITE;
/*!40000 ALTER TABLE `caja` DISABLE KEYS */;
INSERT INTO `caja` VALUES (1,'maldonado',0.00,'2025-11-05 01:20:40','2025-11-14 00:02:53'),(2,'melo',0.00,'2025-11-05 01:20:40','2025-11-14 00:02:53'),(3,'pando',0.00,'2025-11-05 01:20:40','2025-11-14 00:02:53'),(4,'paysandu',0.00,'2025-11-05 01:20:40','2025-11-14 00:02:53'),(5,'rionegro',0.00,'2025-11-05 01:20:40','2025-11-05 01:20:40'),(6,'rivera',0.00,'2025-11-05 01:20:40','2025-11-14 00:02:53'),(7,'salto',0.00,'2025-11-05 01:20:40','2025-11-14 00:02:53'),(8,'sanisidro',0.00,'2025-11-05 01:20:40','2025-11-14 00:02:53'),(9,'soriano',0.00,'2025-11-05 01:20:40','2025-11-14 00:02:53'),(10,'tacuarembo',0.00,'2025-11-05 01:20:40','2025-11-14 00:02:53');
/*!40000 ALTER TABLE `caja` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_productos`
--

LOCK TABLES `categorias_productos` WRITE;
/*!40000 ALTER TABLE `categorias_productos` DISABLE KEYS */;
INSERT INTO `categorias_productos` VALUES (9,'tipo','Display','2025-10-28 19:40:36'),(10,'tipo','Batería','2025-10-28 19:40:36'),(11,'tipo','Flex','2025-10-28 19:40:36'),(12,'tipo','Botón','2025-10-28 19:40:36'),(13,'tipo','Herramienta','2025-10-28 19:40:36'),(15,'tipo','Antena','2025-10-28 19:40:36'),(16,'tipo','Placa Carga','2025-10-28 19:40:36'),(17,'tipo','Main Sub','2025-10-28 19:40:36'),(18,'tipo','Otro','2025-10-28 19:40:36'),(19,'calidad','Incell jk','2025-10-28 21:04:41'),(20,'calidad','Oled','2025-10-28 21:04:41'),(21,'calidad','Original','2025-10-28 21:04:41'),(22,'calidad','Oem','2025-10-28 21:04:41'),(23,'calidad','Incell zy','2025-10-28 21:04:41'),(24,'calidad','AAA','2025-10-28 21:04:41'),(25,'calidad','Otro','2025-10-28 21:04:41'),(26,'marca','Iphone','2025-10-29 21:55:23'),(27,'marca','Samsung','2025-10-29 21:55:31'),(28,'marca','Huawei','2025-10-29 21:55:42'),(29,'marca','Xiaomi','2025-10-29 21:55:50'),(30,'marca','Tcl','2025-10-29 21:55:59'),(31,'marca','Honor','2025-10-29 21:56:05'),(32,'marca','Motorola','2025-10-29 21:56:51'),(33,'marca','Nokia','2025-10-29 21:57:00'),(34,'calidad','incell BH','2025-11-04 16:56:47');
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
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  KEY `idx_clientes_maldonado_email` (`email`),
  KEY `idx_clientes_maldonado_telefono` (`telefono`),
  KEY `idx_clientes_maldonado_vendedor` (`vendedor_id`),
  CONSTRAINT `clientes_maldonado_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Maldonado';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_maldonado`
--

LOCK TABLES `clientes_maldonado` WRITE;
/*!40000 ALTER TABLE `clientes_maldonado` DISABLE KEYS */;
INSERT INTO `clientes_maldonado` VALUES (1,'Fernando','Díaz','Celulares del Este','214567890019','Rambla 890','fernando@celuest.com','Celulares del Este S.A.','099 333 444',2,'2024-02-15',1,'2025-10-27 21:46:14','2025-11-05 21:45:12'),(2,'Mónica','Torres',NULL,NULL,'Av. Gorlero 234','monica.torres@hotmail.com',NULL,'099 444 555',2,'2024-03-01',1,'2025-10-27 21:46:14','2025-11-05 21:45:12'),(3,'Gonzalo Matias','Fernández Zeballos',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',2,'2025-10-28',1,'2025-10-28 17:51:07','2025-10-28 17:51:07'),(4,'Milagros','Bertochi',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',NULL,'2025-11-03',1,'2025-11-03 15:58:25','2025-11-03 15:58:25'),(5,'santiago','piriz',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',NULL,'2025-11-03',1,'2025-11-03 16:21:35','2025-11-03 16:21:35'),(6,'Gonzalo Matias sd','Fernández Zeballos dsds',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',NULL,'2025-11-03',1,'2025-11-03 17:37:25','2025-11-03 17:37:25'),(7,'Ezequiel ','Moreno',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','ezequiel@zarparuy.com','Other','0923',NULL,'2025-11-03',1,'2025-11-03 18:27:50','2025-11-03 18:27:50');
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
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  KEY `idx_clientes_melo_email` (`email`),
  KEY `idx_clientes_melo_telefono` (`telefono`),
  KEY `idx_clientes_melo_vendedor` (`vendedor_id`),
  CONSTRAINT `clientes_melo_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Melo';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_melo`
--

LOCK TABLES `clientes_melo` WRITE;
/*!40000 ALTER TABLE `clientes_melo` DISABLE KEYS */;
INSERT INTO `clientes_melo` VALUES (1,'Gustavo','Ramírez','Tech Store Melo','219876543012','Av. Artigas 321','gustavo@techstore.com','Tech Store S.R.L.','099 777 888',4,'2024-02-05',1,'2025-10-27 21:46:14','2025-11-05 21:45:12'),(2,'Silvia','Núñez',NULL,NULL,'Calle Treinta y Tres 654','silvia.nunez@gmail.com',NULL,'099 888 999',4,'2024-03-15',1,'2025-10-27 21:46:14','2025-11-05 21:45:12');
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
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  KEY `idx_clientes_pando_email` (`email`),
  KEY `idx_clientes_pando_telefono` (`telefono`),
  KEY `idx_clientes_pando_vendedor` (`vendedor_id`),
  CONSTRAINT `clientes_pando_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Pando';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_pando`
--

LOCK TABLES `clientes_pando` WRITE;
/*!40000 ALTER TABLE `clientes_pando` DISABLE KEYS */;
INSERT INTO `clientes_pando` VALUES (1,'Roberto','García','TecnoFix Pando','212345670018','Av. Wilson 1234','roberto@tecnofix.com','TecnoFix S.R.L.','099 111 222',1,'2024-01-20',1,'2025-10-27 21:46:14','2025-11-05 21:45:12'),(2,'Patricia','López',NULL,NULL,'Calle Italia 567','patricia.lopez@gmail.com',NULL,'099 222 333',1,'2024-02-10',1,'2025-10-27 21:46:14','2025-11-05 21:45:12'),(3,'Gonzalo Matias','Fernández Zeballos',NULL,NULL,'18 de Julio 953, Maldonado Departamento de Maldonado','gonzalofernandez2013.gf@gmail.com','Other','093666885',NULL,'2025-11-03',1,'2025-11-03 20:15:10','2025-11-03 20:15:10'),(4,'Nicolas','Fernandez',NULL,NULL,'18 de julio 953 ','nicofernandez@gmail.com',NULL,'093333333',1,'2025-11-06',1,'2025-11-06 20:48:47','2025-11-06 20:48:47');
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
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  KEY `idx_clientes_paysandu_email` (`email`),
  KEY `idx_clientes_paysandu_telefono` (`telefono`),
  KEY `idx_clientes_paysandu_vendedor` (`vendedor_id`),
  CONSTRAINT `clientes_paysandu_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal PaysandÃº';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_paysandu`
--

LOCK TABLES `clientes_paysandu` WRITE;
/*!40000 ALTER TABLE `clientes_paysandu` DISABLE KEYS */;
INSERT INTO `clientes_paysandu` VALUES (1,'Ricardo','Méndez','MÃ³viles PaysandÃº','216543210011','Av. 18 de Julio 987','ricardo@moviles.com','MÃ³viles PaysandÃº S.A.','099 999 000',5,'2024-01-22',1,'2025-10-27 21:46:14','2025-11-05 21:45:12'),(2,'Beatriz','Flores',NULL,NULL,'Calle Zorrilla 432','beatriz.flores@hotmail.com',NULL,'099 000 111',5,'2024-02-28',1,'2025-10-27 21:46:14','2025-10-27 21:46:14');
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
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  KEY `idx_clientes_rionegro_email` (`email`),
  KEY `idx_clientes_rionegro_telefono` (`telefono`),
  KEY `idx_clientes_rionegro_vendedor` (`vendedor_id`),
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
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  KEY `idx_clientes_rivera_email` (`email`),
  KEY `idx_clientes_rivera_telefono` (`telefono`),
  KEY `idx_clientes_rivera_vendedor` (`vendedor_id`),
  CONSTRAINT `clientes_rivera_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal Rivera';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_rivera`
--

LOCK TABLES `clientes_rivera` WRITE;
/*!40000 ALTER TABLE `clientes_rivera` DISABLE KEYS */;
INSERT INTO `clientes_rivera` VALUES (1,'Andrés','Castro','Repuestos Norte','211234567015','Calle Sarandí 456','andres@norte.com','Repuestos Norte Ltda.','099 555 666',3,'2024-01-18',1,'2025-10-27 21:46:14','2025-11-05 21:45:12'),(2,'Claudia','Benítez',NULL,NULL,'Av. Brasil 789','claudia.benitez@yahoo.com',NULL,'099 666 777',3,'2024-02-20',1,'2025-10-27 21:46:14','2025-11-05 21:45:12');
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
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  KEY `idx_clientes_salto_email` (`email`),
  KEY `idx_clientes_salto_telefono` (`telefono`),
  KEY `idx_clientes_salto_vendedor` (`vendedor_id`),
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
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  KEY `idx_clientes_sanisidro_email` (`email`),
  KEY `idx_clientes_sanisidro_telefono` (`telefono`),
  KEY `idx_clientes_sanisidro_vendedor` (`vendedor_id`),
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
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  KEY `idx_clientes_soriano_email` (`email`),
  KEY `idx_clientes_soriano_telefono` (`telefono`),
  KEY `idx_clientes_soriano_vendedor` (`vendedor_id`),
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
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendedor_id` int DEFAULT NULL COMMENT 'ID del vendedor asignado',
  `fecha_registro` date NOT NULL DEFAULT (curdate()) COMMENT 'Fecha de registro',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del cliente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`,`apellido`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_rut` (`rut`),
  KEY `idx_clientes_tacuarembo_email` (`email`),
  KEY `idx_clientes_tacuarembo_telefono` (`telefono`),
  KEY `idx_clientes_tacuarembo_vendedor` (`vendedor_id`),
  CONSTRAINT `clientes_tacuarembo_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes de sucursal TacuarembÃ³';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_tacuarembo`
--

LOCK TABLES `clientes_tacuarembo` WRITE;
/*!40000 ALTER TABLE `clientes_tacuarembo` DISABLE KEYS */;
INSERT INTO `clientes_tacuarembo` VALUES (1,'Martín','Acosta','Repuestos TBO','218642097014','Av. Batlle 543','martin@rptbo.com','Repuestos TBO S.R.L.','099 333 222',7,'2024-01-30',1,'2025-10-27 21:46:14','2025-11-05 21:45:12'),(2,'Gabriela','Suárez',NULL,NULL,'Calle Rivera 876','gabriela.suarez@yahoo.com',NULL,'099 444 333',7,'2024-03-12',1,'2025-10-27 21:46:14','2025-11-05 21:45:12');
/*!40000 ALTER TABLE `clientes_tacuarembo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comisiones_por_vendedor`
--

DROP TABLE IF EXISTS `comisiones_por_vendedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comisiones_por_vendedor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendedor_id` int NOT NULL,
  `tipo_producto` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_comision` decimal(10,2) NOT NULL DEFAULT '0.00',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vendedor_tipo` (`vendedor_id`,`tipo_producto`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_tipo` (`tipo_producto`),
  CONSTRAINT `comisiones_por_vendedor_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Comisiones personalizadas por vendedor y tipo de producto';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comisiones_por_vendedor`
--

LOCK TABLES `comisiones_por_vendedor` WRITE;
/*!40000 ALTER TABLE `comisiones_por_vendedor` DISABLE KEYS */;
/*!40000 ALTER TABLE `comisiones_por_vendedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comisiones_vendedores`
--

DROP TABLE IF EXISTS `comisiones_vendedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comisiones_vendedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendedor_id` int NOT NULL,
  `venta_id` int DEFAULT NULL,
  `pago_cuenta_corriente_id` int DEFAULT NULL,
  `cliente_id` int NOT NULL,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `producto_id` int NOT NULL,
  `producto_nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_producto` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int DEFAULT '1',
  `monto_comision` decimal(10,2) NOT NULL,
  `monto_cobrado` decimal(10,2) DEFAULT '0.00',
  `monto_pendiente` decimal(10,2) NOT NULL,
  `fecha_comision` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cobro` timestamp NULL DEFAULT NULL,
  `estado` enum('pendiente','parcial','pagada','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  KEY `idx_vendedor_fecha` (`vendedor_id`,`fecha_comision`),
  KEY `idx_sucursal_fecha` (`sucursal`,`fecha_comision`),
  KEY `idx_cliente` (`cliente_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_venta` (`venta_id`),
  CONSTRAINT `comisiones_vendedores_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`),
  CONSTRAINT `comisiones_vendedores_ibfk_2` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`),
  CONSTRAINT `comisiones_vendedores_ibfk_3` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comisiones_vendedores`
--

LOCK TABLES `comisiones_vendedores` WRITE;
/*!40000 ALTER TABLE `comisiones_vendedores` DISABLE KEYS */;
/*!40000 ALTER TABLE `comisiones_vendedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_comisiones`
--

DROP TABLE IF EXISTS `configuracion_comisiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_comisiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_comision` decimal(10,2) NOT NULL DEFAULT '0.00',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tipo` (`tipo`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_comisiones`
--

LOCK TABLES `configuracion_comisiones` WRITE;
/*!40000 ALTER TABLE `configuracion_comisiones` DISABLE KEYS */;
INSERT INTO `configuracion_comisiones` VALUES (1,'Display',150.00,1,'2025-11-04 21:18:48','2025-11-04 21:18:48'),(2,'Batería',100.00,1,'2025-11-04 21:18:48','2025-11-06 05:32:37'),(3,'Placa Carga',50.00,1,'2025-11-04 21:18:48','2025-11-04 21:18:48'),(4,'Flex',50.00,1,'2025-11-04 21:18:48','2025-11-04 21:18:48'),(5,'Botón',30.00,1,'2025-11-04 21:18:48','2025-11-06 05:32:37'),(6,'Antena',30.00,1,'2025-11-04 21:18:48','2025-11-04 21:18:48');
/*!40000 ALTER TABLE `configuracion_comisiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_descuentos_sucursal`
--

DROP TABLE IF EXISTS `configuracion_descuentos_sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_descuentos_sucursal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descuento_habilitado` tinyint(1) DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sucursal` (`sucursal`),
  KEY `idx_sucursal` (`sucursal`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_descuentos_sucursal`
--

LOCK TABLES `configuracion_descuentos_sucursal` WRITE;
/*!40000 ALTER TABLE `configuracion_descuentos_sucursal` DISABLE KEYS */;
INSERT INTO `configuracion_descuentos_sucursal` VALUES (1,'pando',0,'2025-11-11 18:42:55',NULL),(2,'maldonado',0,'2025-11-11 19:57:37',NULL),(3,'rivera',0,'2025-11-07 02:12:26',NULL),(4,'melo',0,'2025-11-07 02:12:26',NULL),(5,'paysandu',0,'2025-11-07 02:12:26',NULL),(6,'salto',0,'2025-11-07 02:12:26',NULL),(7,'tacuarembo',0,'2025-11-07 02:12:26',NULL),(8,'rionegro',0,'2025-11-07 02:12:26',NULL),(9,'sanisidro',0,'2025-11-07 02:12:26',NULL),(10,'soriano',0,'2025-11-07 02:12:26',NULL);
/*!40000 ALTER TABLE `configuracion_descuentos_sucursal` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ConfiguraciÃ³n y gestiÃ³n de sucursales del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sucursales`
--

LOCK TABLES `configuracion_sucursales` WRITE;
/*!40000 ALTER TABLE `configuracion_sucursales` DISABLE KEYS */;
INSERT INTO `configuracion_sucursales` VALUES (1,'maldonado',1,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-13 19:15:51'),(2,'melo',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-03 20:16:59'),(3,'pando',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:46:52'),(4,'paysandu',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11'),(5,'rionegro',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11'),(6,'rivera',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11'),(7,'salto',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11'),(8,'soriano',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11'),(9,'tacuarembo',0,NULL,NULL,NULL,1,'2025-11-01 20:28:45','2025-11-01 20:29:11');
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
  KEY `idx_cuenta_corriente_fecha` (`fecha_movimiento`),
  KEY `idx_cuenta_corriente_cliente` (`cliente_id`),
  KEY `idx_cuenta_corriente_sucursal` (`sucursal`),
  CONSTRAINT `cuenta_corriente_movimientos_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movimientos de cuenta corriente';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuenta_corriente_movimientos`
--

LOCK TABLES `cuenta_corriente_movimientos` WRITE;
/*!40000 ALTER TABLE `cuenta_corriente_movimientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `cuenta_corriente_movimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devoluciones_reemplazos`
--

DROP TABLE IF EXISTS `devoluciones_reemplazos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devoluciones_reemplazos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `venta_id` int NOT NULL,
  `venta_detalle_id` int DEFAULT NULL,
  `numero_venta` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `producto_id` int NOT NULL,
  `producto_nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` int NOT NULL,
  `cliente_nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('devolucion','reemplazo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad_reemplazada` int DEFAULT '1',
  `metodo_devolucion` enum('cuenta_corriente','saldo_favor') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monto_devuelto` decimal(10,2) DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `procesado_por` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_venta` datetime NOT NULL,
  `fecha_proceso` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_venta_id` (`venta_id`),
  KEY `idx_cliente_id` (`cliente_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_fecha_proceso` (`fecha_proceso`),
  KEY `idx_venta_detalle` (`venta_detalle_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devoluciones_reemplazos`
--

LOCK TABLES `devoluciones_reemplazos` WRITE;
/*!40000 ALTER TABLE `devoluciones_reemplazos` DISABLE KEYS */;
/*!40000 ALTER TABLE `devoluciones_reemplazos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_cambios_comisiones`
--

DROP TABLE IF EXISTS `historial_cambios_comisiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_cambios_comisiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `configuracion_comision_id` int NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_anterior` decimal(10,2) NOT NULL,
  `monto_nuevo` decimal(10,2) NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `usuario_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_cambio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `configuracion_comision_id` (`configuracion_comision_id`),
  KEY `idx_fecha` (`fecha_cambio`),
  KEY `idx_tipo` (`tipo`),
  CONSTRAINT `historial_cambios_comisiones_ibfk_1` FOREIGN KEY (`configuracion_comision_id`) REFERENCES `configuracion_comisiones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_cambios_comisiones`
--

LOCK TABLES `historial_cambios_comisiones` WRITE;
/*!40000 ALTER TABLE `historial_cambios_comisiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_cambios_comisiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_pagos_comisiones`
--

DROP TABLE IF EXISTS `historial_pagos_comisiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_pagos_comisiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comision_id` int NOT NULL,
  `pago_cuenta_corriente_id` int DEFAULT NULL,
  `monto_pagado` decimal(10,2) NOT NULL,
  `monto_pendiente_antes` decimal(10,2) NOT NULL,
  `monto_pendiente_despues` decimal(10,2) NOT NULL,
  `remanente_usado` decimal(10,2) DEFAULT '0.00',
  `fecha_pago` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notas` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_comision` (`comision_id`),
  KEY `idx_fecha` (`fecha_pago`),
  CONSTRAINT `historial_pagos_comisiones_ibfk_1` FOREIGN KEY (`comision_id`) REFERENCES `comisiones_vendedores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_pagos_comisiones`
--

LOCK TABLES `historial_pagos_comisiones` WRITE;
/*!40000 ALTER TABLE `historial_pagos_comisiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_pagos_comisiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_stock`
--

DROP TABLE IF EXISTS `historial_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `producto_id` int NOT NULL,
  `producto_nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` int DEFAULT NULL,
  `cliente_nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock_anterior` int NOT NULL DEFAULT '0',
  `stock_nuevo` int NOT NULL DEFAULT '0',
  `stock_fallas_anterior` int NOT NULL DEFAULT '0',
  `stock_fallas_nuevo` int NOT NULL DEFAULT '0',
  `tipo_movimiento` enum('venta','devolucion_stock_principal','devolucion_stock_fallas','reemplazo','ajuste_manual','transferencia_entrada','transferencia_salida') COLLATE utf8mb4_unicode_ci NOT NULL,
  `referencia` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'N° de venta, ajuste o transferencia',
  `usuario_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_producto_id` (`producto_id`),
  KEY `idx_cliente_id` (`cliente_id`),
  KEY `idx_tipo_movimiento` (`tipo_movimiento`),
  KEY `idx_usuario_email` (`usuario_email`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de movimientos de stock por producto y sucursal';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_stock`
--

LOCK TABLES `historial_stock` WRITE;
/*!40000 ALTER TABLE `historial_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_stock` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_transferencias`
--

LOCK TABLES `historial_transferencias` WRITE;
/*!40000 ALTER TABLE `historial_transferencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_transferencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_caja`
--

DROP TABLE IF EXISTS `movimientos_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_movimiento` enum('ingreso_venta','ingreso_cuenta_corriente','envio','ajuste_manual','pago_comision','gasto','egreso_devolucion','transferencia_salida','transferencia_entrada') COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `monto_anterior` decimal(10,2) NOT NULL,
  `monto_nuevo` decimal(10,2) NOT NULL,
  `concepto` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `venta_id` int DEFAULT NULL,
  `pago_cuenta_corriente_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `usuario_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_tipo_movimiento` (`tipo_movimiento`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_venta_id` (`venta_id`),
  KEY `idx_pago_cc_id` (`pago_cuenta_corriente_id`),
  KEY `idx_movimientos_caja_sucursal` (`sucursal`),
  KEY `idx_movimientos_caja_fecha` (`created_at`),
  KEY `idx_movimientos_caja_tipo` (`tipo_movimiento`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_caja`
--

LOCK TABLES `movimientos_caja` WRITE;
/*!40000 ALTER TABLE `movimientos_caja` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_caja` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pagos de cuenta corriente';
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
  KEY `idx_codigo_barras` (`codigo_barras`),
  KEY `idx_productos_codigo_barras` (`codigo_barras`),
  KEY `idx_productos_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=299 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CatÃ¡logo maestro de productos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (297,'Iphone 11 ','Iphone','Display','Incell jk',NULL,1,'2025-11-11 21:50:30','2025-11-11 21:50:30'),(298,'Iphone 12/pro','Iphone','Display','Incell jk',NULL,1,'2025-11-11 22:00:12','2025-11-11 22:00:12');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_producto_delete` BEFORE DELETE ON `productos` FOR EACH ROW BEGIN
  DECLARE venta_count INT;
  
  SELECT COUNT(*) INTO venta_count 
  FROM ventas_detalle 
  WHERE producto_id = OLD.id;
  
  IF venta_count > 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar producto con ventas asociadas. Desactivar en su lugar.';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
  `stock_fallas` int DEFAULT '0',
  `stock_en_transito` int DEFAULT '0' COMMENT 'Stock enviado pero no confirmado',
  `precio` decimal(10,2) NOT NULL COMMENT 'Precio de venta en esta sucursal',
  `stock_minimo` int DEFAULT '10' COMMENT 'Stock mÃ­nimo para alertas',
  `es_stock_principal` tinyint(1) DEFAULT '0' COMMENT '1 = Stock principal (Maldonado), 0 = Stock local',
  `activo` tinyint(1) DEFAULT '1' COMMENT '1 = Producto disponible en esta sucursal, 0 = No disponible',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de Ãºltima actualizaciÃ³n',
  `recibidos_recientes` int DEFAULT '0' COMMENT 'Cantidad de unidades recién recibidas (indicador temporal)',
  `fecha_ultima_recepcion` timestamp NULL DEFAULT NULL COMMENT 'Fecha y hora de la última recepción de mercadería',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_producto_sucursal` (`producto_id`,`sucursal`) COMMENT 'Un producto solo puede tener un registro por sucursal',
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_stock` (`stock`),
  KEY `idx_es_stock_principal` (`es_stock_principal`),
  KEY `idx_activo` (`activo`),
  KEY `idx_fecha_ultima_recepcion` (`fecha_ultima_recepcion`),
  KEY `idx_productos_sucursal_producto` (`producto_id`),
  KEY `idx_productos_sucursal_sucursal` (`sucursal`),
  KEY `idx_productos_sucursal_stock` (`stock`),
  CONSTRAINT `productos_sucursal_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4502 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stock y precios por sucursal';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos_sucursal`
--

LOCK TABLES `productos_sucursal` WRITE;
/*!40000 ALTER TABLE `productos_sucursal` DISABLE KEYS */;
INSERT INTO `productos_sucursal` VALUES (4482,297,'maldonado',0,0,0,600.00,10,1,1,'2025-11-14 00:02:53',0,NULL),(4483,297,'melo',0,0,0,600.00,10,0,1,'2025-11-11 21:59:09',0,NULL),(4484,297,'pando',0,0,0,500.00,10,0,1,'2025-11-11 21:59:09',0,NULL),(4485,297,'paysandu',0,0,0,500.00,10,0,1,'2025-11-11 21:59:09',0,NULL),(4486,297,'rionegro',0,0,0,550.00,10,0,1,'2025-11-11 21:59:09',0,NULL),(4487,297,'rivera',0,0,0,600.00,10,0,1,'2025-11-11 21:59:09',0,NULL),(4488,297,'salto',0,0,0,560.00,10,0,1,'2025-11-11 21:59:09',0,NULL),(4489,297,'sanisidro',0,0,0,660.00,10,0,1,'2025-11-11 21:59:09',0,NULL),(4490,297,'soriano',0,0,0,60.00,10,0,1,'2025-11-11 21:59:09',0,NULL),(4491,297,'tacuarembo',0,0,0,0.00,10,0,1,'2025-11-14 00:02:53',0,NULL),(4492,298,'maldonado',0,0,0,500.00,10,1,1,'2025-11-14 00:02:53',0,NULL),(4493,298,'melo',0,0,0,5000.00,10,0,1,'2025-11-11 22:02:13',0,NULL),(4494,298,'pando',0,0,0,600.00,10,0,1,'2025-11-11 22:02:13',0,NULL),(4495,298,'paysandu',0,0,0,5540.00,10,0,1,'2025-11-11 22:02:13',0,NULL),(4496,298,'rionegro',0,0,0,660.00,10,0,1,'2025-11-11 22:02:13',0,NULL),(4497,298,'rivera',0,0,0,550.00,10,0,1,'2025-11-11 22:02:13',0,NULL),(4498,298,'salto',0,0,0,50.00,10,0,1,'2025-11-11 22:02:13',0,NULL),(4499,298,'sanisidro',0,0,0,60.00,10,0,1,'2025-11-11 22:02:13',0,NULL),(4500,298,'soriano',0,0,0,0.00,10,0,1,'2025-11-14 00:02:53',0,NULL),(4501,298,'tacuarembo',0,0,0,0.00,10,0,1,'2025-11-14 00:02:53',0,NULL);
/*!40000 ALTER TABLE `productos_sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remanentes_comisiones`
--

DROP TABLE IF EXISTS `remanentes_comisiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `remanentes_comisiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendedor_id` int NOT NULL,
  `cliente_id` int NOT NULL,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_remanente` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vendedor_cliente` (`vendedor_id`,`cliente_id`,`sucursal`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_cliente` (`cliente_id`),
  CONSTRAINT `remanentes_comisiones_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `remanentes_comisiones`
--

LOCK TABLES `remanentes_comisiones` WRITE;
/*!40000 ALTER TABLE `remanentes_comisiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `remanentes_comisiones` ENABLE KEYS */;
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
-- Table structure for table `saldos_favor_clientes`
--

DROP TABLE IF EXISTS `saldos_favor_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saldos_favor_clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` int NOT NULL,
  `cliente_nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `saldo_actual` decimal(10,2) DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cliente_sucursal` (`sucursal`,`cliente_id`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_cliente_id` (`cliente_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saldos_favor_clientes`
--

LOCK TABLES `saldos_favor_clientes` WRITE;
/*!40000 ALTER TABLE `saldos_favor_clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `saldos_favor_clientes` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Table structure for table `sueldos`
--

DROP TABLE IF EXISTS `sueldos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sueldos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendedor_id` int NOT NULL,
  `sucursal` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `usuario_registro` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vendedor` (`vendedor_id`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `sueldos_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sueldos`
--

LOCK TABLES `sueldos` WRITE;
/*!40000 ALTER TABLE `sueldos` DISABLE KEYS */;
/*!40000 ALTER TABLE `sueldos` ENABLE KEYS */;
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
-- Temporary view structure for view `v_resumen_ventas_diarias`
--

DROP TABLE IF EXISTS `v_resumen_ventas_diarias`;
/*!50001 DROP VIEW IF EXISTS `v_resumen_ventas_diarias`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_resumen_ventas_diarias` AS SELECT 
 1 AS `fecha`,
 1 AS `sucursal`,
 1 AS `total_ventas`,
 1 AS `ingresos_totales`,
 1 AS `efectivo`,
 1 AS `transferencia`,
 1 AS `cuenta_corriente`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_stock_total_productos`
--

DROP TABLE IF EXISTS `v_stock_total_productos`;
/*!50001 DROP VIEW IF EXISTS `v_stock_total_productos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_stock_total_productos` AS SELECT 
 1 AS `producto_id`,
 1 AS `producto_nombre`,
 1 AS `marca`,
 1 AS `tipo`,
 1 AS `stock_total`,
 1 AS `stock_fallas_total`,
 1 AS `sucursales_con_stock`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `vendedores`
--

DROP TABLE IF EXISTS `vendedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre completo del vendedor',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `cobra_comisiones` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sucursal` (`sucursal`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Vendedores del sistema - incluye campo cobra_comisiones para control individual';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendedores`
--

LOCK TABLES `vendedores` WRITE;
/*!40000 ALTER TABLE `vendedores` DISABLE KEYS */;
INSERT INTO `vendedores` VALUES (1,'Jonathan','Witt','Vendedor','vendedor',NULL,0,15.00,'pando','099123456','pando@zarparuy.com','$2b$10$A4e1YUcI6aawcsPq87AMouY7sLgnYGC98O1QUibXByJDNYGOkpbqm','2024-01-15',1,1,'2025-10-27 21:46:14','2025-11-13 19:20:23'),(2,'Maria de los Milagros','Bertochi','Vendedor','vendedor',NULL,0,15.00,'maldonado','099 234 567','maldonado@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-02-01',1,0,'2025-10-27 21:46:14','2025-11-12 18:43:44'),(3,'Jonathan','Moreira','Vendedor','vendedor',NULL,0,15.00,'rivera','099 345 678','rivera@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-03-10',1,1,'2025-10-27 21:46:14','2025-11-12 18:43:44'),(4,'Ivan','da Rosa','Vendedor','vendedor',NULL,0,15.00,'melo','099 456 789','melo@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-01-20',1,1,'2025-10-27 21:46:14','2025-11-12 19:03:45'),(5,'Yandy','Clavero','Vendedor','vendedor',NULL,0,15.00,'paysandu','099 567 890','paysandu@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-02-15',1,1,'2025-10-27 21:46:14','2025-11-12 18:43:44'),(6,'Diego','Silva','Vendedor','vendedor',NULL,0,15.00,'salto','099 678 901','salto@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-03-05',1,1,'2025-10-27 21:46:14','2025-11-12 18:43:44'),(7,'Maicol','Fagundez','Vendedor','vendedor',NULL,0,15.00,'tacuarembo','099 789 012','tacuarembo@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-01-25',1,1,'2025-10-27 21:46:14','2025-11-12 18:43:44'),(8,'Nicolas','Fernandez','Director General','administrador','{\"acceso_total\": true, \"puede_modificar_roles\": true}',1,100.00,'Administrador ','093666885','admin@zarparuy.com','$2b$10$m.cJEY44Zr6HLL3XqWnBUe6RtTLrpL./eU5LsTNKCAaioJd5/z5.G',NULL,1,1,'2025-10-28 14:08:00','2025-11-14 13:25:23'),(9,'Carlos','Mendez','Vendedor','vendedor',NULL,0,10.00,'pando','099-888-777','carlos.test@zarparuy.com','zarpar123',NULL,0,1,'2025-10-31 02:04:57','2025-11-06 02:15:58'),(11,'Nadia','Condes','Vendedor','vendedor',NULL,0,10.00,'mercedes','093666885','mercedes@zarparuy.com','zarpar123',NULL,0,1,'2025-10-31 02:37:40','2025-11-06 02:15:58'),(12,'Carlos','Mercedes','Vendedor','vendedor',NULL,0,10.00,'mercedes','099-888-777','carlos@mercedes.zarpar.com','mercedes123',NULL,0,1,'2025-10-31 02:51:47','2025-11-06 02:15:58'),(13,'Sol','Pascual','Vendedor','vendedor',NULL,0,10.00,'soriano',NULL,'soriano@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6',NULL,1,1,'2025-10-31 14:19:16','2025-11-12 18:43:44'),(14,'Sandra','Zeballos','Vendedor','vendedor',NULL,0,10.00,'rionegro','+59893666885','rionegro@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6',NULL,1,1,'2025-10-31 15:25:34','2025-11-12 18:43:44');
/*!40000 ALTER TABLE `vendedores` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_vendedor_delete` BEFORE DELETE ON `vendedores` FOR EACH ROW BEGIN
  DECLARE venta_count INT;
  
  SELECT COUNT(*) INTO venta_count 
  FROM ventas 
  WHERE vendedor_id = OLD.id;
  
  IF venta_count > 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar vendedor con ventas asociadas. Desactivar en su lugar.';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
  KEY `idx_ventas_fecha` (`fecha_venta`),
  KEY `idx_ventas_sucursal` (`sucursal`),
  KEY `idx_ventas_cliente` (`cliente_id`),
  KEY `idx_ventas_vendedor` (`vendedor_id`),
  KEY `idx_ventas_metodo_pago` (`metodo_pago`),
  KEY `idx_ventas_numero` (`numero_venta`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de ventas del sistema';
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
  KEY `idx_ventas_detalle_venta` (`venta_id`),
  KEY `idx_ventas_detalle_producto` (`producto_id`),
  CONSTRAINT `ventas_detalle_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ventas_detalle_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalle de productos en cada venta';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas_detalle`
--

LOCK TABLES `ventas_detalle` WRITE;
/*!40000 ALTER TABLE `ventas_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas_diarias_resumen`
--

DROP TABLE IF EXISTS `ventas_diarias_resumen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas_diarias_resumen` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL COMMENT 'Fecha del resumen',
  `total_ventas` int NOT NULL DEFAULT '0' COMMENT 'Cantidad de ventas',
  `total_ingresos` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Ingresos totales del dÃ­a',
  `por_sucursal` json DEFAULT NULL COMMENT 'Resumen por sucursal',
  `por_metodo_pago` json DEFAULT NULL COMMENT 'Resumen por mÃ©todo de pago',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fecha` (`fecha`),
  KEY `idx_fecha` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=170 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Resumen diario de ventas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas_diarias_resumen`
--

LOCK TABLES `ventas_diarias_resumen` WRITE;
/*!40000 ALTER TABLE `ventas_diarias_resumen` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas_diarias_resumen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'zarparDataBase'
--

--
-- Dumping routines for database 'zarparDataBase'
--
/*!50003 DROP FUNCTION IF EXISTS `generar_codigo_transferencia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `generar_codigo_transferencia`() RETURNS varchar(50) CHARSET utf8mb4
    DETERMINISTIC
BEGIN
  DECLARE nuevo_numero INT;
  DECLARE codigo VARCHAR(50);
  DECLARE anio VARCHAR(4);
  
  
  SET anio = YEAR(NOW());
  
  
  UPDATE secuencias 
  SET valor = valor + 1 
  WHERE nombre = 'transferencias';
  
  
  SELECT valor INTO nuevo_numero 
  FROM secuencias 
  WHERE nombre = 'transferencias';
  
  
  SET codigo = CONCAT('TRANS-', anio, '-', LPAD(nuevo_numero, 3, '0'));
  
  RETURN codigo;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertarProductoEnTodasSucursales` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertarProductoEnTodasSucursales`(
    IN p_producto_nombre VARCHAR(255),
    IN p_precio DECIMAL(10,2),
    IN p_stock_inicial INT,
    IN p_es_principal TINYINT
)
BEGIN
    DECLARE v_producto_id INT;
    DECLARE v_sucursal VARCHAR(50);
    DECLARE done INT DEFAULT FALSE;
    
    
    DECLARE cur CURSOR FOR 
        SELECT sucursal FROM configuracion_sucursales;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    
    SELECT id INTO v_producto_id 
    FROM productos 
    WHERE nombre = p_producto_nombre 
    ORDER BY id DESC 
    LIMIT 1;
    
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_sucursal;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        
        INSERT INTO productos_sucursal 
            (producto_id, sucursal, stock, precio, stock_minimo, es_stock_principal, activo, stock_en_transito)
        VALUES 
            (v_producto_id, v_sucursal, p_stock_inicial, p_precio, 5, p_es_principal, 1, 0);
            
    END LOOP;
    
    CLOSE cur;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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

--
-- Final view structure for view `v_resumen_ventas_diarias`
--

/*!50001 DROP VIEW IF EXISTS `v_resumen_ventas_diarias`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_resumen_ventas_diarias` AS select cast(`ventas`.`fecha_venta` as date) AS `fecha`,`ventas`.`sucursal` AS `sucursal`,count(0) AS `total_ventas`,cast(sum(`ventas`.`total`) as decimal(10,2)) AS `ingresos_totales`,cast(sum((case when (`ventas`.`metodo_pago` = 'efectivo') then `ventas`.`total` else 0 end)) as decimal(10,2)) AS `efectivo`,cast(sum((case when (`ventas`.`metodo_pago` = 'transferencia') then `ventas`.`total` else 0 end)) as decimal(10,2)) AS `transferencia`,cast(sum((case when (`ventas`.`metodo_pago` = 'cuenta_corriente') then `ventas`.`total` else 0 end)) as decimal(10,2)) AS `cuenta_corriente` from `ventas` group by cast(`ventas`.`fecha_venta` as date),`ventas`.`sucursal` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_stock_total_productos`
--

/*!50001 DROP VIEW IF EXISTS `v_stock_total_productos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_stock_total_productos` AS select `p`.`id` AS `producto_id`,`p`.`nombre` AS `producto_nombre`,`p`.`marca` AS `marca`,`p`.`tipo` AS `tipo`,ifnull(sum(`ps`.`stock`),0) AS `stock_total`,ifnull(sum(`ps`.`stock_fallas`),0) AS `stock_fallas_total`,count(distinct `ps`.`sucursal`) AS `sucursales_con_stock` from (`productos` `p` left join `productos_sucursal` `ps` on((`p`.`id` = `ps`.`producto_id`))) where (`p`.`activo` = 1) group by `p`.`id`,`p`.`nombre`,`p`.`marca`,`p`.`tipo` */;
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

-- Dump completed on 2025-11-14 14:16:48
