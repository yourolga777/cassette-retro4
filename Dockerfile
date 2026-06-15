FROM node:22-alpine

WORKDIR /app

ENV NEXT_PUBLIC_SITE_URL=https://cassette-retro4-yourolga.amvera.io
ENV TINKOFF_TERMINAL_KEY=TinkoffBankTest
ENV TINKOFF_API_URL=https://securepay.tinkoff.ru/v2
ENV ADMIN_LOGIN=admin
ENV TELEGRAM_ADMIN_IDS=1100115774
ENV TELEGRAM_CHANNEL_ID=-1004294438117
ENV TELEGRAM_ERROR_CHANNEL_ID=1100115774
ENV TELEGRAM_ADMIN_CHAT_ID=1100115774

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["sh", "-c", "npm run db:migrate && npm run start"]
