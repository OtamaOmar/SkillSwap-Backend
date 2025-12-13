# syntax=docker/dockerfile:1

# ---- Base build stage ----
FROM node:20-slim AS base
WORKDIR /app

# Install system deps if needed (e.g., for bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package manifests
COPY package.json package-lock.json* ./

# Install production deps
RUN npm ci --only=production

# Copy source
COPY . .

# Use a non-root user
RUN useradd -m nodeuser && chown -R nodeuser:nodeuser /app
USER nodeuser

ENV NODE_ENV=production

# Default port (matches server.js default)
EXPOSE 4000

CMD ["node", "server.js"]
