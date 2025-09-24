# Use a full Linux base
FROM debian:bullseye-slim

# Set working directory
WORKDIR /usr/src/app

# Install required packages: curl, build tools, Python, FFmpeg, and fontconfig for canvas
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    python3 \
    python3-pip \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install node modules
RUN npm install

# Copy the rest of the app
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
