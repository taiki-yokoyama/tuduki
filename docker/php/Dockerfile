FROM composer:2.8 AS vendor

WORKDIR /app
COPY backend/composer.json ./composer.json
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts

FROM php:8.4-fpm-alpine

RUN docker-php-ext-install pdo_mysql

WORKDIR /var/www/backend
COPY --from=vendor /app/vendor ./vendor
COPY backend .

RUN mkdir -p bootstrap/cache storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm", "-F"]
