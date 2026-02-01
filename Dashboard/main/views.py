import json
import os
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render


def main(request):
    return render(request, "main.html")


@csrf_exempt
def chat(request):
    user_question = ""
    if request.method == "GET":
        user_question = request.GET.get("message", "").strip()
    elif request.method == "POST":
        try:
            body = json.loads(request.body or "{}")
            user_question = str(body.get("message", "")).strip()
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON body."}, status=400)

    if not user_question:
        return JsonResponse({"message": "Please enter a message."}, status=400)

    datarobot_endpoint = os.getenv("DATAROBOT_ENDPOINT")
    datarobot_api_token = os.getenv("DATAROBOT_API_TOKEN")
    deployment_id = os.getenv("DEPLOYMENT_ID")


    if not datarobot_endpoint or not datarobot_api_token or not deployment_id:
        return JsonResponse({"message": "Server is not configured."}, status=500)

    url = f"{datarobot_endpoint}/deployments/{deployment_id}/chat/completions"
    headers = {
        "Authorization": f"Bearer {datarobot_api_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "datarobot-deployed-llm",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_question},
        ],
        "temperature": 0,
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        return JsonResponse({"message": data["choices"][0]["message"]["content"]})
    except requests.RequestException:
        return JsonResponse({"message": "Upstream request failed."}, status=502)
