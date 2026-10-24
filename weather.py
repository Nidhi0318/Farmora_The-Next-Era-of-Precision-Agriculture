import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

def get_weather(lat, lon):
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            data = response.json()
            curr = data.get("current_weather", {})
            return {
                "temperature": curr.get("temperature"),
                "wind_speed": curr.get("windspeed"),
                "weather_code": curr.get("weathercode"),
                "source": "Open-Meteo"
            }

        return {"error": "Unable to fetch weather"}

    except Exception as e:
        return {"error": str(e)}