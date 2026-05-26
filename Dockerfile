FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy application files
COPY . .

# Hugging Face Spaces binds to port 7860 by default
EXPOSE 7860
ENV PORT=7860

# Run the backend server
CMD ["node", "server.js"]
