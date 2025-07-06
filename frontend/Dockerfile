# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Install curl for debugging
RUN apk add --no-cache curl

# Copy source code
COPY . .

# Expose port 3039
EXPOSE 3039

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3039"] 