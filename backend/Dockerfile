
FROM node:20-alpine AS deps

WORKDIR /app

# Install only production dependencies for a smaller runtime image.
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src

EXPOSE 5000

USER node
CMD ["npm", "run", "start"]