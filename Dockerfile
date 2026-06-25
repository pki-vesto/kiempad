# Kiempad is een client-side PWA: de container serveert ALLEEN de statische build.
# Er staat geen gebruikersdata in de container — alle data leeft versleuteld in de
# browser (IndexedDB) op het toestel van de gebruiker. De container is stateless.

# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
ARG VITE_KIEMPAD_CENTRAL_API_URL=
ARG VITE_KIEMPAD_CENTRAL_USER_ID=
ENV VITE_KIEMPAD_CENTRAL_API_URL=${VITE_KIEMPAD_CENTRAL_API_URL}
ENV VITE_KIEMPAD_CENTRAL_USER_ID=${VITE_KIEMPAD_CENTRAL_USER_ID}
RUN npm run build

# --- serve ---
FROM nginx:1.27-alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
# SPA-fallback zodat client-side routing werkt.
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
