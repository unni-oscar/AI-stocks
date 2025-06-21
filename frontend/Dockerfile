# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port 3033
EXPOSE 3033

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 