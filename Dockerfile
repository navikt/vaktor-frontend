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

# Install dependencies
RUN npm install

# Copy all files
COPY .npmrc .npmrc
COPY src/ src/
COPY public/ public/
COPY next.config.js next.config.js
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