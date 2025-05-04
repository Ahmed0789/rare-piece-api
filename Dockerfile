# Lightweight Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy dependency files first to optimize caching
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

# Set environment variables dynamically
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the application using pm2
CMD ["npx", "pm2-runtime", "src/server/index.js"]
