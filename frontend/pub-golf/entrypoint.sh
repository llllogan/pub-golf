#!/bin/sh

# Replace placeholders in config.template.json with environment variables
envsubst < /usr/share/nginx/html/assets/config/config.template.json > /usr/share/nginx/html/assets/config/config.json

# Start Nginx
exec "$@"