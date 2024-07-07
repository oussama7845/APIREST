# Use Node.js image
FROM node:14

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

# Install wait-on globally
RUN npm install -g wait-on

# Expose port
EXPOSE 3000

# Command to start the application after waiting for MySQL
CMD ["sh", "-c", "wait-on tcp:db:3306 && npm start"]