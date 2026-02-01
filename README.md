# DataRobot Submission - Mohammed Abunada

This repository contains a Django web app for a lightweight chat UI that sends
messages to a DataRobot deployed LLM endpoint and renders either text responses
or Plotly charts when a chart spec is returned.

## Project Structure

- `Dashboard/`: Django project source (apps, templates, static assets, `manage.py`)
- `Dashboard/main/`: Main app with the chat view and routing
- `Dashboard/templates/`: HTML templates (single-page chat UI)
- `Dashboard/static/`: CSS/JS and assets used by the chat UI
- `Dockerfile`: Single-container build for running the app
- `docker-compose.yml`: Nginx + Django multi-container setup
- `nginx/`: Nginx config used by docker compose
- `entrypoint.sh`: Runs migrations, collects static files, and starts Gunicorn
- `requirements.txt`: Python dependencies

## Running Locally

1. Install dependencies:
   - `pip install -r requirements.txt`
2. Set required environment variables:
   - `DATAROBOT_ENDPOINT`
   - `DATAROBOT_API_TOKEN`
   - `DEPLOYMENT_ID`
3. Run the server:
   - `python Dashboard/manage.py migrate`
   - `python Dashboard/manage.py runserver 0.0.0.0:8000`

## Running with Docker (Single Container)

```
docker build -t datarobot-app .
docker run --rm -p 8000:8000 \
  -e DATAROBOT_ENDPOINT="https://app.datarobot.com/api/v2" \
  -e DATAROBOT_API_TOKEN="YOUR_TOKEN" \
  -e DEPLOYMENT_ID="YOUR_DEPLOYMENT_ID" \
  datarobot-app
```
## Running with Docker Compose (Nginx + Django)

```
docker compose build
docker compose up
```