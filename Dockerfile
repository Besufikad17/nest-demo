# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Generate prisma client
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Copy generated prisma client to dist folder so compiled JS can find it
RUN cp -r generated dist/ || true

# Start server using the production build
CMD ["sh", "-c", "npm run db:deploy && npm run dev"]
