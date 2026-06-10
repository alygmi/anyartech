#!/bin/sh
set -e

echo "Starting Employee Service..."

# Tunggu database siap
echo "Waiting for database to be ready..."
while ! nc -z ${DB_HOST:-db_hrm} ${DB_PORT:-3306} 2>/dev/null; do
    sleep 1
done
echo "Database is ready"

# Jalankan migration (jika ada)
echo "Running migrations..."
php artisan migrate --force

# Jalankan seeder (jika ada)
echo "Running seeders..."
php artisan db:seed --force 2>/dev/null || true

echo "Setup complete! Starting supervisord..."

# Jalankan supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
