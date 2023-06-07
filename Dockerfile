###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:16.17.0-alpine3.16 AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

###################
# PRODUCTION
###################

FROM node:16.17.0-alpine3.16 AS production

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY . .

COPY --from=development /usr/src/app/dist ./dist

RUN ls -l

CMD ["node", "dist/main"]