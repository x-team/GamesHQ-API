FROM node:16-alpine AS base

ENV AWS_CLI_VERSION=1.15.47

WORKDIR /app

# Install packages for aws-env
RUN apk add --no-cache build-base rsync git python3 py-pip py-setuptools groff less openssl ca-certificates bash \
  && pip --no-cache-dir install awscli==${AWS_CLI_VERSION} \
  && wget https://github.com/Droplr/aws-env/raw/master/bin/aws-env-linux-amd64 -O /bin/aws-env \
  && chmod +x /bin/aws-env \
  && rm -rf /var/cache/apk/*

FROM base AS build

# Copy only package.json and package-lock.json first to cache npm install step
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Build the app
RUN npm run build

CMD eval $(aws-env) && npm start