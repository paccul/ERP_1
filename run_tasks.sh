#!/bin/bash
# Garda ERP - Task Runner
# Menjalankan perintah umum pengembangan

echo "Garda ERP Task Runner"
echo "---------------------"

if [ "$1" == "setup" ]; then
    echo "Menjalankan fase 1: Setup Infrastruktur..."
    composer install
    npm install
    cp .env.example .env
    php artisan key:generate
    php artisan migrate:fresh --seed
    echo "Setup selesai."
elif [ "$1" == "dev" ]; then
    echo "Memulai development server..."
    php artisan serve & npm run dev
elif [ "$1" == "test" ]; then
    echo "Menjalankan pengujian..."
    ./vendor/bin/pest
    npm run test
    npx playwright test
elif [ "$1" == "lint" ]; then
    echo "Menjalankan analisis statis..."
    ./vendor/bin/phpstan analyse
    npm run lint
    node scripts/lint-tokens.mjs
else
    echo "Gunakan argumen: setup, dev, test, atau lint."
fi
