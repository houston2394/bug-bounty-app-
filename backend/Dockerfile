FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    bash \
    curl \
    nmap \
    git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p data

# Install bug bounty tools (optional – only present in full deployments)
RUN TOOLS_SCRIPT=bug-bounty-system/tools/install-tools.sh; \
    if [ -f "$TOOLS_SCRIPT" ]; then \
      chmod +x "$TOOLS_SCRIPT" && "$TOOLS_SCRIPT"; \
    else \
      echo "⚠️  bug-bounty-system/tools not found – skipping tool installation"; \
    fi

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]