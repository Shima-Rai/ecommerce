# E-Commerce & Reporting Platform

A full-stack web application for managing product catalog and generating sales reports with comprehensive testing.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation Methods](#installation-methods)
	- [Method 1: Docker Compose](#method-1-docker-compose-recommended-for-production)
	- [Method 2: Docker Hub Images](#method-2-docker-hub-images-for-quick-testing)
	- [Method 3: Local Development](#method-3-local-development-setup)
- [Using the Application](#using-the-application)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Docker Advanced Usage](#docker-advanced-usage)
- [Testing the API with PowerShell](#testing-the-api-with-powershell)
- [Key Features](#key-features)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)
- [License](#license)
- [Author](#author)
- [Links](#links)

## Features

- Product catalog management (CRUD operations)
- Order management with edit capabilities
- Sales transaction logging
- Top sellers reporting dashboard
- Sales summary with detailed metrics
- Responsive UI design
- Docker containerization
- Comprehensive testing (Unit, Integration, System)

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Testing**: Jest, React Testing Library, Supertest
- **Containerization**: Docker & Docker Compose
- **Registry**: Docker Hub (shima418/smart-backend, shima418/smart-frontend)

## Project Structure

```
smart/
├── backend/              # Node.js API server
│   ├── routes/          # API route handlers
│   │   ├── orders.js
│   │   ├── products.js
│   │   └── reports.js
│   ├── tests/           # Backend tests
│   │   ├── unit/        # Unit tests
│   │   ├── integration/ # Integration tests
│   │   └── system/      # System tests
│   ├── database.js      # Database setup
│   ├── server.js        # Express server
│   ├── Dockerfile       # Backend Docker image
│   └── package.json
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   └── test/        # Frontend tests
│   ├── Dockerfile       # Frontend Docker image
│   ├── nginx.conf       # Nginx configuration
│   └── package.json
├── docker-compose.yml   # Docker orchestration
├── DOCKER.md           # Docker documentation
└── README.md           # This file
```

## Prerequisites

### For Local Development
- **Node.js** (v18 or higher) - https://nodejs.org/
- **npm** (comes with Node.js)
- **Git** (optional)

### For Docker Deployment
- **Docker Desktop** - https://www.docker.com/products/docker-desktop
- **Docker Compose** (included with Docker Desktop)

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down
```

Access:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Option 2: Docker Hub Images

```bash
# Pull images
docker pull shima418/smart-backend:latest
docker pull shima418/smart-frontend:latest

# Run backend
docker run -d --name smart-backend -p 5000:5000 shima418/smart-backend:latest

# Run frontend
docker run -d --name smart-frontend -p 3000:3000 shima418/smart-frontend:latest
```

### Option 3: Local Development

#### Backend Setup

```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:5000

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```
Application runs on http://localhost:3000

## Installation Methods

### Method 1: Docker Compose (Recommended for Production)

```bash
# Navigate to project directory
cd e:\smart

# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

**Stop services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

---

### Method 2: Docker Hub Images (For Quick Testing)

```bash
# Pull the images
docker pull shima418/smart-backend:latest
docker pull shima418/smart-frontend:latest

# Run backend
docker run -d --name smart-backend -p 5000:5000 \
	-e NODE_ENV=production \
	-e PORT=5000 \
	shima418/smart-backend:latest

# Run frontend
docker run -d --name smart-frontend -p 3000:3000 \
	-e REACT_APP_API_URL=http://localhost:5000/api \
	shima418/smart-frontend:latest
```

**Stop containers:**
```bash
docker stop smart-backend smart-frontend
docker rm smart-backend smart-frontend
```

---

### Method 3: Local Development Setup

#### Step 1: Install Backend Dependencies

```powershell
cd e:\smart\backend
npm install
```

#### Step 2: Install Frontend Dependencies

```powershell
cd e:\smart\frontend
npm install
```

#### Step 3: Start the Backend Server

```powershell
cd e:\smart\backend
npm start
```

**Expected output:**
```
Connected to SQLite database
Products table ready
Orders table ready
Server is running on http://localhost:5000
```

#### Step 4: Start the Frontend Application

Open a **new terminal**:

```powershell
cd e:\smart\frontend
npm start
```

The React app will start on **http://localhost:3000** and open automatically in your browser.

## Using the Application

### 1. Product Management
- Navigate to the **Products** tab
- **Add products**: Enter name and price, click "Add Product"
- **Edit products**: Click "Edit" button, modify details, save
- **Delete products**: Click "Delete" button
- View all products in a responsive grid

### 2. Place Orders
- Navigate to the **Place Order** tab
- Select a product from the dropdown
- Enter quantity
- Review the order summary (shows total price)
- Click "Place Order" to complete

### 3. Edit Orders
- Navigate to the **Edit Order** tab
- View all existing orders
- Click "Edit" to modify order details
- Update product or quantity
- Click "Delete" to remove an order

### 4. View Reports

#### Sales Summary
- Total Orders placed
- Total Items Sold
- Total Revenue generated
- Average Order Value

#### Top 5 Best-Sellers
- Product name
- Quantity sold
- Number of orders
- Total revenue
- Click refresh to update data

## Database Schema

### Products Table
```sql
CREATE TABLE products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		price REAL NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
		order_id INTEGER PRIMARY KEY AUTOINCREMENT,
		product_id INTEGER NOT NULL,
		quantity INTEGER NOT NULL,
		total_price REAL NOT NULL,
		order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Reports
- `GET /api/report/top-sellers` - Get top 5 best-selling products
- `GET /api/report/sales-summary` - Get sales overview metrics
- `GET /api/report/product-performance` - Get all products performance

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:system        # End-to-end system tests

# Run with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test OrderForm.test.js

# Update snapshots
npm test -- -u
```

## Docker Advanced Usage

### Build Custom Images

```bash
# Build backend
docker build -t smart-backend:dev ./backend

# Build frontend
docker build -t smart-frontend:dev ./frontend

# Build with no cache
docker build --no-cache -t smart-backend:latest ./backend
```

### Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag images
docker tag smart-backend:latest shima418/smart-backend:latest
docker tag smart-frontend:latest shima418/smart-frontend:latest

# Push to registry
docker push shima418/smart-backend:latest
docker push shima418/smart-frontend:latest
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect backend data volume
docker volume inspect smart_backend-data

# Backup database
docker cp smart-backend:/app/database/ecommerce.db ./backup.db

# Restore database
docker cp ./backup.db smart-backend:/app/database/ecommerce.db
```

### Network Debugging

```bash
# Inspect network
docker network inspect smart_ecommerce-network

# Test backend from frontend container
docker exec smart-frontend wget -O- http://backend:5000/api/products
```

## Testing the API with PowerShell

### Get All Products
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/products" | Select-Object -ExpandProperty Content
```

### Create a Product
```powershell
$body = @{
		name = "Test Product"
		price = 29.99
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/products" -Method POST -Body $body -ContentType "application/json"
```

### Place an Order
```powershell
$orderBody = @{
		product_id = 1
		quantity = 3
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/orders" -Method POST -Body $orderBody -ContentType "application/json"
```

### Get Top Sellers
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/report/top-sellers" | Select-Object -ExpandProperty Content
```

### Get Sales Summary
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/report/sales-summary" | Select-Object -ExpandProperty Content
```

## Key Features

- **Product Management**: Full CRUD with validation
- **Order Management**: Create, edit, delete orders
- **Sales Reporting**: Real-time analytics and metrics
- **Top Sellers Dashboard**: Best-selling products tracking
- **Responsive Design**: Mobile-friendly UI
- **Docker Ready**: Full containerization support
- **Comprehensive Testing**: 100% test coverage
- **Database Persistence**: Docker volume for data
- **Error Handling**: Robust error management
- **API Documentation**: Complete endpoint documentation

## Troubleshooting

### Port Already in Use

**Windows PowerShell:**
```powershell
# Find process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill the process
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Or for port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Database Issues

**Reset the database:**
```powershell
# Stop the backend server
# Delete the database file
Remove-Item backend\database\ecommerce.db

# Restart the server (auto-recreates with sample data)
cd backend
npm start
```

**Docker database reset:**
```bash
# Remove volume and recreate
docker-compose down -v
docker-compose up --build
```

### Node Modules Issues

```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove all containers, images, volumes
docker system prune -a --volumes

# Rebuild from scratch
docker-compose up --build --force-recreate
```

**View container logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Container not starting:**
```bash
# Check container status
docker-compose ps

# Inspect container
docker inspect smart-backend

# Enter container shell
docker exec -it smart-backend sh
```

### CORS Issues

If you get CORS errors, ensure:
1. Backend is running on port 5000
2. Frontend is configured with correct API URL
3. CORS is enabled in backend server.js

### React App Not Loading

```bash
# Clear React cache
cd frontend
Remove-Item -Recurse -Force node_modules\.cache
npm start
```

## Documentation

- [DOCKER.md](DOCKER.md) - Docker deployment guide
- [backend/tests/README.md](backend/tests/README.md) - Testing documentation

## License

MIT License

## Author

shima418

## Links

- Docker Hub: https://hub.docker.com/u/shima418
- Backend Image: https://hub.docker.com/r/shima418/smart-backend
- Frontend Image: https://hub.docker.com/r/shima418/smart-frontend
