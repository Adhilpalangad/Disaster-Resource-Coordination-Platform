FROM node:22-alpine

WORKDIR /app

COPY server/package*.json ./

RUN npm install

COPY server .

EXPOSE 5000

CMD ["npm", "run", "dev"]