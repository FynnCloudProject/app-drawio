FROM alpine:3.21 AS drawio
ARG DRAWIO_VERSION=32.4.1
RUN wget -qO- "https://github.com/jgraph/drawio/archive/refs/tags/v${DRAWIO_VERSION}.tar.gz" \
    | tar -xz -C /tmp "drawio-${DRAWIO_VERSION}/src/main/webapp" \
    && mv "/tmp/drawio-${DRAWIO_VERSION}/src/main/webapp" /editor

FROM node:22-alpine

WORKDIR /app

COPY package.json server.js ./
COPY public/index.html public/app-bridge.global.js ./public/
COPY --from=drawio /editor ./public/editor

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

USER node

CMD ["node", "server.js"]
