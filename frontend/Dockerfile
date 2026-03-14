# Use Node for dev
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Vite default dev port
EXPOSE 5173

# Start dev server and listen on all interfaces
CMD ["npm", "run", "dev", "--", "--host"]
