FROM node:22-alpine

WORKDIR /app

ENV DATABASE_URL=postgresql://neondb_owner:npg_lPfV63BLuwOj@ep-restless-mouse-atmli2dc.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require
ENV ADMIN_LOGIN=admin
ENV ADMIN_PASSWORD=admin123
ENV ADMIN_SECRET=dev-jwt-secret-cassette-retro-2026
ENV TINKOFF_TERMINAL_KEY=TinkoffBankTest
ENV TINKOFF_API_URL=https://securepay.tinkoff.ru/v2
ENV NEXT_PUBLIC_SITE_URL=https://cassette-retro2cassette-retro3.amvera.io

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["sh", "-c", "npm run db:migrate && npm run start"]
