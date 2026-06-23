# Kiempad is een client-side PWA: de container serveert ALLEEN de statische build.
# Er staat geen gebruikersdata in de container — alle data leeft versleuteld in de
# browser (IndexedDB) op het toestel van de gebruiker. De container is stateless.

# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# --- serve ---
FROM nginx:1.27-alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
# SPA-fallback zodat client-side routing werkt.
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / { try_files $uri $uri/ /index.html; }\n}\n' \
    > /etc/nginx/conf.d/default.conf
EXPOSE 80
