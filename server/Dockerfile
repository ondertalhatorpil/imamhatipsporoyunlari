FROM node:18-alpine

WORKDIR /app

# Production için NODE_ENV ayarla
ENV NODE_ENV=production
ENV UPLOAD_DIR=uploads

# Uploads klasörlerini oluştur
RUN mkdir -p ${UPLOAD_DIR}/gallery ${UPLOAD_DIR}/slider && \
    chmod -R 777 ${UPLOAD_DIR}

# Sadece production dependencies'leri yükle
COPY package*.json ./
RUN npm ci --only=production

# Kaynak kodları kopyala
COPY . .

EXPOSE 8082

CMD ["node", "index.js"]