# Divido API

Laravel 13 API for Divido. Setup, environment variables, architecture and scripts are documented in the [root README](../../README.md); endpoint request and response shapes are in [docs/API_CONTRACTS.md](../../docs/API_CONTRACTS.md).

```bash
composer install
cp .env.example .env && php artisan key:generate
touch database/database.sqlite && php artisan migrate
php artisan serve
./vendor/bin/pest      # tests
./vendor/bin/pint      # code style
```
