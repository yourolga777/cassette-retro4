FROM node:22-alpine

WORKDIR /app

ENV NEXT_PUBLIC_SITE_URL=https://cassette-retro4-yourolga.amvera.io

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "scripts/startup.mjs"]
