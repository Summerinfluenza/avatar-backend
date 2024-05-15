# Use an official Node.js runtime as a base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./


# Bundle app source
COPY dist/ ./dist/
# Install app dependencies
RUN npm install

# Expose the port the app will run on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "prod"]
