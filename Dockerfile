FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS prod
WORKDIR /app
COPY --from=base /app/package*.json ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/tsconfig.json ./
COPY --from=base /app/src ./src

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]