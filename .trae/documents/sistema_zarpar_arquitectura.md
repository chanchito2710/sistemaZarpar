# Sistema Zarpar - Documento de Arquitectura Técnica

## 1. Diseño de Arquitectura

```mermaid
graph TD
    A[Navegador Usuario] --> B[React Frontend + Ant Design]
    B --> C[API REST NestJS]
    C --> D[Base de Datos MySQL]
    C --> E[Servicios Externos]
    
    subgraph "Capa Frontend"
        B
        F[TypeScript]
        G[Ant Design 5]
        H[React Router]
    end
    
    subgraph "Capa Backend"
        C
        I[Autenticación JWT]
        J[Validación DTOs]
        K[TypeORM]
    end
    
    subgraph "Capa de Datos"
        D
        L[Índices Optimizados]
        M[Relaciones FK]
    end
    
    subgraph "Servicios Externos"
        E
        N[APIs de Pago]
        O[Servicios de Email]
    end
```

## 2. Descripción de Tecnologías

* **Frontend**: React\@18 + TypeScript\@5 + Ant Design\@5 + Vite\@4

* **Backend**: NestJS\@10 + TypeScript\@5 + TypeORM\@0.3

* **Base de Datos**: MySQL\@8.0

* **Autenticación**: JWT + Passport

* **Validación**: class-validator + class-transformer

## 3. Definiciones de Rutas

| Ruta                    | Propósito                                          |
| ----------------------- | -------------------------------------------------- |
| /                       | Dashboard principal con resumen de métricas        |
| /login                  | Página de autenticación de usuarios                |
| /pos                    | Punto de venta para procesamiento de transacciones |
| /inventory              | Gestión de inventario y stock                      |
| /inventory/log          | Bitácora de movimientos de inventario              |
| /inventory/transfer     | Transferencias entre sucursales                    |
| /products               | Catálogo y gestión de productos                    |
| /products/prices        | Lista y edición de precios                         |
| /sales                  | Historial y reportes de ventas                     |
| /sales/returns          | Gestión de devoluciones                            |
| /customers              | Base de datos de clientes                          |
| /customers/accounts     | Cuentas corrientes y créditos                      |
| /finance/cash           | Control de caja y efectivo                         |
| /finance/banks          | Gestión bancaria y conciliación                    |
| /finance/expenses       | Control de gastos operativos                       |
| /finance/payroll        | Gestión de sueldos y nómina                        |
| /finance/money-transfer | Envío de dinero y transferencias                   |
| /staff/sellers          | Gestión de vendedores                              |
| /admin/branches         | Administración de sucursales                       |

## 4. Definiciones de API

### 4.1 API Principal

**Autenticación de usuarios**

```
POST /api/auth/login
```

Request:

| Nombre Parámetro | Tipo   | Requerido | Descripción            |
| ---------------- | ------ | --------- | ---------------------- |
| email            | string | true      | Email del usuario      |
| password         | string | true      | Contraseña del usuario |

Response:

| Nombre Parámetro | Tipo   | Descripción                  |
| ---------------- | ------ | ---------------------------- |
| access\_token    | string | Token JWT para autenticación |
| user             | object | Información del usuario      |
| permissions      | array  | Permisos del usuario         |

Ejemplo:

```json
{
  "email": "admin@zarpar.com",
  "password": "password123"
}
```

**Gestión de productos**

```
GET /api/products
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

**Procesamiento de ventas**

```
POST /api/sales
GET /api/sales
GET /api/sales/:id
```

**Control de inventario**

```
GET /api/inventory
POST /api/inventory/movement
POST /api/inventory/transfer
```

**Gestión de clientes**

```
GET /api/customers
POST /api/customers
PUT /api/customers/:id
GET /api/customers/:id/account
```

## 5. Diagrama de Arquitectura del Servidor

```mermaid
graph TD
    A[Cliente / Frontend] --> B[Capa de Controladores]
    B --> C[Capa de Servicios]
    C --> D[Capa de Repositorio]
    D --> E[(Base de Datos MySQL)]
    
    B --> F[Middleware de Autenticación]
    B --> G[Middleware de Validación]
    C --> H[Servicios de Negocio]
    C --> I[Servicios Externos]
    
    subgraph Servidor
        B
        C
        D
        F
        G
        H
    end
