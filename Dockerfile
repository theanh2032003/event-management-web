FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install && \
    npm cache clean --force
COPY . .
RUN npm run build
FROM node:18-alpine

RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/build ./build
COPY package.json .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]
