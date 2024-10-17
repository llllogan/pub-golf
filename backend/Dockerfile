# Use the official Deno image from Docker Hub
FROM denoland/deno:alpine

# Set the working directory
WORKDIR /app

# Copy necessary files
COPY . .

# Expose the port your Deno app listens on (e.g., 8000)
EXPOSE 8000

# Set the command to run your Deno application
CMD ["run", "--allow-net", "--allow-read", "--allow-write", "server.ts"]