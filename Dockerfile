FROM node:12.18.2-alpine3.11 As development

WORKDIR /usr/src/app

# COPY package*.json .
# RUN npm install --only=development

COPY . .

CMD ["npm", "run", "start:dev"]
