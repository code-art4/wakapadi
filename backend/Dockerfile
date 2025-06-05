# nestjs/Dockerfile
# FROM node:20

# WORKDIR /app

# # Install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy the rest of the code
# COPY . .

# RUN npm run build

# EXPOSE 3000

# CMD ["npm", "run", "start:prod"]


# # Use official Node 20 base image
# FROM node:20-alpine

# # Set working directory
# WORKDIR /app

# # Install dependencies efficiently
# COPY package*.json ./
# RUN npm ci --omit=dev

# # Copy source files
# COPY . .

# # Build the NestJS project
# RUN npm run build

# # Expose port
# EXPOSE 3000

# # Start the app
# CMD ["node", "dist/main"]



FROM node:20-alpine

WORKDIR /app

# Install Nest CLI globally
RUN npm install -g @nestjs/cli

# Copy and install project deps
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build NestJS project
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
