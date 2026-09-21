# PanaderiaSystemV2

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-2.0.0-orange)

**A full-stack bakery management system that digitizes the complete operational lifecycle of a professional bakery — from raw material procurement and recipe management to production tracking, point-of-sale, and financial reporting.**

---

## Table of Contents

- [About The Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Software Architecture](#software-architecture)
- [Business Logic](#business-logic)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage & Routes](#usage--routes)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About The Project

PanaderiaSystemV2 is an enterprise-grade ERP tailored for bakery operations. It solves the challenge of managing complex multi-level recipes (intermediate and final products), dual-currency transactions (USD/VES), lot-level inventory traceability, and production cost calculation — all within a single integrated platform.

The system replaces manual spreadsheets and paper-based tracking with a real-time digital workflow that connects procurement, production, and sales into a unified pipeline with full auditability.

---

## Tech Stack

### Frontend
- **React 19** with **TypeScript 5.8** — UI framework
- **Vite 7** — Build tool and dev server
- **Tailwind CSS 4** — Utility-first styling
- **shadcn/ui** (Radix UI primitives) — Accessible component library
- **MUI (Material UI)** — Additional UI components and date pickers
- **TanStack React Query 5** — Server state management and data fetching
- **React Router DOM 7** — Client-side routing
- **React Hook Form + Zod** — Form handling and schema validation
- **Axios** — HTTP client
- **Nivo** — Data visualization (bar, line, pie charts)
- **@react-pdf/renderer** — Client-side PDF generation
- **Lucide React** — Icon library
- **Sonner** — Toast notifications
- **Swagger UI** — API documentation viewer

### Backend
- **Django 5.2** — Python web framework
- **Django REST Framework 3.16** — RESTful API framework
- **djangorestframework-simplejwt** — JWT authentication
- **django-cors-headers** — CORS handling
- **drf-spectacular** — OpenAPI/Swagger schema generation
- **ReportLab** — PDF report generation
- **psycopg2** — PostgreSQL database adapter
- **python-dotenv** — Environment variable management

### Database
- **PostgreSQL** — Primary database (with SQLite fallback for development)

### DevOps & Tools
- **ESLint + Prettier** — Frontend linting and formatting
- **Pyright** — Python type checking
- **Git** — Version control

---

## Software Architecture

### System Overview

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 80, 'rankSpacing': 100, 'curve': 'basis', 'padding': 20}} }%%
flowchart TD
    subgraph Frontend["Frontend — React SPA"]
        spa["React SPA"]
        auth_ctx["AuthContext\nsimplejwt"]
        token_store["Token Store\naccess + refresh"]
    end

    subgraph API["Backend — DRF  /api/"]
        gateway["API Gateway\n/api/"]
        jwt_auth["JWT Auth\nsimplejwt"]

        subgraph Apps["Django Apps"]
            users_app["users"]
            inventario_app["inventario"]
            compras_app["compras"]
            produccion_app["produccion"]
            ventas_app["ventas"]
            transformacion_app["transformacion"]
        end
    end

    subgraph Database["Database"]
        pg[("PostgreSQL")]
    end

    spa -->|"1. POST /api/token/"| jwt_auth
    jwt_auth -->|"2. access + refresh"| auth_ctx
    auth_ctx -->|"3. store tokens"| token_store

    token_store -->|"4. Bearer header"| spa
    spa -->|"5. GET /api/<app>/"| gateway

    gateway --> users_app
    gateway --> inventario_app
    gateway --> compras_app
    gateway --> produccion_app
    gateway --> ventas_app
    gateway --> transformacion_app

    users_app --> pg
    inventario_app --> pg
    compras_app --> pg
    produccion_app --> pg
    ventas_app --> pg
    transformacion_app --> pg

    jwt_auth -.->|"6. HttpOnly cookie\nrefresh"| token_store
    token_store -.->|"7. POST /api/token/refresh/"| jwt_auth
