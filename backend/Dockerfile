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
