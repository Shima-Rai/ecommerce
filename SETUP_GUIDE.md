# E-Commerce Platform - Complete Setup & Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:

### For Local Development
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

### For Docker Deployment
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (included with Docker Desktop)

## Installation Methods

Choose one of the following methods:

### Method 1: Docker Compose (Recommended for Production)

This is the easiest way to get the entire stack running.

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

Pull pre-built images from Docker Hub:

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

Perfect for development and debugging.

#### Step 1: Install Backend Dependencies

```powershell
cd e:\smart\backend
npm install
```

**Installed packages:**
- express (web framework)
- sqlite3 (database)
- cors (cross-origin resource sharing)
- body-parser (request parsing)
- nodemon (development auto-reload)
- jest, supertest (testing)

#### Step 2: Install Frontend Dependencies

```powershell
cd e:\smart\frontend
npm install
```

**Installed packages:**
- react & react-dom (UI framework)
- react-scripts (build tools)
- axios (HTTP client)
- @testing-library/react & jest-dom (testing)

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

## Complete API Documentation

### Products Endpoints

#### Get All Products
```http
GET /api/products
```
**Response:**
```json
[
  {
    "id": 1,
    "name": "Laptop",
    "price": 999.99,
    "created_at": "2026-02-04T10:30:00"
  }
]
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "Smartphone",
  "price": 599.99
}
```

#### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 649.99
}
```

#### Delete Product
```http
DELETE /api/products/:id
```

### Orders Endpoints

#### Get All Orders
```http
GET /api/orders
```

#### Get Order by ID
```http
GET /api/orders/:id
```

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

#### Update Order
```http
PUT /api/orders/:id
Content-Type: application/json

{
  "product_id": 2,
  "quantity": 5
}
```

#### Delete Order
```http
DELETE /api/orders/:id
```

### Reports Endpoints

#### Top Sellers Report
```http
GET /api/report/top-sellers
```
**Response:**
```json
[
  {
    "product_id": 1,
    "product_name": "Laptop",
    "total_quantity_sold": 45,
    "order_count": 15,
    "total_revenue": 44999.55
  }
]
```

#### Sales Summary
```http
GET /api/report/sales-summary
```
**Response:**
```json
{
  "totalOrders": 150,
  "totalItemsSold": 450,
  "totalRevenue": 125000.50,
  "averageOrderValue": 833.34
}
```

#### Product Performance
```http
GET /api/report/product-performance
```

## Testing Guide

### Backend Testing

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

**Test Structure:**
- `tests/unit/` - Unit tests for individual routes
- `tests/integration/` - Integration tests with database
- `tests/system/` - Full system end-to-end tests

### Frontend Testing

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

**Test Structure:**
- `src/test/unit/` - Component unit tests
- `src/test/integration/` - Integration flow tests

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

## Features Implemented

- **Database Integration**: SQLite with proper schema and relationships  
- **CRUD Operations**: Full Create, Read, Update, Delete for products and orders  
- **Order Management**: Create, edit, and delete orders  
- **Sales Transactions**: Order placement with automatic price calculation  
- **Complex SQL Queries**: Aggregation, joins, and grouping for reporting  
- **Sales Dashboard**: Real-time metrics and analytics  
- **Top Sellers Report**: Best-selling products tracking  
- **Responsive UI**: Mobile-friendly design with modern aesthetics  
- **Real-time Updates**: Automatic refresh after operations  
- **Data Validation**: Input validation on both frontend and backend  
- **Error Handling**: Comprehensive error messages and handling  
- **Docker Support**: Full containerization with Docker Compose  
- **Comprehensive Testing**: Unit, integration, and system tests  
- **API Documentation**: Complete endpoint documentation  
- **Database Persistence**: Docker volumes for data persistence  

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

**Clean Docker system:**
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

## 📁 Complete Project Structure

```
smart/
├── backend/
│   ├── routes/
│   │   ├── products.js      # Product CRUD endpoints
│   │   ├── orders.js        # Order endpoints
│   │   └── reports.js       # Reporting endpoints
│   ├── database.js          # Database configuration
│   ├── server.js            # Express server
│   ├── package.json
│   └── ecommerce.db         # SQLite database (created on first run)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductList.js
│   │   │   ├── ProductForm.js
│   │   │   ├── OrderForm.js
│   │   │   ├── TopSellers.js
│   │   │   └── SalesSummary.js
│   │   ├── App.js           # Main application
│   │   ├── App.css          # Styling
│   │   ├── index.js         # Entry point
│   │   └── index.css
│   └── package.json
└── README.md

```

## 🎓 Learning Objectives Covered

1. ✅ **Database Schema Design**: Created normalized tables with relationships
2. ✅ **SQL Queries**: Implemented complex queries with JOINs, GROUP BY, and aggregations
3. ✅ **RESTful API**: Built comprehensive REST API with proper HTTP methods
4. ✅ **Frontend-Backend Integration**: Seamless communication using Axios
5. ✅ **State Management**: React hooks for managing application state
6. ✅ **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
7. ✅ **CRUD Operations**: Full implementation of Create, Read, Update, Delete
8. ✅ **Reporting & Analytics**: Advanced SQL queries for business intelligence

## 🆘 Need Help?

If you encounter any issues:
1. Check that both servers are running
2. Verify the correct ports (5000 for backend, 3000 for frontend)
3. Check the browser console for frontend errors
4. Check the terminal for backend errors
5. Ensure all dependencies are installed correctly

Enjoy building and learning! 🚀
