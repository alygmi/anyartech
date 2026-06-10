FROM php:8.4-fpm-alpine

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
    linux-headers \
    autoconf \
    g++ \
    make \
    netcat-openbsd

RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    zip \
    bcmath \
    opcache

RUN pecl install redis && docker-php-ext-enable redis

# Clean up build dependencies
RUN apk del autoconf g++ make linux-headers

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

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Buat folder jika belum ada (biasanya di .gitignore)
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
