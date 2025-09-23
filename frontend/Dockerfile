# Use official Node.js image for building
FROM node:20-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY frontend/package*.json ./frontend/

WORKDIR /app/frontend

RUN npm install

# Copy constants
WORKDIR /app
COPY constants/ ./constants/

# Copy the rest of your app
COPY frontend/ ./frontend/

# Build the app for production
WORKDIR /app/frontend
RUN npm run build

# Use a minimal Node.js image to serve the built files
FROM node:20-alpine AS production

# Install 'serve' to serve static files
RUN npm install -g serve

# Set working directory and copy built files
WORKDIR /app
COPY --from=builder /app/frontend/dist .

# Expose port 3000 
EXPOSE 3000

# Command to run the static server
CMD ["serve", "-s", ".", "-l", "3000"]

