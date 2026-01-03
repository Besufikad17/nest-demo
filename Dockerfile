# Use the official Node.js image as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Generate prisma client
RUN npx prisma generate

# Build the NestJS application
RUN yarn run build

# Copy generated prisma client to dist folder so compiled JS can find it
RUN cp -r generated dist/ || true

# Start server using the production build
CMD ["sh", "-c", "yarn run db:deploy && yarn run dev"]
