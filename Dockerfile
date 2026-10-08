FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY index.js ./
COPY public/ ./public/

EXPOSE 9090

CMD ["node", "index.js"]
