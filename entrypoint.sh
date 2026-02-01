#!/bin/sh

python manage.py migrate --noinput
python manage.py collectstatic --noinput

gunicorn Dashboard.wsgi:application --bind 0.0.0.0:8080 --timeout 1200