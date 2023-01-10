FROM node:18.13.0

WORKDIR /var/www/html

RUN apt update && \
    npm install -g npm && \
    npm install -g @vue/cli

EXPOSE 8080
ENV HOST 0.0.0.0