```

### Frontend Architecture

- **Feature-based module structure**: Each domain (Compras, Ventas, Produccion, etc.) is self-contained with its own `api/`, `hooks/`, `components/`, `schemas/`, and `types/` directories.
- **Context API** for global state (Auth, POS session, Dashboard, etc.)
- **React Query** for all server-state: caching, background refetch, optimistic updates, and mutation handling.
- **Protected routes** with role-based access control via `withAuth` HOC.
- **Path aliases** configured (`@/` maps to `src/`).

### Backend Architecture

- **Django app modularization** by business domain:
  - `users` — Authentication, user management, roles
  - `core` — Shared entities (units, categories, payment methods, notifications)
  - `inventario` — Raw materials, elaborated products, resale products, lots
  - `compras` — Suppliers, purchase orders, receiving, supplier payments
  - `produccion` — Recipes, production batches, consumption tracking
  - `ventas` — Customers, sales orders, POS transactions, cash register
  - `transformacion` — Product transformation definitions and execution logs
  - `reportes` — Inventory and sales report generation (PDF)
  - `dashboard` — Aggregated KPI data endpoint
- **DRF ViewSets + Router** pattern for RESTful CRUD endpoints.
- **JWT authentication** with access/refresh token rotation.
- **Database-level constraints** (CHECK constraints) enforce data integrity (e.g., polymorphic product references).

### API Design

- RESTful resource-based endpoints under `/api/` prefix.
- Standard DRF router-generated URLs for ViewSets.
- Custom action endpoints for complex operations (e.g., production execution, transformation).
- OpenAPI schema auto-generated via `drf-spectacular`.

### Database Design

- **Normalized schema** (3NF) with 40+ tables.
- **Polymorphic associations** via nullable FK pairs with CHECK constraints (e.g., `materia_prima_id` XOR `producto_reventa_id`).
- **Lot-level traceability** for raw materials, resale products, and elaborated products.
- **Dual-currency support** at the column level (USD and VES amounts stored side-by-side with exchange rate).
- **Audit columns** (`created_at`, `updated_at`, `usuario_*_id`) on all transactional tables.

---

## Business Logic

### Domain Entities

| Entity | Description |
|--------|-------------|
| **Materia Prima** | Raw material (flour, sugar, butter) tracked by lot with reorder points |
| **Producto Intermedio** | Intermediate product (dough, cream, filling) — consumed by final products |
| **Producto Final** | Sellable baked good (bread, cake, empanada) produced from recipes |
| **Producto Reventa** | Resale product (beverages, packaged goods) not produced in-house |
| **Receta** | Bill of materials linking intermediate/final products to their components |
| **Lote** | Batch/lot with expiration tracking for traceability and FEFO consumption |
| **Orden de Compra** | Purchase order to supplier with line items and receiving workflow |
| **Orden de Venta** | Sales order with state machine (pending → in-progress → delivered) |

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 70, 'rankSpacing': 90, 'curve': 'basis', 'padding': 20}} }%%
flowchart TD
    subgraph MP["Materias Primas"]
        mp_prod["MateriasPrimas\n(product template)"]
        mp_var["MateriasPrimasVariantes\nstock_actual · precio · costo"]
        mp_lot["LotesMateriasPrimas\ncantidad · costo · fecha_vencimiento"]
        mp_prod --> mp_var --> mp_lot
    end

    subgraph PE["Productos Elaborados"]
        pe_prod["ProductosElaborados\nes_intermediario = true/false"]
        pe_var["ProductosElaboradosVariantes\nstock_actual · precio · receta_id (1:1)"]
        pe_lot["LotesProductosElaborados\ncantidad · costo · fecha_vencimiento"]
        pe_prod --> pe_var --> pe_lot
    end

    subgraph PR["Productos Reventa"]
        pr_prod["ProductosReventa\n(product template)"]
        pr_var["ProductosReventaVariantes\nstock_actual · precio · costo"]
        pr_lot["LotesProductosReventa\ncantidad · costo · fecha_vencimiento"]
        pr_prod --> pr_var --> pr_lot
    end

    subgraph Notes["Key Rules"]
        n1["Lots hold qty · cost · expiry"]
        n2["Variant stock_actual = rollup of lots"]
        n3["Consumption policy = FEFO"]
    end

    mp_lot ~~~ n1
    pe_lot ~~~ n2
    pr_lot ~~~ n3
```

### Core Workflows

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 70, 'rankSpacing': 90, 'curve': 'basis', 'padding': 20}} }%%
flowchart TD
    oc["Orden de Compra"] --> recepcion["Recepción"]

    recepcion --> lotes_mp["Lotes Materias Primas"]
    recepcion --> lotes_reventa["Lotes Reventa"]

    lotes_mp --> produccion["Producción\nreceta"]
    produccion --> lotes_pe["Lotes Productos Elaborados"]
    lotes_pe --> transformacion["Transformación\nopcional"]
    transformacion --> pos["POS / Pedido"]

    lotes_reventa -->|"skip production"| pos
```

#### 1. Procurement Pipeline
```
Crear Orden de Compra → Enviar al Proveedor → Recepcionar Mercancia
    → Generar Lotes (MP/Reventa) → Registrar Pago → Actualizar Stock
```

#### 2. Production Pipeline
```
Definir Receta → Planificar Produccion → Consumir Lotes (MP/Intermedios)
    → Calcular Costo Total → Generar Lote Producto Elaborado → Actualizar Stock
```

#### 3. Sales Pipeline (POS)
```
Apertura de Caja → Agregar Productos al Carrito → Calcular Total (USD/VES)
    → Procesar Pago (Efectivo/Tarjeta/Transferencia/Pago Movil)
    → Consumir Lotes (FEFO) → Cierre de Caja con Arqueo
