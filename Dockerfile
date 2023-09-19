# Base on offical Node.js Alpine image
FROM node:16-alpine

# Set working directory
WORKDIR /usr/src/app
ARG NPM_TOKEN

# Set the ARG as ENV
ENV NPM_TOKEN=$NPM_TOKEN

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY package*.json ./
COPY .npmrc .npmrc

# Install dependencies
RUN npm install

# Copy all files

COPY src/ src/
COPY public/ public/
COPY next.config.js next.config.js
COPY sentry.client.config.ts sentry.client.config.ts
COPY sentry.server.config.ts sentry.server.config.ts
COPY sentry.edge.config.ts sentry.edge.config.ts
#COPY .babelrc .babelrc
#COPY babel.config.js babel.config.js

# Build app
RUN npm run build

# Expose the listening port
EXPOSE 3000

# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node

# Run npm start script when container starts
CMD [ "npm", "start" ]
