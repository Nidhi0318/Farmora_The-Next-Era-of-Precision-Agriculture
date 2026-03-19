from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import csv
import io
import math
import sqlite3

def init_db():
    conn = sqlite3.connect("farmer_portal.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS farmers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            survey_number TEXT,
            phone_number TEXT,
            state TEXT,
            district TEXT,
            taluk TEXT,
            hobli TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

app = FastAPI(title="Farmer Portal API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "mock_db.json"
REGISTRATIONS_FILE = "registrations.json"
CSV_FILE = "dakshina_kannada_crop_dataset.csv"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return {}

def get_recommendations_from_csv(ph, temp, rainfall):
    recommendations = set()
    if not os.path.exists(CSV_FILE):
        return ["Rice", "Coconut"] # Fallback

    try:
        with open(CSV_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    row_ph = float(row['pH'])
                    row_temp = float(row['Temperature'])
                    row_rainfall = float(row['Rainfall'])
                    
                    # Proximity check
                    if abs(row_ph - ph) < 1.0 and abs(row_temp - temp) < 5 and abs(row_rainfall - rainfall) < 1000:
                        recommendations.add(row['Crop'])
                except (ValueError, KeyError):
                    continue
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return ["Rice", "Arecanut"]

    if not recommendations:
        return ["Coconut", "Arecanut", "Pepper"]
    
    return sorted(list(recommendations))[:5]

# Models
class RegistrationRequest(BaseModel):
    name: str
    survey_number: str
    phone_number: str
    state: str
    district: str
    taluk: str
    hobli: str

@app.post("/register")
async def register_farmer(reg: RegistrationRequest):
    try:
        conn = sqlite3.connect("farmer_portal.db")
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO farmers (name, survey_number, phone_number, state, district, taluk, hobli)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (reg.name, reg.survey_number, reg.phone_number, reg.state, reg.district, reg.taluk, reg.hobli))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
        
    return {"message": "Registration saved successfully into database"}

@app.get("/")
async def root():
    return {"message": "Farmer Portal API is running"}

@app.get("/lookup/{survey_number:path}")
async def lookup_survey(survey_number: str):
    data = load_data()
    surveys = data.get("surveys", {})
    if survey_number in surveys:
        return surveys[survey_number]
    raise HTTPException(status_code=404, detail="Survey number not found")

@app.get("/recommendations/{taluk}")
async def get_recommendations(taluk: str):
    data = load_data()
    taluks = data.get("taluks", {})
    market_prices = data.get("market_prices", [])
    
    # Create price lookup map
    price_map = {item["crop"]: item for item in market_prices}
    
    taluk_info = taluks.get(taluk, {"ph": 6.5, "temp": 28, "rainfall": 1500})
    
    ph = taluk_info.get("ph")
    temp = taluk_info.get("temp")
    rainfall = taluk_info.get("rainfall")
    
    crop_names = get_recommendations_from_csv(ph, temp, rainfall)
    
    # Enrich crops with price data
    enriched_recommendations = []
    for crop in crop_names:
        price_info = price_map.get(crop, {"crop": crop, "price": "Price on Request", "trend": "stable"})
        enriched_recommendations.append(price_info)
            
    return {
        "soil_data": taluk_info,
        "recommended_crops": enriched_recommendations
    }

@app.get("/market-prices")
async def get_market_prices():
    data = load_data()
    return data.get("market_prices", [])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