```

#### 4. Sales Order Pipeline
```
Crear Orden → Asignar Productos → Reservar Lotes → Producir (si aplica)
    → Despachar → Registrar Pago → Completar Orden
```

### Key Algorithms

- **Recipe Explosion**: Recursive resolution of nested recipes (final product → intermediate products → raw materials) for cost calculation and material requirements planning.

```mermaid
%%{init: {'flowchart': {'nodeSpacing': 80, 'rankSpacing': 100, 'curve': 'basis', 'padding': 20}} }%%
flowchart TD
    subgraph Final["Final Product"]
        final_var["Final Variant\nProductosElaboradosVariantes"]
        final_recipe["Final Recipe BOM\n1:1 attachment"]
        final_var -->|"has recipe"| final_recipe
    end

    subgraph Inter["Intermediate Product"]
        int_var["Intermediate Variant\nes_intermediario = true"]
        int_recipe["Intermediate Recipe BOM\n1:1 attachment"]
        int_var -->|"has recipe"| int_recipe
    end

    subgraph Raw["Materias Primas"]
        mp1["Materia Prima\nFlour"]
        mp2["Materia Prima\nWater"]
        mp3["Materia Prima\nSugar"]
    end

    final_recipe -->|"consumes intermediate"| int_var
    final_recipe -->|"consumes MP directly"| mp1

    int_recipe -->|"consumes MP only"| mp2
    int_recipe -->|"consumes MP only"| mp3
```

- **FEFO Lot Consumption**: Sales and production consume inventory from earliest-expiring lots first.
- **Dual-Currency Conversion**: All transactions store both USD and VES amounts with the applied exchange rate for accurate financial reporting.
- **Unit Conversion**: Automatic conversion between base units and packaging units using configurable conversion factors.
- **Transformation Cost Calculation**: When transforming one product into another, the system calculates input cost and distributes it to output units.

### State Transitions

**Purchase Order States**: `PENDIENTE` → `ENVIADA` → `PARCIALMENTE_RECIBIDA` → `RECIBIDA` → `PAGADA`

**Sales Order States**: `PENDIENTE` → `EN_PROCESO` → `LISTA_PARA_DESPACHO` → `DESPACHADA` → `ENTREGADA` / `CANCELADA`

**Lot States**: `DISPONIBLE` → `EN_USO` → `AGOTADO` / `VENCIDO`

**Cash Register**: `ABIERTA` → `CERRADA` (with mandatory reconciliation)

---

## Key Features

- **Multi-level Recipe Management** — Hierarchical bill of materials with intermediate and final products
- **Lot Traceability** — Full batch tracking from raw material reception to final sale with FEFO consumption
- **Point of Sale (POS)** — Integrated register with cash drawer management, multi-payment-method support, and change calculation
- **Dual-Currency Operations** — All transactions in USD and VES with configurable exchange rates
- **Purchase Order Workflow** — Complete procurement cycle from order creation to supplier payment
- **Production Costing** — Automatic cost calculation based on component consumption and lot costs
- **Product Transformation** — Convert between product forms (e.g., slicing, portioning) with cost tracking
- **Inventory Alerts** — Reorder point notifications and expiration warnings
- **Sales Order Management** — Order lifecycle with state machine and lot reservation
- **PDF Report Generation** — Inventory reports, sales reports, and transaction receipts
- **Role-Based Access Control** — Gerente, Vendedor, and Admin roles with granular permissions
- **Dashboard Analytics** — Real-time KPIs with interactive charts (Nivo)
- **API Documentation** — Auto-generated OpenAPI/Swagger docs
- **Responsive UI** — Mobile-friendly interface with dark mode support

---

## Getting Started

### Prerequisites

| Software | Minimum Version |
|----------|----------------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ (or SQLite for dev) |
| Git | 2.30+ |

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/your-org/PanaderiaSystemV2.git
cd PanaderiaSystemV2
```

#### 2. Backend Setup

```bash
# Create virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment
cp backend/djangobackend/.env.example backend/djangobackend/.env
# Edit .env with your database credentials:
# DATABASE_URL='postgresql://user:password@localhost:5432/panaderia'
# RESEND_APIKEY='your_resend_api_key'
# USE_SQLITE=True  # Set to True for local SQLite development

# Run migrations
python backend/djangobackend/manage.py migrate

# Create superuser
python backend/djangobackend/manage.py createsuperuser

# Start backend server
python backend/djangobackend/manage.py runserver
```

#### 3. Frontend Setup

```bash
cd frontend/panaderia-interfaz

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/`
- API Docs: `http://localhost:5173/api-docs`

---

## Usage & Routes

### Development Commands