```

## 6. Modelo de Datos

### 6.1 Definición del Modelo de Datos

```mermaid
erDiagram
    USERS ||--o{ SALES : creates
    USERS ||--o{ INVENTORY_MOVEMENTS : records
    BRANCHES ||--o{ USERS : employs
    BRANCHES ||--o{ INVENTORY : stores
    CUSTOMERS ||--o{ SALES : makes
    CUSTOMERS ||--o{ CUSTOMER_ACCOUNTS : has
    PRODUCTS ||--o{ SALE_ITEMS : contains
    PRODUCTS ||--o{ INVENTORY : tracked_in
    SALES ||--o{ SALE_ITEMS : includes
    SALES ||--o{ RETURNS : generates
    
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string name
        enum role
        uuid branch_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    BRANCHES {
        uuid id PK
        string name
        string address
        string phone
        boolean active
        timestamp created_at
    }
    
    CUSTOMERS {
        uuid id PK
        string name
        string email
        string phone
        string address
        string document_number
        timestamp created_at
    }
    
    PRODUCTS {
        uuid id PK
        string name
        string description
        string sku UK
        decimal price
        string category
        boolean active
        timestamp created_at
    }
    
    INVENTORY {
        uuid id PK
        uuid product_id FK
        uuid branch_id FK
        integer quantity
        integer min_stock
        timestamp updated_at
    }
    
    SALES {
        uuid id PK
        string sale_number UK
        uuid customer_id FK
        uuid user_id FK
        uuid branch_id FK
        decimal total_amount
        decimal discount
        enum payment_method
        enum status
        timestamp created_at
    }
    
    SALE_ITEMS {
        uuid id PK
        uuid sale_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
        decimal subtotal
    }
    
    INVENTORY_MOVEMENTS {
        uuid id PK
        uuid product_id FK
        uuid branch_id FK
        uuid user_id FK
        enum movement_type
        integer quantity
        string reference
        timestamp created_at
    }
    
    CUSTOMER_ACCOUNTS {
        uuid id PK
        uuid customer_id FK
        decimal balance
        decimal credit_limit
        timestamp updated_at
    }
    
    RETURNS {
        uuid id PK
        uuid sale_id FK
        uuid user_id FK
        decimal amount
        string reason
        timestamp created_at
    }
```

### 6.2 Lenguaje de Definición de Datos

**Tabla de Usuarios (users)**

```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'seller', 'cashier') DEFAULT 'seller',
    branch_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_branch ON users(branch_id);
```

**Tabla de Sucursales (branches)**

```sql
CREATE TABLE branches (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO branches (name, address, phone) VALUES 
('Sucursal Principal', 'Av. Principal 123', '+1234567890'),
('Sucursal Norte', 'Calle Norte 456', '+1234567891');
```

**Tabla de Clientes (customers)**

```sql
CREATE TABLE customers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    document_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_document ON customers(document_number);
CREATE INDEX idx_customers_email ON customers(email);
```

**Tabla de Productos (products)**

```sql
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);

INSERT INTO products (name, sku, price, category) VALUES 
('Producto Demo 1', 'DEMO001', 25.99, 'Electrónicos'),
('Producto Demo 2', 'DEMO002', 15.50, 'Hogar');
```

**Tabla de Inventario (inventory)**

```sql
CREATE TABLE inventory (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    branch_id CHAR(36) NOT NULL,
    quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    UNIQUE KEY unique_product_branch (product_id, branch_id)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_branch ON inventory(branch_id);
```

**Tabla de Ventas (sales)**

```sql
CREATE TABLE sales (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id CHAR(36),
    user_id CHAR(36) NOT NULL,
    branch_id CHAR(36) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    payment_method ENUM('cash', 'card', 'transfer', 'credit') NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_branch ON sales(branch_id);
```

**Tabla de Items de Venta (sale\_items)**

```sql
CREATE TABLE sale_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sale_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
```

**Tabla de Movimientos de Inventario (inventory\_movements)**

```sql
CREATE TABLE inventory_movements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    branch_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    movement_type ENUM('in', 'out', 'transfer', 'adjustment') NOT NULL,
    quantity INTEGER NOT NULL,
    reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_movements_date ON inventory_movements(created_at);
CREATE INDEX idx_movements_product ON inventory_movements(product_id);
```

**Tabla de Cuentas de Clientes (customer\_accounts)**

```sql
CREATE TABLE customer_accounts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_id CHAR(36) UNIQUE NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    credit_limit DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

**Tabla de Devoluciones (returns)**

```sql
CREATE TABLE returns (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sale_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_returns_sale ON returns(sale_id);
CREATE INDEX idx_returns_date ON returns(created_at);
```

