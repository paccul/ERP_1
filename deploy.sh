#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment process for Garda ERP..."

echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "📦 Installing Node dependencies and building assets..."
npm ci
npm run build

echo "⚙️ Caching Laravel configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "📂 Linking storage..."
php artisan storage:link

echo "🗄️ Running database migrations..."
php artisan migrate --force

echo "🔄 Restarting queue workers..."
php artisan queue:restart

echo "✅ Deployment completed successfully!"
