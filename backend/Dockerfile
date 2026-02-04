# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create database directory
RUN mkdir -p database

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]