# Use official Node.js image for building
FROM node:20-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./

RUN npm install

# Copy the rest of your app
COPY . .

# ENV vars needed for build
ARG VITE_CONVERSA_API_URL
ENV VITE_CONVERSA_API_URL=$VITE_CONVERSA_API_URL

# Build the app for production
RUN npm run build

# Use a minimal Node.js image to serve the built files
FROM node:20-alpine AS production

# Install 'serve' to serve static files
RUN npm install -g serve

# Set working directory and copy built files
WORKDIR /app
COPY --from=builder /app/dist .

# Expose port 3000 
EXPOSE 3000

# Command to run the static server
CMD ["serve", "-s", ".", "-l", "3000"]

