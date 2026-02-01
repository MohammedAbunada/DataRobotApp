#!/bin/sh

python manage.py migrate
python manage.py collectstatic --noinput

gunicorn Dashboard.wsgi:application --bind 0.0.0.0:8000 --timeout 1200