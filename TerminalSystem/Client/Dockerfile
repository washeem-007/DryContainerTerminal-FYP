# Build Stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build the application
COPY . .
RUN npm run build

# Serving Stage
FROM nginx:alpine

# Copy the built assets to the Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Apply single page application routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
