# Use the official Node.js image as the base image
FROM node:18 AS builder

# Set the working directory in the container
WORKDIR /app

# Copia solo los archivos necesarios para pnpm
COPY package.json pnpm-lock.yaml ./

# Habilita Corepack y prepara pnpm
RUN corepack enable && corepack prepare pnpm@9.0.6 --activate

# Copia el resto del código
COPY . .

# Instala dependencias y construye el proyecto
RUN pnpm install --frozen-lockfile
RUN pnpm run build -- --minify=false --sourcemap

# Usa Nginx como servidor de producción
FROM nginx:stable-alpine

# Copia la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos construidos al directorio web de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]