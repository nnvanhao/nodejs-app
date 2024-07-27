# Use the official Node.js image as a base
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Install development dependencies
RUN npm install --only=dev

# Generate Prisma Client
RUN npx prisma generate

# Expose the port that the app will run on
EXPOSE 3000

# Start the application with nodemon and ts-node
CMD ["npx", "nodemon", "--watch", "src", "--exec", "ts-node", "src/server.ts"]
