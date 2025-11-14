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
-- Dumping data for table `vendedores`
--

LOCK TABLES `vendedores` WRITE;
/*!40000 ALTER TABLE `vendedores` DISABLE KEYS */;
INSERT INTO `vendedores` (`id`, `nombre`, `apellido`, `cargo`, `rol`, `permisos_especiales`, `puede_aprobar_credito`, `limite_descuento_maximo`, `sucursal`, `telefono`, `email`, `password`, `fecha_ingreso`, `activo`, `cobra_comisiones`, `created_at`, `updated_at`) VALUES (1,'Jonathan','Witt','Vendedor','vendedor',NULL,0,15.00,'pando','099123456','pando@zarparuy.com','$2b$10$A4e1YUcI6aawcsPq87AMouY7sLgnYGC98O1QUibXByJDNYGOkpbqm','2024-01-15',1,1,'2025-10-27 21:46:14','2025-11-13 19:20:23'),(2,'Maria de los Milagros','Bertochi','Vendedor','vendedor',NULL,0,15.00,'maldonado','099 234 567','maldonado@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-02-01',1,0,'2025-10-27 21:46:14','2025-11-12 18:43:44'),(3,'Jonathan','Moreira','Vendedor','vendedor',NULL,0,15.00,'rivera','099 345 678','rivera@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-03-10',1,1,'2025-10-27 21:46:14','2025-11-12 18:43:44'),(4,'Ivan','da Rosa','Vendedor','vendedor',NULL,0,15.00,'melo','099 456 789','melo@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-01-20',1,1,'2025-10-27 21:46:14','2025-11-12 19:03:45'),(5,'Yandy','Clavero','Vendedor','vendedor',NULL,0,15.00,'paysandu','099 567 890','paysandu@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-02-15',1,1,'2025-10-27 21:46:14','2025-11-12 18:43:44'),(6,'Diego','Silva','Vendedor','vendedor',NULL,0,15.00,'salto','099 678 901','salto@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-03-05',1,1,'2025-10-27 21:46:14','2025-11-12 18:43:44'),(7,'Maicol','Fagundez','Vendedor','vendedor',NULL,0,15.00,'tacuarembo','099 789 012','tacuarembo@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6','2024-01-25',1,1,'2025-10-27 21:46:14','2025-11-12 18:43:44'),(8,'Nicolas','Fernandez','Director General','administrador','{\"acceso_total\": true, \"puede_modificar_roles\": true}',1,100.00,'Administrador ','093666885','admin@zarparuy.com','$2b$10$m.cJEY44Zr6HLL3XqWnBUe6RtTLrpL./eU5LsTNKCAaioJd5/z5.G',NULL,1,1,'2025-10-28 14:08:00','2025-11-14 16:15:37'),(9,'Carlos','Mendez','Vendedor','vendedor',NULL,0,10.00,'pando','099-888-777','carlos.test@zarparuy.com','zarpar123',NULL,0,1,'2025-10-31 02:04:57','2025-11-06 02:15:58'),(11,'Nadia','Condes','Vendedor','vendedor',NULL,0,10.00,'mercedes','093666885','mercedes@zarparuy.com','zarpar123',NULL,0,1,'2025-10-31 02:37:40','2025-11-06 02:15:58'),(12,'Carlos','Mercedes','Vendedor','vendedor',NULL,0,10.00,'mercedes','099-888-777','carlos@mercedes.zarpar.com','mercedes123',NULL,0,1,'2025-10-31 02:51:47','2025-11-06 02:15:58'),(13,'Sol','Pascual','Vendedor','vendedor',NULL,0,10.00,'soriano',NULL,'soriano@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6',NULL,1,1,'2025-10-31 14:19:16','2025-11-12 18:43:44'),(14,'Sandra','Zeballos','Vendedor','vendedor',NULL,0,10.00,'rionegro','+59893666885','rionegro@zarparuy.com','$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6',NULL,1,1,'2025-10-31 15:25:34','2025-11-12 18:43:44');
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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-14 20:40:59
