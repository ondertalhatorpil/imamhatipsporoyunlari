FROM node:18-alpine as development
WORKDIR /app
COPY package*.json ./
ARG BASE_URL=https://imamhatipsporoyunlari.com
ENV REACT_APP_API_URL=${BASE_URL}
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
