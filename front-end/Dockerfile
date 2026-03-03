FROM node:20-alpine AS deps
WORKDIR /app/front-end
COPY front-end/package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app/front-end
ARG NEXT_PUBLIC_GRAPHQL_URL
ENV NEXT_PUBLIC_GRAPHQL_URL=${NEXT_PUBLIC_GRAPHQL_URL}
COPY --from=deps /app/front-end/node_modules ./node_modules
COPY front-end/. .
COPY back-end/schema.gql /app/back-end/schema.gql
RUN npm run generate-types && npm run build

FROM node:20-alpine AS runner
WORKDIR /app/front-end
ENV NODE_ENV=production
COPY front-end/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/front-end/.next ./.next
COPY --from=build /app/front-end/public ./public
COPY --from=build /app/front-end/next.config.js ./next.config.js
EXPOSE 3001
CMD ["npm", "run", "start"]
