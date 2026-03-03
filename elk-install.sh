#!/bin/bash

# Add Elastic GPG Key
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | \
sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg

# Install required package
sudo apt-get install -y apt-transport-https

# Add Elastic repository
echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] \
https://artifacts.elastic.co/packages/9.x/apt stable main" | \
sudo tee /etc/apt/sources.list.d/elastic-9.x.list

# Update package list
sudo apt-get update

# Install Elasticsearch, Kibana, and Nginx
sudo apt-get install -y elasticsearch kibana nginx

# Create Nginx config for Kibana reverse proxy
sudo tee /etc/nginx/sites-available/kibana > /dev/null <<EOF
server {
    listen 80;
    server_name your_domain_or_ip;

    location / {
        proxy_pass http://localhost:5601;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/kibana /etc/nginx/sites-enabled/kibana

# Optional: remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config (won't start it)
sudo nginx -t

echo "Installation complete. Services are NOT started."