```bash
# Backend
python backend/djangobackend/manage.py runserver        # Start Django dev server
python backend/djangobackend/manage.py migrate          # Apply database migrations
python backend/djangobackend/manage.py createsuperuser  # Create admin user
python backend/djangobackend/manage.py shell            # Django interactive shell

# Frontend
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Frontend Routes

| Route | Description | Permission |
|-------|-------------|------------|
| `/login` | User login page | Public |
| `/register` | User registration | Public |
| `/dashboard` | Main dashboard with KPIs | Authenticated |
| `/dashboard/materia-prima` | Raw materials inventory | Authenticated |
| `/dashboard/productos-intermedios` | Intermediate products | Authenticated |
| `/dashboard/productos-finales` | Final products catalog | Authenticated |
| `/dashboard/productos-reventa` | Resale products | Authenticated |
| `/dashboard/recetas` | Recipe management | `recetas` |
| `/dashboard/produccion` | Production execution | `produccion` |
| `/dashboard/compras` | Purchase orders & receiving | `compras` |
| `/dashboard/pedidos` | Sales orders | Authenticated |
| `/dashboard/punto-de-venta` | Point of Sale (POS) | Authenticated |
| `/dashboard/clientes` | Customer management | Authenticated |
| `/dashboard/transformacion` | Product transformations | `transformacion` |
| `/dashboard/reportes` | Reports & analytics | `reportes` |
| `/dashboard/perfil` | User profile settings | Authenticated |
| `/api-docs` | Swagger API documentation | Public |

### Backend API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/token/` | Obtain JWT access + refresh tokens |
| `POST /api/token/refresh/` | Refresh access token |
| `POST /api/logout/` | Invalidate refresh token |
| `/api/users/` | User CRUD operations |
| `/api/core/dashboard/` | Aggregated dashboard KPIs |
| `/api/core/unidades-medida/` | Unit of measure CRUD |
| `/api/core/notificaciones/` | Notification management |
| `/api/inventario/materiaprima/` | Raw materials CRUD |
| `/api/inventario/productos-elaborados/` | Elaborated products CRUD |
| `/api/inventario/productosreventa/` | Resale products CRUD |
| `/api/inventario/lotesmateriaprima/` | Raw material lots |
| `/api/inventario/lotes-productos-elaborados/` | Elaborated product lots |
| `/api/compras/proveedores/` | Supplier management |
| `/api/compras/ordenes-compra/` | Purchase order CRUD |
| `/api/compras/recepciones/` | Goods receiving |
| `/api/compras/pagos-proveedores/` | Supplier payments |
| `/api/produccion/recetas/` | Recipe management |
| `/api/produccion/produccion/` | Production batch execution |
| `/api/ventas/clientes/` | Customer CRUD |
| `/api/ventas/ordenes/` | Sales order management |
| `/api/ventas/pos-venta/` | POS transaction processing |
| `/api/ventas/apertura-cierre-caja/` | Cash register sessions |
| `/api/transformacion/transformacion/` | Transformation definitions |
| `/api/transformacion/ejecutar-transformacion/` | Execute transformations |
| `/api/reportes/inventario/` | Inventory reports |
| `/api/reportes/ventas/` | Sales reports |
| `/api/dashboard/` | Dashboard data endpoint |

---

## Roadmap

- [ ] Real-time WebSocket notifications for low stock alerts
- [ ] Barcode/QR code scanning for POS and inventory operations
- [ ] Mobile app (React Native) for warehouse operations
- [ ] Multi-branch/multi-warehouse support
- [ ] Advanced demand forecasting with historical sales analysis
- [ ] Supplier portal for purchase order collaboration
- [ ] Customer-facing order portal
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] Automated backup and disaster recovery
- [ ] Docker Compose deployment configuration
- [ ] CI/CD pipeline with automated testing
- [ ] Internationalization (i18n) for multi-language support

---

## Contributing

Contributions are welcome. Please follow the standard Git workflow:

1. **Fork** the repository
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and follow existing code conventions
4. **Lint and type-check** your code:
   ```bash
   # Frontend
   npm run lint
   # Backend
   pyright backend/
   ```
5. **Commit** with a descriptive message following [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat(inventario): add lot expiration alert"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** against `main` with a clear description of changes

### Code Style
- **Frontend**: ESLint + Prettier configuration enforced. Use TypeScript strict mode.
- **Backend**: Follow Django conventions. Use type hints where possible.
- **Commits**: Use Conventional Commits format (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)
- **PRs**: Keep them small and focused. Include screenshots for UI changes.

---

## License

Distributed under the [MIT License](LICENSE). See `LICENSE` for more information.

---

## Contact

**Project Maintainer**: David Perez

- GitHub: [@davidprz](https://github.com/davidprz)
- Project Link: [https://github.com/davidprz/PanaderiaSystemV2](https://github.com/davidprz/PanaderiaSystemV2)
