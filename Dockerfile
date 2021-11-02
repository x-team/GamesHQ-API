FROM node:16-alpine
ENV AWS_CLI_VERSION 1.15.47
WORKDIR /app

#copy all the app files
COPY . .

RUN apk --no-cache update

RUN apk add --no-cache build-base rsync git

#install packages for aws-env
RUN apk add --no-cache python py-pip py-setuptools groff less openssl ca-certificates bash && \
  pip --no-cache-dir install awscli==${AWS_CLI_VERSION} && \
  rm -rf /var/cache/apk/*

#Download aws-env
RUN wget https://github.com/Droplr/aws-env/raw/master/bin/aws-env-linux-amd64 -O /bin/aws-env && chmod +x /bin/aws-env

RUN yarn install --frozen-lockfile --production=false
RUN yarn build

CMD eval $(aws-env) && NODE_ENV=production yarn start
