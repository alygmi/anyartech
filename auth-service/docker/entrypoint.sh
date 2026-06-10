#!/bin/sh
set -e

echo "Starting Auth Service..."

# Tunggu database siap
echo "Waiting for database to be ready..."
while ! nc -z ${DB_HOST:-db_auth} ${DB_PORT:-3306} 2>/dev/null; do
    sleep 1
done
echo "Database is ready"

# Jalankan migration
echo "Running migrations..."
php artisan migrate --force

# Jalankan seeder
echo "Running seeders..."
php artisan db:seed --force

echo "Setup complete! Starting supervisord..."

# Jalankan supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
