FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    zip \
    unzip \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    gcc \
    musl-dev \
    autoconf \
    make \
    netcat-openbsd

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    zip \
    bcmath \
    opcache

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Clean up build dependencies to reduce image size
RUN apk del gcc musl-dev autoconf make

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files (biar layer cache efisien)
COPY composer.json composer.lock* ./

# Install dependencies tanpa menjalankan scripts (artisan belum lengkap)
RUN composer install --no-dev --no-scripts --prefer-dist

# Copy semua source code Laravel
COPY . .

# Sekarang jalankan composer scripts (artisan + bootstrap sudah ada)
RUN composer dump-autoload --optimize

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copy supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Permission untuk storage
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
