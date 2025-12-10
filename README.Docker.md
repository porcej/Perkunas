# Docker Setup for Perkunas

This project includes Docker and Docker Compose configurations for both development and production environments.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 2GB of available disk space

## Quick Start

### Development Mode

Run the application in development mode with hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

Or use the shorthand:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

The application will be available at `http://localhost:8080`

### Production Mode

Build and run the production version:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

The application will be available at `http://localhost:80`

## Available Commands

### Development

```bash
# Start development server
docker-compose -f docker-compose.dev.yml up

# Start in detached mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop containers
docker-compose -f docker-compose.dev.yml down

# Rebuild containers
docker-compose -f docker-compose.dev.yml up --build
```

### Production

```bash
# Build and start production server
docker-compose -f docker-compose.prod.yml up --build

# Start in detached mode
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

## Using Both Services

You can run both development and production services simultaneously:

```bash
docker-compose up
```

This will start:
- Development server on port 8080
- Production server on port 80

## Environment Variables

### Development

- `NODE_ENV=development` - Sets the environment to development
- `CHOKIDAR_USEPOLLING=true` - Enables file watching in Docker

### Production

Production uses the built static files served by nginx. No environment variables needed.

## Volumes

In development mode, the source code is mounted as a volume, so changes are reflected immediately with hot-reload.

## Troubleshooting

### Port Already in Use

If port 8080 or 80 is already in use, modify the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "8081:8080"  # Change 8081 to any available port
```

### Node Modules Issues

If you encounter issues with node_modules, try:

```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

### Clear Docker Cache

```bash
docker system prune -a
```

## Building Manually

You can also build the Docker image manually:

```bash
# Development
docker build --target development -t perkunas-dev .

# Production
docker build --target production -t perkunas-prod .
```

## Notes

- The production build uses nginx to serve static files
- The development build uses Vue CLI's dev server with hot-reload
- Source code changes in development mode are automatically reflected
- Production builds are optimized and minified

