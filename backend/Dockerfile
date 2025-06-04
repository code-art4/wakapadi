# nestjs/Dockerfile
FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
