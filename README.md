# E-Commerce & Reporting Platform

A full-stack web application for managing product catalog and generating sales reports with comprehensive testing suite.

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
├── SETUP_GUIDE.md      # Detailed setup guide
└── README.md           # This file
```

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
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:system        # System tests

# Run with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Docker Commands

### Build & Push

```bash
# Build images
docker build -t shima418/smart-backend:latest ./backend
docker build -t shima418/smart-frontend:latest ./frontend

# Push to Docker Hub
docker push shima418/smart-backend:latest
docker push shima418/smart-frontend:latest
```

### Management

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Remove containers and volumes
docker-compose down -v
```

## Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed installation and setup instructions
- [DOCKER.md](DOCKER.md) - Docker deployment guide
- [backend/tests/README.md](backend/tests/README.md) - Testing documentation

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

### Port Conflicts
```powershell
# Windows - Kill process on port
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

### Reset Database
1. Stop the backend server
2. Delete `backend/database/ecommerce.db`
3. Restart the server (auto-recreates with sample data)

### Docker Issues
```bash
# Clean up Docker
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose up --build --force-recreate
```

## License

MIT License

## Author

shima418

## Links

- Docker Hub: https://hub.docker.com/u/shima418
- Backend Image: https://hub.docker.com/r/shima418/smart-backend
- Frontend Image: https://hub.docker.com/r/shima418/smart-frontend
