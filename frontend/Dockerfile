# Pull base image
FROM node:lts-alpine
# set work directory
WORKDIR /frontend
ENV PATH /frontend/node_modules/.bin:$PATH

EXPOSE 3000

# Install and configure `serve`.
RUN npm install -g serve

# Copy source code to image
COPY . .

# Install dependencies
RUN npm install