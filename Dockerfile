ARG NODE_VERSION=16.15.1-alpine3.16

##### Building stage #####
FROM node:${NODE_VERSION} As builder

WORKDIR /app

# Install dependencies for build package C of node
RUN apk update	&& \
  apk --no-cache add make g++ gcc && \
  rm -rf /var/lib/apt/lists/*

COPY . .

RUN npm i
RUN npm run build

##### Building the final image #####
FROM node:${NODE_VERSION}

WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 80

CMD ["npm", "run", "start:prod"]