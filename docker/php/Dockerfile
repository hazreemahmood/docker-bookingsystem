FROM php:8.3-fpm-alpine

WORKDIR /var/www/html

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    zip \
    unzip \
    icu-dev \
    autoconf \
    g++ \
    make

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    intl \
    && docker-php-ext-enable \
    pdo_mysql \
    intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# IMPORTANT:
# Laravel code is mounted via docker-compose volume:
#   ./laravel:/var/www/html
# So we do NOT COPY application code during build.

# Set basic permissions (code itself comes from volume mount)
RUN chown -R www-data:www-data /var/www/html || true
RUN chown -R www-data:www-data /var/www/html/storage || true
RUN chown -R www-data:www-data /var/www/html/bootstrap/cache || true

# Expose port
EXPOSE 9000

CMD ["php-fpm"]
