from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
import json
import os
import csv
import io
import math
import sqlite3
import secrets
import requests
import pymysql
import random
from collections import deque

RECENT_SURVEY_FARMERS = deque(maxlen=64)
CROP_HISTORY_SESSIONS: dict[str, int] = {}

# MySQL Workbench configuration
MYSQL_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "MySQL@2026",
    "database": "farmer_portal",
    "charset": "utf8mb4",
    "autocommit": True
}

def get_db_connection():
    """
    Returns an active database connection to MySQL Workbench.
    Falls back to SQLite if MySQL service is unreachable.
    """
    try:
        conn = pymysql.connect(**MYSQL_CONFIG)
        return conn, "mysql"
    except Exception as e:
        print(f"MySQL connection warning: {e}. Falling back to SQLite.")
        conn = sqlite3.connect("farmer_portal.db")
        return conn, "sqlite"

def init_db():
    # 1. Initialize MySQL Workbench database and tables
    try:
        server_conn = pymysql.connect(
            host="localhost",
            port=3306,
            user="root",
            password="MySQL@2026",
            charset="utf8mb4",
            autocommit=True
        )
        s_cur = server_conn.cursor()
        s_cur.execute("CREATE DATABASE IF NOT EXISTS farmer_portal")
        server_conn.close()

        my_conn = pymysql.connect(**MYSQL_CONFIG)
        cursor = my_conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS farmers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                aadhaar_number VARCHAR(50),
                survey_number VARCHAR(100),
                phone_number VARCHAR(50),
                state VARCHAR(100),
                district VARCHAR(100),
                taluk VARCHAR(100),
                hobli VARCHAR(100),
                password VARCHAR(255),
                land_area_acres DOUBLE DEFAULT 0.0,
                land_area_guntas DOUBLE DEFAULT 0.0,
                primary_crop VARCHAR(100) DEFAULT 'Rice',
                soil_type VARCHAR(100) DEFAULT 'Laterite Soil',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS farmer_crop_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                farmer_id INT NOT NULL,
                year INT NOT NULL,
                crop_name VARCHAR(100) NOT NULL,
                season VARCHAR(50) NOT NULL,
                cultivated_area_acres DOUBLE NOT NULL,
                yield_quantity DOUBLE NOT NULL,
                yield_unit VARCHAR(30) NOT NULL DEFAULT 'kg',
                soil_type VARCHAR(100) NOT NULL,
                soil_ph DOUBLE NOT NULL,
                irrigation_type VARCHAR(100) NOT NULL,
                profit DOUBLE NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_farmer_crop_history_farmer_year (farmer_id, year),
                CONSTRAINT fk_crop_history_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
            )
        ''')

        # Ensure extra columns exist if table was previously created
        my_cols_to_add = [
            ('primary_crop', "VARCHAR(100) DEFAULT 'Rice'"),
            ('soil_type', "VARCHAR(100) DEFAULT 'Laterite Soil'"),
            ('created_at', "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ('updated_at', "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
        ]
        for col_name, col_type in my_cols_to_add:
            try:
                cursor.execute(f'ALTER TABLE farmers ADD COLUMN {col_name} {col_type}')
            except Exception:
                pass

        # Auto-migrate records from existing SQLite db to MySQL if available
        if os.path.exists("farmer_portal.db"):
            try:
                s_conn = sqlite3.connect("farmer_portal.db")
                s_cur = s_conn.cursor()
                s_cur.execute("SELECT name, aadhaar_number, survey_number, phone_number, state, district, taluk, hobli, password, land_area_acres, land_area_guntas FROM farmers")
                rows = s_cur.fetchall()
                for row in rows:
                    if row[0]:
                        cursor.execute("SELECT id FROM farmers WHERE LOWER(TRIM(name)) = LOWER(%s)", (row[0].strip(),))
                        if not cursor.fetchone():
                            cursor.execute('''
                                INSERT INTO farmers (name, aadhaar_number, survey_number, phone_number, state, district, taluk, hobli, password, land_area_acres, land_area_guntas)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ''', row)
                s_conn.close()
            except Exception as mig_err:
                print(f"Notice: SQLite migration to MySQL: {mig_err}")

        my_conn.close()
        print("Connected to MySQL Workbench (farmer_portal) successfully!")
    except Exception as e:
        print(f"Warning: Could not connect to MySQL Workbench: {e}. Setting up SQLite fallback.")

    # 2. Also ensure SQLite fallback table exists
    try:
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
                hobli TEXT,
                password TEXT,
                land_area_acres REAL DEFAULT 0.0,
                land_area_guntas REAL DEFAULT 0.0,
                aadhaar_number TEXT,
                primary_crop TEXT DEFAULT 'Rice',
                soil_type TEXT DEFAULT 'Laterite Soil',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS farmer_crop_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
                year INTEGER NOT NULL,
                crop_name TEXT NOT NULL,
                season TEXT NOT NULL,
                cultivated_area_acres REAL NOT NULL,
                yield_quantity REAL NOT NULL,
                yield_unit TEXT NOT NULL DEFAULT 'kg',
                soil_type TEXT NOT NULL,
                soil_ph REAL NOT NULL,
                irrigation_type TEXT NOT NULL,
                profit REAL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_farmer_crop_history_farmer_year
            ON farmer_crop_history (farmer_id, year)
        ''')
        columns_to_add = [
            ('password', 'TEXT'),
            ('land_area_acres', 'REAL'),
            ('land_area_guntas', 'REAL'),
            ('aadhaar_number', 'TEXT'),
            ('primary_crop', 'TEXT'),
            ('soil_type', 'TEXT'),
            ('created_at', 'TEXT'),
            ('updated_at', 'TEXT')
        ]
        for col_name, col_type in columns_to_add:
            try:
                cursor.execute(f'ALTER TABLE farmers ADD COLUMN {col_name} {col_type}')
            except sqlite3.OperationalError:
                pass
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"SQLite init note: {e}")

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
CSV_FILE = "dakshina_kannada_crop_dataset.csv"
MARKET_HISTORY_FILE = "dakshina_kannada_market_history.csv"
FARMER_DETAILS_FILE = "mangaluru_farmer_details.csv"

# OpenWeatherMap API configuration
WEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "YOUR_API_KEY_HERE")
WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

# data.gov.in API configuration for APMC market prices
DATAGOV_API_KEY = os.environ.get("DATAGOV_API_KEY", "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b")
DATAGOV_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
DATAGOV_BASE_URL = f"https://api.data.gov.in/resource/{DATAGOV_RESOURCE_ID}"

# Mapping: Our district names → data.gov.in API district names
# The API uses older/different spellings for some districts
DISTRICT_API_MAP = {
    "Bagalkot": "Bagalkot",
    "Ballari": "Bellary",
    "Belagavi": "Belgaum",
    "Bengaluru Rural": "Bangalore",
    "Bengaluru Urban": "Bangalore",
    "Bidar": "Bidar",
    "Chamarajanagar": "Chamarajanagar",
    "Chikkaballapur": "Chikkaballapur",
    "Chikkamagaluru": "Chikmagalur",
    "Chitradurga": "Chitradurga",
    "Dakshina Kannada": "Dakshina Kannada",
    "Davanagere": "Davangere",
    "Dharwad": "Dharwad",
    "Gadag": "Gadag",
    "Hassan": "Hassan",
    "Haveri": "Haveri",
    "Kalaburagi": "Gulbarga",
    "Kodagu": "Kodagu",
    "Kolar": "Kolar",
    "Koppal": "Koppal",
    "Mandya": "Mandya",
    "Mysuru": "Mysore",
    "Raichur": "Raichur",
    "Ramanagara": "Ramanagara",
    "Shivamogga": "Shimoga",
    "Tumakuru": "Tumkur",
    "Udupi": "Udupi",
    "Uttara Kannada": "Uttar Kannada",
    "Vijayanagara": "Bellary",
    "Vijayapura": "Bijapur",
    "Yadgir": "Yadgir",
}

TALUK_MAP = {
    "Bagalkot": ["Bagalkot", "Badami", "Hungund", "Mudhol", "Jamkhandi", "Bilagi", "Ilkal", "Rabkavi Banhatti", "Guledgudda"],
    "Ballari": ["Ballari", "Kurugodu", "Siruguppa", "Sandur", "Kampli"],
    "Belagavi": ["Belagavi", "Athani", "Bailhongal", "Chikkodi", "Gokak", "Hukkeri", "Khanapur", "Raybag", "Ramdurg", "Saundatti", "Kittur", "Nippani", "Kagawad", "Mudalagi"],
    "Bengaluru Rural": ["Devanahalli", "Doddaballapura", "Hoskote", "Nelamangala"],
    "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Anekal", "Yelahanka"],
    "Bidar": ["Bidar", "Basavakalyan", "Bhalki", "Homnabad", "Aurad", "Chitgoppa", "Kamalnagar", "Hulasur"],
    "Chamarajanagar": ["Chamarajanagar", "Gundlupet", "Kollegal", "Yelandur", "Hanur"],
    "Chikkaballapur": ["Chikkaballapura", "Bagepalli", "Chintamani", "Gauribidanur", "Gudibanda", "Sidlaghatta"],
    "Chikkamagaluru": ["Chikkamagaluru", "Kadur", "Koppa", "Mudigere", "Narasimharajapura", "Sringeri", "Tarikere", "Ajjampura", "Kalasa"],
    "Chitradurga": ["Chitradurga", "Challakere", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"],
    "Dakshina Kannada": ["Mangaluru", "Bantwal", "Puttur", "Belthangady", "Sullia", "Moodabidri", "Kadaba"],
    "Davanagere": ["Davanagere", "Harihar", "Channagiri", "Honnali", "Jagalur", "Nyamathi"],
    "Dharwad": ["Dharwad", "Hubballi", "Hubballi City", "Kalghatgi", "Kundgol", "Navalgund", "Annigeri", "Alnavar"],
    "Gadag": ["Gadag", "Naragund", "Mundargi", "Ron", "Shirhatti", "Gajendragad", "Lakshmeshwar"],
    "Hassan": ["Hassan", "Arsikere", "Channarayapatna", "Holenarasipura", "Sakleshpur", "Alur", "Arkalgud", "Belur"],
    "Haveri": ["Haveri", "Byadgi", "Hangal", "Hirekerur", "Ranebennur", "Savanur", "Shiggaon", "Rattihalli"],
    "Kalaburagi": ["Kalaburagi", "Afzalpur", "Aland", "Chincholi", "Chitapur", "Jevargi", "Sedam", "Kamalapura", "Kalagi", "Shahabad", "Yadrami"],
    "Kodagu": ["Madikeri", "Somwarpet", "Virajpet", "Ponnampet", "Kushalnagar"],
    "Kolar": ["Kolar", "Bangarapet", "Malur", "Mulbagal", "Srinivaspur", "KGF"],
    "Koppal": ["Koppal", "Gangawati", "Kushtagi", "Yelburga", "Kanakagiri", "Karatagi", "Kukanoor"],
    "Mandya": ["Mandya", "Maddur", "Malavalli", "Srirangapatna", "Krishnarajapet", "Nagamangala", "Pandavapura"],
    "Mysuru": ["Mysuru", "Hunsur", "Krishnarajanagara", "Nanjangud", "Heggadadevanakote", "Piriyapatna", "Tirumakudalu Narasipura", "Saligrama", "Sargur"],
    "Raichur": ["Raichur", "Devadurga", "Lingsugur", "Manvi", "Sindhanur", "Sirwar", "Maski"],
    "Ramanagara": ["Ramanagara", "Channapatna", "Kanakapura", "Magadi", "Harohalli"],
    "Shivamogga": ["Shivamogga", "Bhadravati", "Hosanagara", "Shikaripura", "Soraba", "Thirthahalli", "Sagar"],
    "Tumakuru": ["Tumakuru", "Chikkanayakanahalli", "Gubbi", "Koratagere", "Kunigal", "Madhugiri", "Pavagada", "Sira", "Tiptur", "Turuvekere"],
    "Udupi": ["Udupi", "Kundapura", "Karkala", "Byndoor", "Brahmavara", "Kaup", "Hebri"],
    "Uttara Kannada": ["Karwar", "Ankola", "Kumta", "Honnavar", "Bhatkal", "Sirsi", "Siddapur", "Yellapur", "Mundgod", "Haliyal", "Joida", "Dandeli"],
    "Vijayanagara": ["Hosapete", "Harapanahalli", "Hoovina Hadagali", "Hagari Bommanahalli", "Kotturu", "Kudligi"],
    "Vijayapura": ["Vijayapura", "Indi", "Basavana Bagevadi", "Sindagi", "Muddebihal", "Talikota", "Devara Hippargi", "Chadchan", "Babaleshwar", "Kolhar", "Nidagundi", "Tikota"],
    "Yadgir": ["Yadgir", "Shahapur", "Surapura", "Gurmitkal", "Vadagera", "Hunasagi"],

    # ── Maharashtra ──
    "Pune": ["Haveli", "Mulshi", "Maval", "Baramati", "Indapur", "Daund", "Shirur", "Junnar", "Ambegaon", "Khed", "Bhor", "Velhe", "Purandar"],
    "Mumbai City": ["Mumbai City"],
    "Mumbai Suburban": ["Andheri", "Borivali", "Kurla"],
    "Nagpur": ["Nagpur Urban", "Nagpur Rural", "Kamptee", "Hingna", "Saoner", "Parseoni", "Ramtek", "Mouda", "Umred", "Bhiwapur", "Kuhi", "Katol", "Narkhed"],
    "Nashik": ["Nashik", "Igatpuri", "Sinnar", "Dindori", "Peth", "Trimbakeshwar", "Kalwan", "Deola", "Surgana", "Baglan", "Malegaon", "Nandgaon", "Chandwad", "Yeola", "Niphad"],
    "Kolhapur": ["Karveer", "Panhala", "Shahuwadi", "Hatkanangale", "Shirol", "Kagal", "Radhanagari", "Gadhinglaj", "Chandgad", "Bhudargad", "Ajara", "Bavda"],
    "Thane": ["Thane", "Kalyan", "Bhiwandi", "Shahapur", "Murbad", "Ambarnath"],
    "Aurangabad": ["Aurangabad", "Paithan", "Vaijapur", "Gangapur", "Kannad", "Khuldabad", "Phulambri", "Sillod", "Soegaon"],
    "Solapur": ["Solapur North", "Solapur South", "Barshi", "Akkalkot", "Pandharpur", "Sangola", "Mangalvedhe", "Mohol", "Malshiras", "Karmala", "Madha"],
    "Satara": ["Satara", "Karad", "Patan", "Wai", "Mahabaleshwar", "Javali", "Koregaon", "Khandala", "Phaltan", "Man", "Khatav"],
    "Sangli": ["Miraj", "Sangli", "Walwa", "Shirala", "Khanapur", "Atpadi", "Kadegaon", "Jat"],
    "Ahmednagar": ["Ahmednagar", "Rahuri", "Nevasa", "Shevgaon", "Patoda", "Shrirampur", "Kopargaon", "Sangamner", "Akole"],
    "Ratnagiri": ["Ratnagiri", "Chiplun", "Rajapur", "Khed", "Mandangad", "Guhagar", "Dapoli", "Lanja", "Sangameshwar"],

    # ── Tamil Nadu ──
    "Chennai": ["Tondiarpet", "Fort Tondiarpet", "Egmore", "Mambalam", "Mylapore", "Perambur", "Ambattur"],
    "Coimbatore": ["Coimbatore North", "Coimbatore South", "Mettupalayam", "Sulur", "Pollachi", "Valparai", "Kinathukadavu", "Madukkarai", "Anamalai"],
    "Madurai": ["Madurai North", "Madurai South", "Melur", "Thirumangalam", "Usilampatti", "Peraiyur", "Vadipatti"],
    "Salem": ["Salem", "Attur", "Mettur", "Omalur", "Gangavalli", "Yercaud", "Edappadi", "Sankagiri"],
    "Tiruchirappalli": ["Tiruchirappalli", "Srirangam", "Lalgudi", "Musiri", "Manapparai", "Thuraiyur", "Marungapuri"],
    "Thanjavur": ["Thanjavur", "Kumbakonam", "Papanasam", "Orathanadu", "Pattukkottai", "Peravurani", "Thiruvidaimarudur", "Budalur"],
    "Erode": ["Erode", "Bhavani", "Gobichettipalayam", "Sathyamangalam", "Perundurai", "Anthiyur", "Nambiyur"],
    "Tirunelveli": ["Tirunelveli", "Palayamkottai", "Ambasamudram", "Cheranmahadevi", "Nanguneri", "Radhapuram", "Sankarankovil"],
    "Vellore": ["Vellore", "Gudiyatham", "Ambur", "Katpadi", "Anaicut"],
    "Dindigul": ["Dindigul", "Palani", "Kodaikanal", "Oddanchatram", "Natham", "Vedasandur", "Nilakkottai"],
    "Nilgiris": ["Udhagamandalam", "Coonoor", "Kotagiri", "Gudalur", "Pandalur", "Kundah"],
    "Kanchipuram": ["Kanchipuram", "Uthiramerur", "Sriperumbudur", "Walajabad"],
    "Tiruppur": ["Tiruppur North", "Tiruppur South", "Dharapuram", "Kangeyam", "Udumalpet", "Palladam", "Avinashi", "Mulanur"],

    # ── Andhra Pradesh ──
    "Visakhapatnam": ["Visakhapatnam Urban", "Gajuwaka", "Bheemunipatnam", "Anakapalli", "Pendurthi"],
    "Guntur": ["Guntur", "Tenali", "Mangalagiri", "Bapatla", "Narasaraopet", "Ponnuru", "Sattenapalle"],
    "Kurnool": ["Kurnool", "Nandyal", "Adoni", "Yemmiganur", "Mantralayam", "Dhone"],
    "Krishna": ["Machilipatnam", "Vijayawada", "Gudivada", "Nuzvid", "Jaggaiahpet", "Nandigama", "Tiruvuru"],
    "East Godavari": ["Kakinada", "Rajahmundry", "Amalapuram", "Ramachandrapuram", "Peddapuram", "Tuni"],
    "Chittoor": ["Chittoor", "Tirupati", "Madanapalle", "Punganur", "Palamaner", "Pileru", "Kuppam"],
    "Anantapur": ["Anantapur", "Guntakal", "Hindupur", "Dharmavaram", "Penukonda", "Kalyandurg", "Tadpatri"],
    "Kadapa": ["Kadapa", "Proddatur", "Rajampet", "Mydukur", "Jammalamadugu", "Badvel"],
    "Nellore": ["Nellore", "Kavali", "Gudur", "Atmakur", "Udayagiri", "Sullurpeta"],

    # ── Kerala ──
    "Thiruvananthapuram": ["Thiruvananthapuram", "Nedumangad", "Neyyattinkara", "Chirayinkeezhu", "Kattakada", "Varkala"],
    "Kollam": ["Kollam", "Karunagappally", "Kottarakkara", "Punalur", "Pathanapuram", "Chadayamangalam"],
    "Ernakulam": ["Kochi", "Aluva", "Muvattupuzha", "Kothamangalam", "Kunnathunad", "Paravur"],
    "Thrissur": ["Thrissur", "Kodungallur", "Chalakudy", "Irinjalakuda", "Mukundapuram", "Thalapilly", "Chavakkad"],
    "Palakkad": ["Palakkad", "Ottapalam", "Mannarkad", "Chittur", "Alathur", "Pattambi"],
    "Kozhikode": ["Kozhikode", "Vadakara", "Koyilandy", "Quilandy", "Thamarassery"],
    "Malappuram": ["Malappuram", "Ponnani", "Tirur", "Perinthalmanna", "Nilambur", "Ernad", "Kondotty"],
    "Kannur": ["Kannur", "Thalassery", "Taliparamba", "Iritty", "Payyanur"],
    "Kasaragod": ["Kasaragod", "Manjeshwar", "Hosdurg"],
    "Wayanad": ["Kalpetta", "Mananthavady", "Sultan Bathery"],
    "Idukki": ["Thodupuzha", "Devikulam", "Udumbanchola", "Peerumade", "Idukki"],
    "Kottayam": ["Kottayam", "Changanassery", "Vaikom", "Meenachil", "Kanjirapally"],
    "Alappuzha": ["Alappuzha", "Cherthala", "Karthikappally", "Ambalapuzha", "Kuttanad", "Mavelikkara"],
    "Pathanamthitta": ["Pathanamthitta", "Adoor", "Kozhencherry", "Ranni", "Thiruvalla", "Mallappally"],

    # ── Telangana ──
    "Hyderabad": ["Hyderabad Central", "Hyderabad North", "Hyderabad South", "Hyderabad East", "Hyderabad West"],
    "Rangareddy": ["Rajendranagar", "Chevella", "Shamshabad", "Ibrahimpatnam", "Maheshwaram", "Tandur"],
    "Karimnagar": ["Karimnagar", "Huzurabad", "Jammikunta", "Choppadandi", "Manakondur"],
    "Nizamabad": ["Nizamabad", "Bodhan", "Armoor", "Banswada", "Kamareddy"],
    "Khammam": ["Khammam", "Madhira", "Yellandu", "Sathupalli", "Kothagudem"],
    "Nalgonda": ["Nalgonda", "Bhongir", "Miryalaguda", "Devarakonda", "Suryapet"],
    "Warangal Urban": ["Warangal", "Hanamkonda", "Kazipet"],
    "Mahbubnagar": ["Mahbubnagar", "Narayanpet", "Gadwal", "Wanaparthy", "Kollapur", "Nagarkurnool"],
    "Medchal-Malkajgiri": ["Medchal", "Malkajgiri", "Keesara", "Ghatkesar", "Balanagar"],

    # ── Uttar Pradesh ──
    "Lucknow": ["Lucknow", "Mohanlalganj", "Bakshi Ka Talab", "Malihabad", "Sarojininagar"],
    "Varanasi": ["Varanasi", "Pindra", "Rajatalab", "Sevapuri", "Kashi Vidyapeeth"],
    "Agra": ["Agra", "Fatehabad", "Kheragarh", "Etmadpur", "Bah", "Shamshabad"],
    "Kanpur Nagar": ["Kanpur", "Bilhaur", "Ghatampur", "Bhitargaon", "Sarsaul"],
    "Meerut": ["Meerut", "Sardhana", "Mawana", "Parikshitgarh", "Hastinapur"],
    "Gorakhpur": ["Gorakhpur", "Sahjanwan", "Khajni", "Chauri Chaura", "Campierganj", "Bansgaon"],
    "Prayagraj": ["Prayagraj", "Phulpur", "Soraon", "Handia", "Meja", "Koraon", "Bara"],
    "Jhansi": ["Jhansi", "Mauranipur", "Garautha", "Moth", "Chirgaon", "Babina"],

    # ── Rajasthan ──
    "Jaipur": ["Jaipur", "Amber", "Sanganer", "Bassi", "Chaksu", "Jamwa Ramgarh", "Kotputli", "Shahpura", "Chomu", "Phulera"],
    "Jodhpur": ["Jodhpur", "Bilara", "Phalodi", "Shergarh", "Osian", "Bhopalgarh", "Luni"],
    "Udaipur": ["Udaipur", "Vallabhnagar", "Salumber", "Kherwara", "Girwa", "Gogunda", "Mavli"],
    "Kota": ["Kota", "Ladpura", "Ramganjmandi", "Sangod", "Itawa", "Digod"],
    "Bikaner": ["Bikaner", "Nokha", "Lunkaransar", "Kolayat", "Khajuwala"],
    "Ajmer": ["Ajmer", "Beawar", "Kishangarh", "Nasirabad", "Kekri", "Sarwar"],
    "Alwar": ["Alwar", "Behror", "Tijara", "Bansur", "Laxmangarh", "Rajgarh", "Kotkasim", "Thanagazi"],

    # ── Gujarat ──
    "Ahmedabad": ["Ahmedabad City", "Daskroi", "Dholka", "Sanand", "Bavla", "Detroj", "Dhandhuka", "Viramgam", "Mandal"],
    "Surat": ["Surat City", "Choryasi", "Palsana", "Kamrej", "Olpad", "Bardoli", "Mangrol", "Mandvi"],
    "Rajkot": ["Rajkot", "Lodhika", "Kotda Sangani", "Jasdan", "Gondal", "Jetpur", "Dhoraji", "Upleta"],
    "Vadodara": ["Vadodara", "Padra", "Savli", "Dabhoi", "Karjan", "Shinor", "Waghodia"],
    "Bhavnagar": ["Bhavnagar", "Sihor", "Palitana", "Mahuva", "Gariadhar", "Ghogha", "Talaja", "Botad"],
    "Kutch": ["Bhuj", "Anjar", "Mundra", "Mandvi", "Nakhatrana", "Abdasa", "Lakhpat", "Rapar", "Bhachau", "Gandhidham"],
    "Gandhinagar": ["Gandhinagar", "Kalol", "Dehgam", "Mansa"],

    # ── Madhya Pradesh ──
    "Bhopal": ["Huzur", "Berasia", "Phanda"],
    "Indore": ["Indore", "Depalpur", "Mhow", "Sanwer"],
    "Jabalpur": ["Jabalpur", "Sihora", "Patan", "Panagar", "Shahpura", "Kundam", "Bargi"],
    "Gwalior": ["Gwalior", "Morar", "Dabra", "Bhitarwar"],
    "Ujjain": ["Ujjain", "Nagda", "Tarana", "Mahidpur", "Khachrod", "Barnagar"],
    "Sagar": ["Sagar", "Rehli", "Bina", "Khurai", "Banda", "Rahatgarh"],

    # ── Punjab ──
    "Ludhiana": ["Ludhiana East", "Ludhiana West", "Khanna", "Samrala", "Jagraon", "Raikot", "Payal"],
    "Amritsar": ["Amritsar-I", "Amritsar-II", "Ajnala", "Baba Bakala", "Majitha", "Verka"],
    "Jalandhar": ["Jalandhar-I", "Jalandhar-II", "Nakodar", "Phillaur", "Shahkot", "Adampur"],
    "Patiala": ["Patiala", "Rajpura", "Nabha", "Samana", "Patran"],
    "Bathinda": ["Bathinda", "Rampura Phul", "Talwandi Sabo", "Sangat", "Maur"],

    # ── Haryana ──
    "Gurugram": ["Gurugram", "Sohna", "Pataudi", "Farrukhnagar"],
    "Karnal": ["Karnal", "Assandh", "Indri", "Nilokheri", "Gharaunda"],
    "Ambala": ["Ambala", "Barara", "Naraingarh", "Shahzadpur"],
    "Hisar": ["Hisar", "Hansi", "Barwala", "Narnaund", "Adampur"],
    "Panipat": ["Panipat", "Samalkha", "Israna", "Madlauda"],
    "Faridabad": ["Faridabad", "Ballabhgarh", "Palwal", "Hathin"],
}

# Coordinates map for Karnataka taluks/districts to allow weather lookup and map centering without GPS.
TALUK_COORDS = {
    # Dakshina Kannada
    "Mangaluru": (12.9141, 74.8560),
    "Bantwal": (12.9000, 75.0333),
    "Puttur": (12.7667, 75.2167),
    "Belthangady": (12.9667, 75.3000),
    "Sullia": (12.5667, 75.3833),
    "Moodabidri": (13.0700, 74.9900),
    "Kadaba": (12.7833, 75.4167),
    # Udupi
    "Udupi": (13.3409, 74.7421),
    "Karkala": (13.2167, 74.9833),
    "Kundapura": (13.6244, 74.6936),
    "Byndoor": (13.8667, 74.6333),
    "Brahmavara": (13.4167, 74.7500),
    "Kaup": (13.2167, 74.7500),
    "Hebri": (13.4667, 75.0667),
    # Uttara Kannada
    "Karwar": (14.8000, 74.1300),
    "Ankola": (14.6667, 74.3000),
    "Kumta": (14.4333, 74.4167),
    "Honnavar": (14.2833, 74.4500),
    "Bhatkal": (13.9667, 74.5500),
    "Sirsi": (14.6195, 74.8441),
    "Siddapur": (14.3333, 74.8833),
    "Yellapur": (14.9667, 74.7000),
    "Mundgod": (14.9667, 75.0333),
    "Haliyal": (15.3333, 74.7667),
    "Joida": (15.1500, 74.4833),
    "Dandeli": (15.2500, 74.6167),
    # Bengaluru Urban
    "Bengaluru North": (13.0500, 77.5800),
    "Bengaluru South": (12.9000, 77.5800),
    "Bengaluru East": (12.9700, 77.6500),
    "Yelahanka": (13.1008, 77.5963),
    "Anekal": (12.7107, 77.6975),
    # Bengaluru Rural
    "Devanahalli": (13.2483, 77.7128),
    "Doddaballapura": (13.2925, 77.5428),
    "Hoskote": (13.0706, 77.7981),
    "Nelamangala": (13.0978, 77.3944),
    # Hassan
    "Hassan": (13.0050, 76.1028),
    "Sakleshpur": (12.9436, 75.7861),
    "Sakleshpura": (12.9436, 75.7861),
    # Chikkamagaluru
    "Chikkamagaluru": (13.3161, 75.7720),
    "Sringeri": (13.4214, 75.2572),
    # Kodagu
    "Madikeri": (12.4244, 75.7389),
    "Somwarpet": (12.5958, 75.8622),
    "Virajpet": (12.1994, 75.8033),
    # Shivamogga
    "Shivamogga": (13.9299, 75.5681),
    "Sagar": (14.1667, 75.0333),
    "Sagara": (14.1667, 75.0333),
    # Tumakuru
    "Tumakuru": (13.3392, 77.1140),
    # Mandya
    "Mandya": (12.5218, 76.8973),
    # Mysuru
    "Mysuru": (12.2958, 76.6394),
    # Kalaburagi
    "Kalaburagi": (17.3297, 76.8343),
    # Belagavi
    "Belagavi": (15.8497, 74.4977),
    # Davanagere
    "Davanagere": (14.4644, 75.9219),
    # Dharwad
    "Dharwad": (15.4589, 75.0078),
    # Bellary
    "Ballari": (15.1394, 76.9214),
    # Bagalkot
    "Bagalkot": (16.1817, 75.6958),
    # Bidar
    "Bidar": (17.9104, 77.5199),
    # Vijayapura
    "Vijayapura": (16.8302, 75.7100),
}

# Coordinate map for all hoblis in Uttara Kannada district to center the map precisely.
HOBLI_COORDS = {
    # Karwar taluk hoblis
    "Karwar Kasaba": (14.8000, 74.1300),
    "Asnoti": (14.8350, 74.1680),
    "Majali": (14.8780, 74.1080),
    "Shirwad": (14.7950, 74.1750),
    
    # Ankola taluk hoblis
    "Ankola Kasaba": (14.6667, 74.3000),
    "Hattikeri": (14.6850, 74.3300),
    "Poojageri": (14.6420, 74.3220),
    
    # Kumta taluk hoblis
    "Kumta Kasaba": (14.4333, 74.4167),
    "Gokarna": (14.5420, 74.3160),
    "Hiregutti": (14.5020, 74.3720),
    "Mirjan": (14.4850, 74.4180),
    
    # Honnavar taluk hoblis
    "Honnavar Kasaba": (14.2833, 74.4500),
    "Manki": (14.1850, 74.4620),
    "Gersoppa": (14.2380, 74.5850),
    "Haldipur": (14.3250, 74.4320),
    
    # Bhatkal taluk hoblis
    "Bhatkal Kasaba": (13.9667, 74.5500),
    "Shirali": (14.0150, 74.5250),
    "Murdeshwar": (14.0940, 74.4850),
    
    # Sirsi taluk hoblis
    "Sirsi Kasaba": (14.6195, 74.8441),
    "Banavasi": (14.5320, 75.0180),
    "Sampkhand": (14.6880, 74.7650),
    "Hulekal": (14.6350, 74.7320),
    
    # Siddapur taluk hoblis
    "Siddapur Kasaba": (14.3333, 74.8833),
    "Bilgi": (14.3680, 74.8080),
    "Kyadgi": (14.2650, 74.9120),
    "Harsikatta": (14.3980, 74.9250),

    # Yellapur taluk hoblis
    "Yellapur Kasaba": (14.9667, 74.7000),
    "Kirwatti": (15.0150, 74.8320),
    "Manchikere": (14.8850, 74.7620),

    # Mundgod taluk hoblis
    "Mundgod Kasaba": (14.9667, 75.0333),
    "Koppa": (14.8820, 75.0150),
    "Pala": (15.0250, 75.0580),

    # Haliyal taluk hoblis
    "Haliyal Kasaba": (15.3333, 74.7667),
    "Tergaon": (15.3950, 74.7250),
    "Mangalwad": (15.2480, 74.8150),

    # Joida taluk hoblis
    "Joida Kasaba": (15.1500, 74.4833),
    "Gund": (15.0780, 74.3250),
    "Castlerock": (15.4320, 74.3350),
    "Ulvi": (15.0120, 74.5050),

    # Dandeli taluk hoblis
    "Dandeli Kasaba": (15.2500, 74.6167),
    "Ambikanagar": (15.1780, 74.6320)
}

DISTRICT_BASELINES = {
    "Dakshina Kannada": {"soil_type": "Laterite", "ph": 5.8, "avg_temp": 28.0, "avg_humidity": 85, "avg_rainfall": 3800},
    "Udupi": {"soil_type": "Laterite", "ph": 5.9, "avg_temp": 28.5, "avg_humidity": 85, "avg_rainfall": 3700},
    "Uttara Kannada": {"soil_type": "Laterite", "ph": 5.7, "avg_temp": 27.5, "avg_humidity": 82, "avg_rainfall": 3200},
    
    "Chikkamagaluru": {"soil_type": "Red Clayey", "ph": 5.9, "avg_temp": 22.0, "avg_humidity": 75, "avg_rainfall": 2100},
    "Kodagu": {"soil_type": "Red Clayey", "ph": 5.8, "avg_temp": 21.0, "avg_humidity": 78, "avg_rainfall": 2300},
    "Hassan": {"soil_type": "Red Sandy", "ph": 6.2, "avg_temp": 24.0, "avg_humidity": 72, "avg_rainfall": 1200},
    "Shivamogga": {"soil_type": "Red Loamy", "ph": 6.1, "avg_temp": 25.5, "avg_humidity": 74, "avg_rainfall": 1800},

    "Bengaluru Rural": {"soil_type": "Red Sandy", "ph": 6.5, "avg_temp": 26.0, "avg_humidity": 62, "avg_rainfall": 820},
    "Bengaluru Urban": {"soil_type": "Red Sandy", "ph": 6.6, "avg_temp": 26.2, "avg_humidity": 60, "avg_rainfall": 800},
    "Kolar": {"soil_type": "Red Sandy", "ph": 6.8, "avg_temp": 27.0, "avg_humidity": 58, "avg_rainfall": 720},
    "Chikkaballapur": {"soil_type": "Red Sandy", "ph": 6.7, "avg_temp": 26.8, "avg_humidity": 59, "avg_rainfall": 750},
    "Tumakuru": {"soil_type": "Red Loam", "ph": 6.6, "avg_temp": 27.2, "avg_humidity": 56, "avg_rainfall": 780},
    "Ramanagara": {"soil_type": "Red Sandy", "ph": 6.4, "avg_temp": 27.5, "avg_humidity": 61, "avg_rainfall": 840},
    "Mandya": {"soil_type": "Red Sandy", "ph": 6.8, "avg_temp": 28.0, "avg_humidity": 63, "avg_rainfall": 710},
    "Mysuru": {"soil_type": "Red Loamy", "ph": 6.7, "avg_temp": 26.8, "avg_humidity": 65, "avg_rainfall": 790},
    "Chamarajanagar": {"soil_type": "Red Loamy", "ph": 6.8, "avg_temp": 27.0, "avg_humidity": 62, "avg_rainfall": 730},

    "Bagalkot": {"soil_type": "Black Clayey", "ph": 7.8, "avg_temp": 32.5, "avg_humidity": 45, "avg_rainfall": 560},
    "Ballari": {"soil_type": "Black Clayey", "ph": 7.9, "avg_temp": 33.8, "avg_humidity": 42, "avg_rainfall": 580},
    "Belagavi": {"soil_type": "Black Clayey", "ph": 7.4, "avg_temp": 27.2, "avg_humidity": 68, "avg_rainfall": 880},
    "Bidar": {"soil_type": "Black Clayey", "ph": 7.6, "avg_temp": 31.0, "avg_humidity": 50, "avg_rainfall": 820},
    "Chitradurga": {"soil_type": "Mixed Red & Black", "ph": 7.5, "avg_temp": 29.5, "avg_humidity": 52, "avg_rainfall": 590},
    "Davanagere": {"soil_type": "Mixed Red & Black", "ph": 7.4, "avg_temp": 29.8, "avg_humidity": 55, "avg_rainfall": 680},
    "Dharwad": {"soil_type": "Black Clayey", "ph": 7.6, "avg_temp": 28.5, "avg_humidity": 62, "avg_rainfall": 740},
    "Gadag": {"soil_type": "Black Clayey", "ph": 7.8, "avg_temp": 31.0, "avg_humidity": 48, "avg_rainfall": 610},
    "Haveri": {"soil_type": "Red Loamy", "ph": 6.8, "avg_temp": 29.0, "avg_humidity": 64, "avg_rainfall": 780},
    "Kalaburagi": {"soil_type": "Black Clayey", "ph": 8.0, "avg_temp": 34.0, "avg_humidity": 44, "avg_rainfall": 750},
    "Koppal": {"soil_type": "Mixed Red & Black", "ph": 7.9, "avg_temp": 32.8, "avg_humidity": 45, "avg_rainfall": 570},
    "Raichur": {"soil_type": "Black Clayey", "ph": 8.1, "avg_temp": 34.5, "avg_humidity": 43, "avg_rainfall": 610},
    "Vijayanagara": {"soil_type": "Black Clayey", "ph": 7.8, "avg_temp": 33.2, "avg_humidity": 43, "avg_rainfall": 590},
    "Vijayapura": {"soil_type": "Black Clayey", "ph": 8.2, "avg_temp": 33.5, "avg_humidity": 40, "avg_rainfall": 550},
    "Yadgir": {"soil_type": "Black Clayey", "ph": 8.0, "avg_temp": 33.8, "avg_humidity": 44, "avg_rainfall": 720},

    # ── Maharashtra ──
    "Pune": {"soil_type": "Red Laterite", "ph": 6.5, "avg_temp": 25.5, "avg_humidity": 60, "avg_rainfall": 720},
    "Mumbai City": {"soil_type": "Coastal Alluvial", "ph": 7.0, "avg_temp": 27.5, "avg_humidity": 80, "avg_rainfall": 2400},
    "Mumbai Suburban": {"soil_type": "Coastal Alluvial", "ph": 7.0, "avg_temp": 27.5, "avg_humidity": 80, "avg_rainfall": 2400},
    "Nagpur": {"soil_type": "Black Cotton", "ph": 7.8, "avg_temp": 30.5, "avg_humidity": 55, "avg_rainfall": 1100},
    "Nashik": {"soil_type": "Red Laterite", "ph": 6.8, "avg_temp": 26.0, "avg_humidity": 58, "avg_rainfall": 670},
    "Kolhapur": {"soil_type": "Laterite", "ph": 6.2, "avg_temp": 26.5, "avg_humidity": 72, "avg_rainfall": 1200},
    "Thane": {"soil_type": "Laterite", "ph": 6.5, "avg_temp": 27.0, "avg_humidity": 78, "avg_rainfall": 2500},
    "Aurangabad": {"soil_type": "Black Cotton", "ph": 7.5, "avg_temp": 29.0, "avg_humidity": 50, "avg_rainfall": 650},
    "Solapur": {"soil_type": "Black Cotton", "ph": 7.8, "avg_temp": 30.0, "avg_humidity": 45, "avg_rainfall": 550},
    "Satara": {"soil_type": "Laterite", "ph": 6.4, "avg_temp": 25.0, "avg_humidity": 65, "avg_rainfall": 900},
    "Sangli": {"soil_type": "Black Cotton", "ph": 7.5, "avg_temp": 28.0, "avg_humidity": 55, "avg_rainfall": 600},
    "Ahmednagar": {"soil_type": "Red Laterite", "ph": 6.8, "avg_temp": 27.5, "avg_humidity": 55, "avg_rainfall": 650},
    "Ratnagiri": {"soil_type": "Laterite", "ph": 5.8, "avg_temp": 27.0, "avg_humidity": 80, "avg_rainfall": 3200},

    # ── Tamil Nadu ──
    "Chennai": {"soil_type": "Coastal Alluvial", "ph": 7.2, "avg_temp": 28.5, "avg_humidity": 75, "avg_rainfall": 1400},
    "Coimbatore": {"soil_type": "Red Loamy", "ph": 6.8, "avg_temp": 27.0, "avg_humidity": 60, "avg_rainfall": 700},
    "Madurai": {"soil_type": "Black Cotton", "ph": 7.5, "avg_temp": 29.5, "avg_humidity": 65, "avg_rainfall": 850},
    "Salem": {"soil_type": "Red Sandy", "ph": 6.5, "avg_temp": 28.0, "avg_humidity": 55, "avg_rainfall": 900},
    "Thanjavur": {"soil_type": "Alluvial", "ph": 7.0, "avg_temp": 29.0, "avg_humidity": 70, "avg_rainfall": 1000},
    "Tiruchirappalli": {"soil_type": "Red Sandy", "ph": 7.0, "avg_temp": 29.0, "avg_humidity": 60, "avg_rainfall": 800},
    "Tirunelveli": {"soil_type": "Red Loamy", "ph": 6.5, "avg_temp": 28.5, "avg_humidity": 70, "avg_rainfall": 750},
    "Erode": {"soil_type": "Red Loamy", "ph": 6.8, "avg_temp": 28.0, "avg_humidity": 58, "avg_rainfall": 650},
    "Nilgiris": {"soil_type": "Laterite", "ph": 5.5, "avg_temp": 16.0, "avg_humidity": 80, "avg_rainfall": 1900},
    "Vellore": {"soil_type": "Red Sandy", "ph": 6.8, "avg_temp": 28.5, "avg_humidity": 62, "avg_rainfall": 950},
    "Dindigul": {"soil_type": "Red Loamy", "ph": 6.5, "avg_temp": 28.0, "avg_humidity": 62, "avg_rainfall": 800},
    "Tiruppur": {"soil_type": "Red Loamy", "ph": 6.8, "avg_temp": 27.5, "avg_humidity": 60, "avg_rainfall": 700},

    # ── Andhra Pradesh ──
    "Visakhapatnam": {"soil_type": "Red Sandy", "ph": 6.5, "avg_temp": 28.0, "avg_humidity": 75, "avg_rainfall": 1100},
    "Guntur": {"soil_type": "Black Cotton", "ph": 7.5, "avg_temp": 30.0, "avg_humidity": 65, "avg_rainfall": 800},
    "Kurnool": {"soil_type": "Black Cotton", "ph": 7.8, "avg_temp": 31.0, "avg_humidity": 50, "avg_rainfall": 600},
    "Krishna": {"soil_type": "Alluvial", "ph": 7.0, "avg_temp": 29.5, "avg_humidity": 70, "avg_rainfall": 1000},
    "East Godavari": {"soil_type": "Alluvial", "ph": 6.8, "avg_temp": 28.5, "avg_humidity": 75, "avg_rainfall": 1200},
    "Chittoor": {"soil_type": "Red Loamy", "ph": 6.5, "avg_temp": 27.5, "avg_humidity": 60, "avg_rainfall": 750},
    "Anantapur": {"soil_type": "Red Sandy", "ph": 7.2, "avg_temp": 30.5, "avg_humidity": 45, "avg_rainfall": 550},
    "Kadapa": {"soil_type": "Red Sandy", "ph": 7.0, "avg_temp": 30.0, "avg_humidity": 52, "avg_rainfall": 650},
    "Nellore": {"soil_type": "Sandy Loam", "ph": 6.8, "avg_temp": 29.5, "avg_humidity": 70, "avg_rainfall": 1000},

    # ── Kerala ──
    "Thiruvananthapuram": {"soil_type": "Laterite", "ph": 5.5, "avg_temp": 27.5, "avg_humidity": 80, "avg_rainfall": 1800},
    "Ernakulam": {"soil_type": "Laterite", "ph": 5.8, "avg_temp": 27.0, "avg_humidity": 78, "avg_rainfall": 3100},
    "Palakkad": {"soil_type": "Red Loamy", "ph": 6.2, "avg_temp": 28.0, "avg_humidity": 70, "avg_rainfall": 2200},
    "Kozhikode": {"soil_type": "Laterite", "ph": 5.5, "avg_temp": 27.0, "avg_humidity": 82, "avg_rainfall": 3500},
    "Wayanad": {"soil_type": "Forest Loam", "ph": 5.8, "avg_temp": 23.0, "avg_humidity": 85, "avg_rainfall": 2800},
    "Idukki": {"soil_type": "Forest Loam", "ph": 5.2, "avg_temp": 22.0, "avg_humidity": 85, "avg_rainfall": 3200},
    "Kasaragod": {"soil_type": "Laterite", "ph": 5.5, "avg_temp": 28.0, "avg_humidity": 80, "avg_rainfall": 3400},
    "Thrissur": {"soil_type": "Laterite", "ph": 5.8, "avg_temp": 27.5, "avg_humidity": 78, "avg_rainfall": 3000},
    "Malappuram": {"soil_type": "Laterite", "ph": 5.6, "avg_temp": 27.5, "avg_humidity": 80, "avg_rainfall": 3200},
    "Kollam": {"soil_type": "Laterite", "ph": 5.5, "avg_temp": 28.0, "avg_humidity": 80, "avg_rainfall": 2600},
    "Kottayam": {"soil_type": "Red Loamy", "ph": 5.5, "avg_temp": 27.0, "avg_humidity": 80, "avg_rainfall": 3000},
    "Alappuzha": {"soil_type": "Coastal Alluvial", "ph": 6.0, "avg_temp": 28.0, "avg_humidity": 80, "avg_rainfall": 2700},
    "Kannur": {"soil_type": "Laterite", "ph": 5.5, "avg_temp": 27.5, "avg_humidity": 80, "avg_rainfall": 3400},

    # ── Telangana ──
    "Hyderabad": {"soil_type": "Red Sandy", "ph": 7.0, "avg_temp": 27.5, "avg_humidity": 55, "avg_rainfall": 800},
    "Rangareddy": {"soil_type": "Red Sandy", "ph": 7.0, "avg_temp": 28.0, "avg_humidity": 55, "avg_rainfall": 750},
    "Karimnagar": {"soil_type": "Black Cotton", "ph": 7.5, "avg_temp": 29.0, "avg_humidity": 58, "avg_rainfall": 900},
    "Nizamabad": {"soil_type": "Black Cotton", "ph": 7.2, "avg_temp": 28.5, "avg_humidity": 60, "avg_rainfall": 950},
    "Khammam": {"soil_type": "Red Loamy", "ph": 6.5, "avg_temp": 28.5, "avg_humidity": 65, "avg_rainfall": 1100},
    "Nalgonda": {"soil_type": "Red Sandy", "ph": 7.0, "avg_temp": 29.5, "avg_humidity": 55, "avg_rainfall": 700},
    "Warangal Urban": {"soil_type": "Black Cotton", "ph": 7.2, "avg_temp": 28.5, "avg_humidity": 60, "avg_rainfall": 950},
    "Medchal-Malkajgiri": {"soil_type": "Red Sandy", "ph": 6.8, "avg_temp": 27.5, "avg_humidity": 58, "avg_rainfall": 850},

    # ── Uttar Pradesh ──
    "Lucknow": {"soil_type": "Alluvial", "ph": 7.5, "avg_temp": 26.0, "avg_humidity": 65, "avg_rainfall": 1000},
    "Varanasi": {"soil_type": "Alluvial", "ph": 7.2, "avg_temp": 27.0, "avg_humidity": 68, "avg_rainfall": 1050},
    "Agra": {"soil_type": "Alluvial", "ph": 7.8, "avg_temp": 26.5, "avg_humidity": 55, "avg_rainfall": 650},
    "Kanpur Nagar": {"soil_type": "Alluvial", "ph": 7.5, "avg_temp": 26.0, "avg_humidity": 60, "avg_rainfall": 800},
    "Meerut": {"soil_type": "Alluvial", "ph": 7.5, "avg_temp": 24.5, "avg_humidity": 65, "avg_rainfall": 850},
    "Gorakhpur": {"soil_type": "Alluvial", "ph": 7.0, "avg_temp": 26.5, "avg_humidity": 72, "avg_rainfall": 1300},
    "Prayagraj": {"soil_type": "Alluvial", "ph": 7.2, "avg_temp": 27.0, "avg_humidity": 68, "avg_rainfall": 1050},

    # ── Rajasthan ──
    "Jaipur": {"soil_type": "Sandy Loam", "ph": 7.8, "avg_temp": 27.0, "avg_humidity": 40, "avg_rainfall": 600},
    "Jodhpur": {"soil_type": "Desert Sandy", "ph": 8.2, "avg_temp": 28.5, "avg_humidity": 35, "avg_rainfall": 360},
    "Udaipur": {"soil_type": "Red Loamy", "ph": 7.0, "avg_temp": 25.0, "avg_humidity": 50, "avg_rainfall": 650},
    "Kota": {"soil_type": "Black Cotton", "ph": 7.5, "avg_temp": 27.0, "avg_humidity": 50, "avg_rainfall": 800},
    "Bikaner": {"soil_type": "Desert Sandy", "ph": 8.5, "avg_temp": 28.0, "avg_humidity": 30, "avg_rainfall": 250},
    "Ajmer": {"soil_type": "Sandy Loam", "ph": 7.5, "avg_temp": 26.5, "avg_humidity": 42, "avg_rainfall": 520},
    "Alwar": {"soil_type": "Sandy Loam", "ph": 7.5, "avg_temp": 26.0, "avg_humidity": 45, "avg_rainfall": 650},

    # ── Gujarat ──
    "Ahmedabad": {"soil_type": "Sandy Loam", "ph": 7.5, "avg_temp": 28.0, "avg_humidity": 55, "avg_rainfall": 750},
    "Surat": {"soil_type": "Black Cotton", "ph": 7.0, "avg_temp": 28.0, "avg_humidity": 70, "avg_rainfall": 1200},
    "Rajkot": {"soil_type": "Black Cotton", "ph": 7.5, "avg_temp": 27.5, "avg_humidity": 55, "avg_rainfall": 600},
    "Kutch": {"soil_type": "Desert Sandy", "ph": 8.0, "avg_temp": 28.5, "avg_humidity": 40, "avg_rainfall": 350},
    "Vadodara": {"soil_type": "Black Cotton", "ph": 7.2, "avg_temp": 28.0, "avg_humidity": 60, "avg_rainfall": 950},
    "Bhavnagar": {"soil_type": "Black Cotton", "ph": 7.5, "avg_temp": 27.5, "avg_humidity": 60, "avg_rainfall": 650},
    "Gandhinagar": {"soil_type": "Sandy Loam", "ph": 7.5, "avg_temp": 27.5, "avg_humidity": 55, "avg_rainfall": 780},

    # ── Madhya Pradesh ──
    "Bhopal": {"soil_type": "Black Cotton", "ph": 7.5, "avg_temp": 26.0, "avg_humidity": 58, "avg_rainfall": 1200},
    "Indore": {"soil_type": "Black Cotton", "ph": 7.8, "avg_temp": 26.5, "avg_humidity": 55, "avg_rainfall": 950},
    "Jabalpur": {"soil_type": "Black Cotton", "ph": 7.2, "avg_temp": 26.5, "avg_humidity": 60, "avg_rainfall": 1400},
    "Gwalior": {"soil_type": "Alluvial", "ph": 7.5, "avg_temp": 27.0, "avg_humidity": 50, "avg_rainfall": 800},
    "Ujjain": {"soil_type": "Black Cotton", "ph": 7.8, "avg_temp": 27.0, "avg_humidity": 52, "avg_rainfall": 900},
    "Sagar": {"soil_type": "Black Cotton", "ph": 7.5, "avg_temp": 26.5, "avg_humidity": 55, "avg_rainfall": 1100},

    # ── Punjab ──
    "Ludhiana": {"soil_type": "Alluvial", "ph": 7.5, "avg_temp": 24.5, "avg_humidity": 65, "avg_rainfall": 750},
    "Amritsar": {"soil_type": "Alluvial", "ph": 7.8, "avg_temp": 24.0, "avg_humidity": 62, "avg_rainfall": 680},
    "Jalandhar": {"soil_type": "Alluvial", "ph": 7.5, "avg_temp": 24.0, "avg_humidity": 62, "avg_rainfall": 700},
    "Patiala": {"soil_type": "Alluvial", "ph": 7.5, "avg_temp": 24.5, "avg_humidity": 60, "avg_rainfall": 700},
    "Bathinda": {"soil_type": "Sandy Loam", "ph": 8.0, "avg_temp": 25.0, "avg_humidity": 50, "avg_rainfall": 400},

    # ── Haryana ──
    "Gurugram": {"soil_type": "Sandy Loam", "ph": 7.8, "avg_temp": 25.5, "avg_humidity": 55, "avg_rainfall": 600},
    "Karnal": {"soil_type": "Alluvial", "ph": 7.5, "avg_temp": 24.5, "avg_humidity": 65, "avg_rainfall": 750},
    "Hisar": {"soil_type": "Sandy Loam", "ph": 8.0, "avg_temp": 26.0, "avg_humidity": 48, "avg_rainfall": 450},
    "Ambala": {"soil_type": "Alluvial", "ph": 7.2, "avg_temp": 24.0, "avg_humidity": 65, "avg_rainfall": 850},
    "Faridabad": {"soil_type": "Sandy Loam", "ph": 7.8, "avg_temp": 25.5, "avg_humidity": 58, "avg_rainfall": 680}
}

CROP_PROFILES = {
    "Banana": {"ph": 6.0, "temp": 28.0, "humidity": 80.0, "rainfall": 2000.0},
    "Arecanut": {"ph": 6.0, "temp": 26.0, "humidity": 80.0, "rainfall": 2500.0},
    "Pepper": {"ph": 5.8, "temp": 27.0, "humidity": 85.0, "rainfall": 2200.0},
    "Cashew": {"ph": 5.5, "temp": 30.0, "humidity": 75.0, "rainfall": 1500.0},
    "Rubber": {"ph": 5.5, "temp": 28.0, "humidity": 85.0, "rainfall": 3000.0},
    "Coconut": {"ph": 6.5, "temp": 29.0, "humidity": 80.0, "rainfall": 1800.0},
    "Rice": {"ph": 6.2, "temp": 29.0, "humidity": 85.0, "rainfall": 1500.0},
    
    "Coffee": {"ph": 5.8, "temp": 22.0, "humidity": 80.0, "rainfall": 2000.0},
    "Cardamom": {"ph": 5.5, "temp": 20.0, "humidity": 85.0, "rainfall": 2500.0},
    "Ginger": {"ph": 6.0, "temp": 25.0, "humidity": 75.0, "rainfall": 1800.0},

    "Jowar": {"ph": 7.5, "temp": 32.0, "humidity": 45.0, "rainfall": 600.0},
    "Cotton": {"ph": 7.8, "temp": 31.0, "humidity": 50.0, "rainfall": 700.0},
    "Maize": {"ph": 6.5, "temp": 28.0, "humidity": 60.0, "rainfall": 800.0},
    "Bengal Gram": {"ph": 7.2, "temp": 24.0, "humidity": 45.0, "rainfall": 500.0},
    "Red Gram": {"ph": 7.5, "temp": 30.0, "humidity": 45.0, "rainfall": 650.0},
    "Wheat": {"ph": 7.0, "temp": 22.0, "humidity": 50.0, "rainfall": 600.0},
    "Pomegranate": {"ph": 7.5, "temp": 32.0, "humidity": 40.0, "rainfall": 600.0},
    
    "Ragi": {"ph": 6.5, "temp": 27.0, "humidity": 60.0, "rainfall": 750.0},
    "Groundnut": {"ph": 6.5, "temp": 28.0, "humidity": 55.0, "rainfall": 700.0},
    "Sugarcane": {"ph": 7.0, "temp": 29.0, "humidity": 70.0, "rainfall": 1200.0},
    "Tomato": {"ph": 6.2, "temp": 26.0, "humidity": 60.0, "rainfall": 750.0},
    "Mango": {"ph": 6.5, "temp": 28.0, "humidity": 60.0, "rainfall": 900.0},
    "Onion": {"ph": 6.5, "temp": 25.0, "humidity": 65.0, "rainfall": 700.0},
    "Potato": {"ph": 5.5, "temp": 20.0, "humidity": 70.0, "rainfall": 800.0},
    "Turmeric": {"ph": 6.0, "temp": 27.0, "humidity": 80.0, "rainfall": 1500.0},
    "Chilli": {"ph": 6.5, "temp": 28.0, "humidity": 65.0, "rainfall": 900.0},
}

# Comprehensive crop species/varieties with individual prices
CROP_SPECIES = {
    "Rice": {
        "unit": "quintal",
        "botanical_genus": "Oryza sativa",
        "varieties": [
            {
                "name": "Sona Masuri",
                "scientific_species": "Oryza sativa subsp. indica",
                "price": 2800,
                "price_display": "₹2,800/quintal",
                "season": "Kharif",
                "duration_days": 120,
                "yield_per_acre": 18,
                "characteristics": "Medium slender grain, premium table rice, high demand in Karnataka & AP"
            },
            {
                "name": "IR-64",
                "scientific_species": "Oryza sativa subsp. indica",
                "price": 2200,
                "price_display": "₹2,200/quintal",
                "season": "Kharif",
                "duration_days": 115,
                "yield_per_acre": 22,
                "characteristics": "High yielding semi-dwarf variety, resistant to blast and bacterial blight"
            },
            {
                "name": "Basmati (Pusa 1121)",
                "scientific_species": "Oryza sativa subsp. indica",
                "price": 4500,
                "price_display": "₹4,500/quintal",
                "season": "Kharif",
                "duration_days": 145,
                "yield_per_acre": 14,
                "characteristics": "Extra-long grain aromatic rice with exceptional elongation after cooking"
            },
            {
                "name": "Ponni",
                "scientific_species": "Oryza sativa subsp. indica",
                "price": 2600,
                "price_display": "₹2,600/quintal",
                "season": "Kharif/Rabi",
                "duration_days": 130,
                "yield_per_acre": 16,
                "characteristics": "Popular fine grain table rice, good milling quality and pest tolerance"
            },
            {
                "name": "Jaya",
                "scientific_species": "Oryza sativa subsp. indica",
                "price": 2100,
                "price_display": "₹2,100/quintal",
                "season": "Kharif",
                "duration_days": 125,
                "yield_per_acre": 20,
                "characteristics": "Standard high yield coarse variety widely grown across coastal Karnataka"
            },
            {
                "name": "BPT 5204 (Samba Mahsuri)",
                "scientific_species": "Oryza sativa subsp. indica",
                "price": 2900,
                "price_display": "₹2,900/quintal",
                "season": "Kharif",
                "duration_days": 150,
                "yield_per_acre": 15,
                "characteristics": "Fine grain, excellent cooking quality, fetched top prices in open markets"
            },
            {
                "name": "KMP-220 (Tunga)",
                "scientific_species": "Oryza sativa subsp. indica",
                "price": 2400,
                "price_display": "₹2,400/quintal",
                "season": "Kharif",
                "duration_days": 110,
                "yield_per_acre": 19,
                "characteristics": "Bred by UAS Bengaluru, blast resistant and early maturing variety"
            },
            {
                "name": "Jyothi (PTB-10)",
                "scientific_species": "Oryza sativa subsp. indica",
                "price": 2350,
                "price_display": "₹2,350/quintal",
                "season": "Kharif/Rabi",
                "duration_days": 118,
                "yield_per_acre": 19,
                "characteristics": "Red kernelled semi-tall rice variety, popular in coastal Dakshina Kannada & Udupi"
            }
        ]
    },
    "Banana": {
        "unit": "kg",
        "botanical_genus": "Musa acuminata",
        "varieties": [
            {
                "name": "Robusta (Cavendish)",
                "scientific_species": "Musa acuminata (AAA Group)",
                "price": 35,
                "price_display": "₹35/kg",
                "season": "Year-round",
                "duration_days": 300,
                "yield_per_acre": 3000,
                "characteristics": "Commercial Cavendish clone with large heavy bunches and uniform green-to-yellow ripening"
            },
            {
                "name": "Yelakki (Elaichi)",
                "scientific_species": "Musa acuminata (AB Group)",
                "price": 60,
                "price_display": "₹60/kg",
                "season": "Year-round",
                "duration_days": 330,
                "yield_per_acre": 1800,
                "characteristics": "Small aromatic dessert banana highly relished in South India, commands premium retail price"
            },
            {
                "name": "Nendran",
                "scientific_species": "Musa balbisiana x acuminata (AAB Group)",
                "price": 45,
                "price_display": "₹45/kg",
                "season": "Year-round",
                "duration_days": 360,
                "yield_per_acre": 2200,
                "characteristics": "Famous plantain variety for banana chips and culinary processing in Kerala and coastal Karnataka"
            },
            {
                "name": "Red Banana (Chandra Bale)",
                "scientific_species": "Musa acuminata (AAA Group)",
                "price": 55,
                "price_display": "₹55/kg",
                "season": "Year-round",
                "duration_days": 330,
                "yield_per_acre": 1500,
                "characteristics": "Nutrient-rich red peel banana with sweet berry flavour and high beta-carotene content"
            },
            {
                "name": "Grand Naine (G9)",
                "scientific_species": "Musa acuminata (AAA Group)",
                "price": 30,
                "price_display": "₹30/kg",
                "season": "Year-round",
                "duration_days": 300,
                "yield_per_acre": 3500,
                "characteristics": "Tissue culture export quality variety with wind resistance and uniform cylindrical bunches"
            },
            {
                "name": "Poovan (Mysore)",
                "scientific_species": "Musa balbisiana x acuminata (AAB Group)",
                "price": 40,
                "price_display": "₹40/kg",
                "season": "Year-round",
                "duration_days": 340,
                "yield_per_acre": 2000,
                "characteristics": "Hardy perennial variety with slight sub-acid flavor, resistant to Panama wilt"
            },
            {
                "name": "Rasthali (Silk)",
                "scientific_species": "Musa acuminata x balbisiana (AAB Group)",
                "price": 50,
                "price_display": "₹50/kg",
                "season": "Year-round",
                "duration_days": 350,
                "yield_per_acre": 1600,
                "characteristics": "Traditional premium dessert table banana with thin peel and pleasant aroma"
            }
        ]
    },
    "Arecanut": {
        "unit": "quintal",
        "botanical_genus": "Areca catechu",
        "varieties": [
            {
                "name": "Mangala",
                "scientific_species": "Areca catechu var. Mangala",
                "price": 48000,
                "price_display": "₹48,000/quintal",
                "season": "Perennial",
                "duration_days": 1825,
                "yield_per_acre": 10,
                "characteristics": "Early-bearing semi-tall variety developed by CPCRI with high fruit set and tender nut yield"
            },
            {
                "name": "Sumangala",
                "scientific_species": "Areca catechu var. Sumangala",
                "price": 46000,
                "price_display": "₹46,000/quintal",
                "season": "Perennial",
                "duration_days": 1825,
                "yield_per_acre": 11,
                "characteristics": "High yielding variety with bold nuts, consistent annual yield and tolerance to heavy rainfall"
            },
            {
                "name": "Sreemangala",
                "scientific_species": "Areca catechu var. Sreemangala",
                "price": 47000,
                "price_display": "₹47,000/quintal",
                "season": "Perennial",
                "duration_days": 1825,
                "yield_per_acre": 9,
                "characteristics": "Tall vigorous selection producing large round nuts suited for Chali processing"
            },
            {
                "name": "South Kanara Local",
                "scientific_species": "Areca catechu Local Selection",
                "price": 44000,
                "price_display": "₹44,000/quintal",
                "season": "Perennial",
                "duration_days": 1825,
                "yield_per_acre": 12,
                "characteristics": "Indigenous coastal ecotype well acclimatized to laterite soils and heavy southwest monsoons"
            },
            {
                "name": "Mohitnagar",
                "scientific_species": "Areca catechu var. Mohitnagar",
                "price": 43000,
                "price_display": "₹43,000/quintal",
                "season": "Perennial",
                "duration_days": 1825,
                "yield_per_acre": 10,
                "characteristics": "Vigorous palm with compact bunch formation and uniform nut development"
            },
            {
                "name": "Thirthahalli Local",
                "scientific_species": "Areca catechu Malnad Ecotype",
                "price": 49000,
                "price_display": "₹49,000/quintal",
                "season": "Perennial",
                "duration_days": 1825,
                "yield_per_acre": 11,
                "characteristics": "Malnad region specialty producing premium red boiled nut (Rashi/Gorabaluku) prized by APMC"
            }
        ]
    },
    "Pepper": {
        "unit": "kg",
        "botanical_genus": "Piper nigrum",
        "varieties": [
            {
                "name": "Panniyur-1",
                "scientific_species": "Piper nigrum (Hybrid Uthirankotta x Cheriyakaniakkadan)",
                "price": 650,
                "price_display": "₹650/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 160,
                "characteristics": "World renowned first pepper hybrid with long spikes, bold berries and high piperine content"
            },
            {
                "name": "Karimunda",
                "scientific_species": "Piper nigrum cv. Karimunda",
                "price": 580,
                "price_display": "₹580/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 140,
                "characteristics": "Most adaptable traditional cultivar, regular bearer with high dry recovery percentage"
            },
            {
                "name": "Panniyur-5",
                "scientific_species": "Piper nigrum cv. Panniyur-5",
                "price": 640,
                "price_display": "₹640/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 170,
                "characteristics": "High shade-tolerant variety ideal for intercropping with arecanut and coffee estates"
            },
            {
                "name": "Sreekara",
                "scientific_species": "Piper nigrum cv. Sreekara",
                "price": 620,
                "price_display": "₹620/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 155,
                "characteristics": "Selection from Karimunda by IISR, suited for diverse altitudes and soils"
            },
            {
                "name": "Subhakara",
                "scientific_species": "Piper nigrum cv. Subhakara",
                "price": 610,
                "price_display": "₹610/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 150,
                "characteristics": "Consistent yielding cultivar with high oleoresin and volatile essential oil content"
            },
            {
                "name": "Panchami",
                "scientific_species": "Piper nigrum cv. Panchami",
                "price": 630,
                "price_display": "₹630/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 165,
                "characteristics": "Late maturing variety with very long spikes and high tolerance to root rot (Phytophthora)"
            }
        ]
    },
    "Cashew": {
        "unit": "kg",
        "botanical_genus": "Anacardium occidentale",
        "varieties": [
            {
                "name": "Vengurla-4",
                "scientific_species": "Anacardium occidentale cv. V-4",
                "price": 135,
                "price_display": "₹135/kg",
                "season": "Feb-May",
                "duration_days": 1460,
                "yield_per_acre": 220,
                "characteristics": "High shelling percentage (31%), export grade W-210 jumbo kernels"
            },
            {
                "name": "Vengurla-7",
                "scientific_species": "Anacardium occidentale cv. V-7",
                "price": 130,
                "price_display": "₹130/kg",
                "season": "Feb-May",
                "duration_days": 1460,
                "yield_per_acre": 240,
                "characteristics": "Profuse cluster bearing habit with high nut count per panicle and large apple"
            },
            {
                "name": "BPP-8 (Ullal-3)",
                "scientific_species": "Anacardium occidentale cv. Ullal-3",
                "price": 125,
                "price_display": "₹125/kg",
                "season": "Feb-May",
                "duration_days": 1460,
                "yield_per_acre": 200,
                "characteristics": "Popular coastal Karnataka variety bred by Ullal Research Station, excellent kernel weight"
            },
            {
                "name": "Bhaskara",
                "scientific_species": "Anacardium occidentale cv. Bhaskara",
                "price": 120,
                "price_display": "₹120/kg",
                "season": "Feb-May",
                "duration_days": 1460,
                "yield_per_acre": 210,
                "characteristics": "Mid-season variety bred by DCR Puttur with high kernel recovery and pest tolerance"
            },
            {
                "name": "Dhana",
                "scientific_species": "Anacardium occidentale cv. Dhana",
                "price": 115,
                "price_display": "₹115/kg",
                "season": "Feb-May",
                "duration_days": 1460,
                "yield_per_acre": 190,
                "characteristics": "Hybrid variety suited for high density planting and hill slope conservation"
            },
            {
                "name": "Priyanka",
                "scientific_species": "Anacardium occidentale cv. Priyanka",
                "price": 140,
                "price_display": "₹140/kg",
                "season": "Feb-May",
                "duration_days": 1460,
                "yield_per_acre": 230,
                "characteristics": "Extra bold nuts with high export kernel weight and early bearing timeline"
            }
        ]
    },
    "Rubber": {
        "unit": "kg",
        "botanical_genus": "Hevea brasiliensis",
        "varieties": [
            {
                "name": "RRII 105",
                "scientific_species": "Hevea brasiliensis clone RRII 105",
                "price": 190,
                "price_display": "₹190/kg",
                "season": "Perennial",
                "duration_days": 2190,
                "yield_per_acre": 550,
                "characteristics": "Dominant commercial clone in South India with high dry rubber content and vigorous girth"
            },
            {
                "name": "RRII 414",
                "scientific_species": "Hevea brasiliensis clone RRII 414",
                "price": 185,
                "price_display": "₹185/kg",
                "season": "Perennial",
                "duration_days": 2190,
                "yield_per_acre": 520,
                "characteristics": "High initial yield, thick virgin bark and rapid bark renewal characteristics"
            },
            {
                "name": "GT-1",
                "scientific_species": "Hevea brasiliensis clone GT-1",
                "price": 175,
                "price_display": "₹175/kg",
                "season": "Perennial",
                "duration_days": 2190,
                "yield_per_acre": 480,
                "characteristics": "Primary clone known for exceptional wind firmness and low incidence of tapping panel dryness"
            },
            {
                "name": "PB 260",
                "scientific_species": "Hevea brasiliensis clone PB 260",
                "price": 180,
                "price_display": "₹180/kg",
                "season": "Perennial",
                "duration_days": 2190,
                "yield_per_acre": 500,
                "characteristics": "Vigorous grower with straight trunk, high latex volume during early tapping years"
            },
            {
                "name": "RRIM 600",
                "scientific_species": "Hevea brasiliensis clone RRIM 600",
                "price": 182,
                "price_display": "₹182/kg",
                "season": "Perennial",
                "duration_days": 2190,
                "yield_per_acre": 510,
                "characteristics": "Proven Malaysian clone adapted to varied slopes, resistant to Oidium leaf mildew"
            }
        ]
    },
    "Coconut": {
        "unit": "piece",
        "botanical_genus": "Cocos nucifera",
        "varieties": [
            {
                "name": "West Coast Tall",
                "scientific_species": "Cocos nucifera var. typica",
                "price": 38,
                "price_display": "₹38/piece",
                "season": "Perennial",
                "duration_days": 1825,
                "yield_per_acre": 6500,
                "characteristics": "Premier tall variety of Karnataka coast, high copra content (68% oil) and durable timber"
            },
            {
                "name": "Chowghat Orange Dwarf",
                "scientific_species": "Cocos nucifera var. javanica (COD)",
                "price": 42,
                "price_display": "₹42/piece",
                "season": "Perennial",
                "duration_days": 1460,
                "yield_per_acre": 5000,
                "characteristics": "Early flowering tender nut variety with sweet nutritious water and orange-colored fruit"
            },
            {
                "name": "Tiptur Tall",
                "scientific_species": "Cocos nucifera cv. Tiptur Tall",
                "price": 36,
                "price_display": "₹36/piece",
                "season": "Perennial",
                "duration_days": 1825,
                "yield_per_acre": 7000,
                "characteristics": "Famous ball copra variety from Tumakuru district, highest commercial ball copra recovery"
            },
            {
                "name": "Lakshadweep Micro Tall",
                "scientific_species": "Cocos nucifera cv. Laccadive Ordinary",
                "price": 40,
                "price_display": "₹40/piece",
                "season": "Perennial",
                "duration_days": 1825,
                "yield_per_acre": 5500,
                "characteristics": "Medium-sized sweet water nuts with outstanding copra quality and pest resilience"
            },
            {
                "name": "Gangabondam (Hybrid)",
                "scientific_species": "Cocos nucifera cv. Gangabondam",
                "price": 45,
                "price_display": "₹45/piece",
                "season": "Perennial",
                "duration_days": 1460,
                "yield_per_acre": 6000,
                "characteristics": "Semi-tall high yielding green tender coconut variety widely planted for fresh water sale"
            },
            {
                "name": "Kera Sankara (D x T)",
                "scientific_species": "Cocos nucifera Hybrid (WCT x COD)",
                "price": 44,
                "price_display": "₹44/piece",
                "season": "Perennial",
                "duration_days": 1460,
                "yield_per_acre": 7500,
                "characteristics": "High-yielding dwarf x tall hybrid yielding up to 108 nuts per palm annually"
            }
        ]
    },
    "Coffee": {
        "unit": "kg",
        "botanical_genus": "Coffea",
        "varieties": [
            {
                "name": "Arabica (S.795)",
                "scientific_species": "Coffea arabica cv. S.795",
                "price": 320,
                "price_display": "₹320/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 8,
                "characteristics": "Most celebrated Indian Arabica cultivar with balanced body, mild acidity and mocha notes"
            },
            {
                "name": "Arabica (Cauvery / Catimor)",
                "scientific_species": "Coffea arabica cv. Cauvery",
                "price": 300,
                "price_display": "₹300/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 10,
                "characteristics": "Semi-dwarf compact variety resistant to leaf rust, suitable for close spacing"
            },
            {
                "name": "Robusta (CxR)",
                "scientific_species": "Coffea canephora x congensis",
                "price": 220,
                "price_display": "₹220/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 15,
                "characteristics": "Congensis x Robusta hybrid combining compact bush stature with superior cup aroma"
            },
            {
                "name": "Robusta (S.274)",
                "scientific_species": "Coffea canephora cv. S.274",
                "price": 210,
                "price_display": "₹210/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 14,
                "characteristics": "Heavy bearing robusta selection thriving under multi-tier shade across Kodagu and Chikmagalur"
            },
            {
                "name": "Arabica (Selection-9)",
                "scientific_species": "Coffea arabica cv. SLN 9",
                "price": 350,
                "price_display": "₹350/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 7,
                "characteristics": "Tafarikela cross noted for drought tolerance and winning 'Flavour of India - Fine Cup' awards"
            },
            {
                "name": "Kent Arabica",
                "scientific_species": "Coffea arabica cv. Kent",
                "price": 340,
                "price_display": "₹340/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 8,
                "characteristics": "Historic heritage Indian Arabica selection with exquisite floral cup profile and bright acidity"
            }
        ]
    },
    "Cardamom": {
        "unit": "kg",
        "botanical_genus": "Elettaria cardamomum",
        "varieties": [
            {
                "name": "Mysore (Green Gold)",
                "scientific_species": "Elettaria cardamomum var. major",
                "price": 1600,
                "price_display": "₹1,600/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 1.5,
                "characteristics": "Erect panicles producing bold 8mm ribbed green capsules commanding premier auction rates"
            },
            {
                "name": "Malabar",
                "scientific_species": "Elettaria cardamomum var. minor",
                "price": 1450,
                "price_display": "₹1,450/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 1.8,
                "characteristics": "Prostrate panicles with round capsules, tolerant to thrips and lower altitude humidity"
            },
            {
                "name": "Vazhukka",
                "scientific_species": "Elettaria cardamomum (Natural Cross)",
                "price": 1550,
                "price_display": "₹1,550/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 1.6,
                "characteristics": "Semi-erect panicles producing deep green oblong capsules with high essential oil content"
            },
            {
                "name": "ICRI-3 (Avinash)",
                "scientific_species": "Elettaria cardamomum cv. ICRI-3",
                "price": 1700,
                "price_display": "₹1,700/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 2.0,
                "characteristics": "Bred by Indian Cardamom Research Institute, highly tolerant to 'Katte' mosaic viral disease"
            },
            {
                "name": "Mudigere-1",
                "scientific_species": "Elettaria cardamomum cv. Mudigere-1",
                "price": 1500,
                "price_display": "₹1,500/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 1.7,
                "characteristics": "High yielding Malabar selection bred for Karnataka Western Ghats coffee understory"
            },
            {
                "name": "Njallani",
                "scientific_species": "Elettaria cardamomum cv. Njallani Green Gold",
                "price": 1800,
                "price_display": "₹1,800/kg",
                "season": "Perennial",
                "duration_days": 1095,
                "yield_per_acre": 2.2,
                "characteristics": "Farmer-developed high-yielding superstar variety producing three times average capsule count"
            }
        ]
    },
    "Ginger": {
        "unit": "kg",
        "botanical_genus": "Zingiber officinale",
        "varieties": [
            {
                "name": "Maran",
                "scientific_species": "Zingiber officinale cv. Maran",
                "price": 130,
                "price_display": "₹130/kg",
                "season": "Kharif",
                "duration_days": 240,
                "yield_per_acre": 90,
                "characteristics": "Plump aromatic rhizomes with low fiber and high volatile oil, preferred for fresh export"
            },
            {
                "name": "Varada",
                "scientific_species": "Zingiber officinale cv. Varada",
                "price": 125,
                "price_display": "₹125/kg",
                "season": "Kharif",
                "duration_days": 220,
                "yield_per_acre": 85,
                "characteristics": "High yielding variety released by IISR with bold fingers and excellent fresh ginger pungency"
            },
            {
                "name": "Himachal",
                "scientific_species": "Zingiber officinale cv. Himachal",
                "price": 120,
                "price_display": "₹120/kg",
                "season": "Kharif",
                "duration_days": 230,
                "yield_per_acre": 80,
                "characteristics": "Cold tolerant variety with high dry ginger (Sonth) conversion percentage"
            },
            {
                "name": "IISR Rejatha",
                "scientific_species": "Zingiber officinale cv. Rejatha",
                "price": 135,
                "price_display": "₹135/kg",
                "season": "Kharif",
                "duration_days": 240,
                "yield_per_acre": 95,
                "characteristics": "Exceptional dry recovery (24.7%) and high oleoresin content for commercial extraction"
            },
            {
                "name": "Suprabha",
                "scientific_species": "Zingiber officinale cv. Suprabha",
                "price": 115,
                "price_display": "₹115/kg",
                "season": "Kharif",
                "duration_days": 210,
                "yield_per_acre": 75,
                "characteristics": "Short duration variety with high tolerance to bacterial wilt and rhizome rot"
            },
            {
                "name": "Mahim",
                "scientific_species": "Zingiber officinale cv. Mahim",
                "price": 128,
                "price_display": "₹128/kg",
                "season": "Kharif",
                "duration_days": 235,
                "yield_per_acre": 88,
                "characteristics": "Large thick fibrous rhizomes with spicy flavor and long storage shelf life"
            }
        ]
    },
    "Jowar": {
        "unit": "quintal",
        "botanical_genus": "Sorghum bicolor",
        "varieties": [
            {
                "name": "M 35-1 (Maldandi)",
                "scientific_species": "Sorghum bicolor cv. Maldandi",
                "price": 3100,
                "price_display": "₹3,100/quintal",
                "season": "Rabi",
                "duration_days": 120,
                "yield_per_acre": 10,
                "characteristics": "Iconic pearly white grain Rabi sorghum, supreme roti making quality and sweet fodder"
            },
            {
                "name": "CSH-16",
                "scientific_species": "Sorghum bicolor Hybrid CSH-16",
                "price": 2900,
                "price_display": "₹2,900/quintal",
                "season": "Kharif",
                "duration_days": 105,
                "yield_per_acre": 12,
                "characteristics": "High-yielding Kharif hybrid resistant to grain mold and shoot fly"
            },
            {
                "name": "SPV-462",
                "scientific_species": "Sorghum bicolor cv. SPV-462",
                "price": 2800,
                "price_display": "₹2,800/quintal",
                "season": "Kharif",
                "duration_days": 110,
                "yield_per_acre": 11,
                "characteristics": "Dual-purpose grain and stover variety with high protein and digestible dry matter"
            },
            {
                "name": "DSV-4 (Bijapur Local)",
                "scientific_species": "Sorghum bicolor cv. DSV-4",
                "price": 3200,
                "price_display": "₹3,200/quintal",
                "season": "Rabi",
                "duration_days": 115,
                "yield_per_acre": 9,
                "characteristics": "Drought tolerant Northern Karnataka selection yielding soft palatable rotis"
            },
            {
                "name": "CSV-15",
                "scientific_species": "Sorghum bicolor cv. CSV-15",
                "price": 2750,
                "price_display": "₹2,750/quintal",
                "season": "Kharif",
                "duration_days": 100,
                "yield_per_acre": 13,
                "characteristics": "Sweet stalk sorghum variety used for both grain harvest and silage production"
            }
        ]
    },
    "Cotton": {
        "unit": "quintal",
        "botanical_genus": "Gossypium hirsutum",
        "varieties": [
            {
                "name": "Bt Cotton (Bollgard II)",
                "scientific_species": "Gossypium hirsutum (Cry1Ac + Cry2Ab)",
                "price": 6500,
                "price_display": "₹6,500/quintal",
                "season": "Kharif",
                "duration_days": 180,
                "yield_per_acre": 8,
                "characteristics": "Transgenic hybrid with dual-gene bollworm protection and high ginning outturn (36%)"
            },
            {
                "name": "DCH-32 (Hybrid)",
                "scientific_species": "Gossypium hirsutum x barbadense",
                "price": 6200,
                "price_display": "₹6,200/quintal",
                "season": "Kharif",
                "duration_days": 170,
                "yield_per_acre": 7,
                "characteristics": "Extra long staple premium cotton fetching high prices in textile spinning mills"
            },
            {
                "name": "Suraj (Bt Hybrid)",
                "scientific_species": "Gossypium hirsutum cv. Suraj",
                "price": 6400,
                "price_display": "₹6,400/quintal",
                "season": "Kharif",
                "duration_days": 175,
                "yield_per_acre": 9,
                "characteristics": "Central Institute for Cotton Research release with compact canopy and synchronous bursting"
            },
            {
                "name": "Jayadhar",
                "scientific_species": "Gossypium herbaceum cv. Jayadhar",
                "price": 5800,
                "price_display": "₹5,800/quintal",
                "season": "Kharif",
                "duration_days": 160,
                "yield_per_acre": 6,
                "characteristics": "Hardy indigenous Desi cotton thriving under rainfed black soils of Dharwad & Belagavi"
            },
            {
                "name": "NHH-44",
                "scientific_species": "Gossypium hirsutum Hybrid NHH-44",
                "price": 6100,
                "price_display": "₹6,100/quintal",
                "season": "Kharif",
                "duration_days": 165,
                "yield_per_acre": 7,
                "characteristics": "Popular rainfed hybrid variety with medium staple length and good drought resilience"
            }
        ]
    },
    "Maize": {
        "unit": "quintal",
        "botanical_genus": "Zea mays",
        "varieties": [
            {
                "name": "NAH-2049 (Hybrid)",
                "scientific_species": "Zea mays indurata Hybrid",
                "price": 2200,
                "price_display": "₹2,200/quintal",
                "season": "Kharif/Rabi",
                "duration_days": 100,
                "yield_per_acre": 24,
                "characteristics": "High yield yellow dent maize released by UAS Dharwad, uniform cobs and stay-green trait"
            },
            {
                "name": "Deccan 103",
                "scientific_species": "Zea mays indentata Hybrid",
                "price": 2050,
                "price_display": "₹2,050/quintal",
                "season": "Kharif",
                "duration_days": 95,
                "yield_per_acre": 22,
                "characteristics": "Wide ecological adaptation, excellent poultry feed quality with high starch recovery"
            },
            {
                "name": "NK 6240",
                "scientific_species": "Zea mays Hybrid NK 6240",
                "price": 2150,
                "price_display": "₹2,150/quintal",
                "season": "Kharif/Rabi",
                "duration_days": 105,
                "yield_per_acre": 25,
                "characteristics": "Heavy grain density with tight husk cover protecting against ear rot and bird damage"
            },
            {
                "name": "DHM-117",
                "scientific_species": "Zea mays Hybrid DHM-117",
                "price": 2000,
                "price_display": "₹2,000/quintal",
                "season": "Kharif",
                "duration_days": 90,
                "yield_per_acre": 20,
                "characteristics": "Early maturing hybrid suited for multi-crop rotations with pulse crops"
            },
            {
                "name": "Baby Corn (G-5414)",
                "scientific_species": "Zea mays saccharata",
                "price": 3500,
                "price_display": "₹3,500/quintal",
                "season": "Year-round",
                "duration_days": 55,
                "yield_per_acre": 8,
                "characteristics": "Short-duration specialty crop yielding tender yellow ears for hotel and fresh vegetable retail"
            }
        ]
    },
    "Bengal Gram": {
        "unit": "quintal",
        "botanical_genus": "Cicer arietinum",
        "varieties": [
            {
                "name": "JG-11",
                "scientific_species": "Cicer arietinum (Desi type)",
                "price": 5600,
                "price_display": "₹5,600/quintal",
                "season": "Rabi",
                "duration_days": 100,
                "yield_per_acre": 7,
                "characteristics": "Most popular Desi chickpea variety in Karnataka, resistant to Fusarium wilt and lodging"
            },
            {
                "name": "Annigeri-1",
                "scientific_species": "Cicer arietinum cv. A-1",
                "price": 5300,
                "price_display": "₹5,300/quintal",
                "season": "Rabi",
                "duration_days": 95,
                "yield_per_acre": 6,
                "characteristics": "Famous traditional Karnataka variety, bold yellow-brown seeds with superior besan quality"
            },
            {
                "name": "JAKI 9218",
                "scientific_species": "Cicer arietinum cv. JAKI 9218",
                "price": 5500,
                "price_display": "₹5,500/quintal",
                "season": "Rabi",
                "duration_days": 105,
                "yield_per_acre": 8,
                "characteristics": "Early maturing bold seeded desi variety with excellent drought escape mechanism"
            },
            {
                "name": "KAK-2",
                "scientific_species": "Cicer arietinum (Kabuli type)",
                "price": 5100,
                "price_display": "₹5,100/quintal",
                "season": "Rabi",
                "duration_days": 90,
                "yield_per_acre": 6,
                "characteristics": "Medium-bold kabuli chickpea with light creamy seeds and early maturity"
            },
            {
                "name": "Kabuli (L-550)",
                "scientific_species": "Cicer arietinum cv. L-550",
                "price": 7200,
                "price_display": "₹7,200/quintal",
                "season": "Rabi",
                "duration_days": 110,
                "yield_per_acre": 5,
                "characteristics": "Extra bold 100-seed weight Kabuli chana commanding high export demand and retail margins"
            }
        ]
    },
    "Red Gram": {
        "unit": "quintal",
        "botanical_genus": "Cajanus cajan",
        "varieties": [
            {
                "name": "BRG-1 (Maruti)",
                "scientific_species": "Cajanus cajan cv. BRG-1",
                "price": 7800,
                "price_display": "₹7,800/quintal",
                "season": "Kharif",
                "duration_days": 160,
                "yield_per_acre": 5,
                "characteristics": "High protein tur dal variety, resistant to sterility mosaic and Fusarium wilt diseases"
            },
            {
                "name": "TS-3R",
                "scientific_species": "Cajanus cajan cv. TS-3R",
                "price": 7500,
                "price_display": "₹7,500/quintal",
                "season": "Kharif",
                "duration_days": 150,
                "yield_per_acre": 6,
                "characteristics": "Bred in Kalaburagi pulse bowl, medium maturity with high dhal recovery percentage"
            },
            {
                "name": "GRG-811",
                "scientific_species": "Cajanus cajan cv. GRG-811",
                "price": 7600,
                "price_display": "₹7,600/quintal",
                "season": "Kharif",
                "duration_days": 155,
                "yield_per_acre": 5,
                "characteristics": "Vigorous branching red gram variety developed by UAS Raichur with bold reddish brown grains"
            },
            {
                "name": "BRG-2",
                "scientific_species": "Cajanus cajan cv. BRG-2",
                "price": 7400,
                "price_display": "₹7,400/quintal",
                "season": "Kharif",
                "duration_days": 145,
                "yield_per_acre": 6,
                "characteristics": "Shorter duration variety suitable for intercropping with groundnut, ragi and cotton"
            },
            {
                "name": "ICPL 87119 (Asha)",
                "scientific_species": "Cajanus cajan cv. Asha",
                "price": 7900,
                "price_display": "₹7,900/quintal",
                "season": "Kharif",
                "duration_days": 165,
                "yield_per_acre": 5,
                "characteristics": "Bred by ICRISAT, dual disease resistant with high pod clustering and uniform seed size"
            }
        ]
    },
    "Wheat": {
        "unit": "quintal",
        "botanical_genus": "Triticum aestivum",
        "varieties": [
            {
                "name": "HD-2967",
                "scientific_species": "Triticum aestivum cv. HD-2967",
                "price": 2400,
                "price_display": "₹2,400/quintal",
                "season": "Rabi",
                "duration_days": 135,
                "yield_per_acre": 14,
                "characteristics": "India's highest acreage bread wheat with high chapati making score and rust tolerance"
            },
            {
                "name": "PBW-343",
                "scientific_species": "Triticum aestivum cv. PBW-343",
                "price": 2300,
                "price_display": "₹2,300/quintal",
                "season": "Rabi",
                "duration_days": 130,
                "yield_per_acre": 13,
                "characteristics": "Classic semi-dwarf bread wheat with high grain weight and strong straw resistance"
            },
            {
                "name": "Lok-1 (Sharbati)",
                "scientific_species": "Triticum aestivum cv. Lok-1",
                "price": 2800,
                "price_display": "₹2,800/quintal",
                "season": "Rabi",
                "duration_days": 120,
                "yield_per_acre": 11,
                "characteristics": "Golden amber lustrous grain Sharbati wheat, sweet rotis, sells at major market premium"
            },
            {
                "name": "GW-366",
                "scientific_species": "Triticum aestivum cv. GW-366",
                "price": 2350,
                "price_display": "₹2,350/quintal",
                "season": "Rabi",
                "duration_days": 125,
                "yield_per_acre": 12,
                "characteristics": "Early maturing, heat tolerant variety well suited for peninsular India winter temperatures"
            },
            {
                "name": "DBW-187 (Karan Vandana)",
                "scientific_species": "Triticum aestivum cv. DBW-187",
                "price": 2500,
                "price_display": "₹2,500/quintal",
                "season": "Rabi",
                "duration_days": 140,
                "yield_per_acre": 15,
                "characteristics": "Bio-fortified wheat with elevated iron (43.1 ppm) and protein, high yield potential"
            }
        ]
    },
    "Pomegranate": {
        "unit": "kg",
        "botanical_genus": "Punica granatum",
        "varieties": [
            {
                "name": "Bhagwa",
                "scientific_species": "Punica granatum cv. Bhagwa (Kesar)",
                "price": 160,
                "price_display": "₹160/kg",
                "season": "Year-round",
                "duration_days": 1095,
                "yield_per_acre": 70,
                "characteristics": "King of pomegranates with saffron-colored thick rind, dark red sweet arils and soft seeds"
            },
            {
                "name": "Ganesh",
                "scientific_species": "Punica granatum cv. Ganesh",
                "price": 130,
                "price_display": "₹130/kg",
                "season": "Year-round",
                "duration_days": 1095,
                "yield_per_acre": 65,
                "characteristics": "First commercial soft-seeded selection with pinkish arils and sweet aromatic juice"
            },
            {
                "name": "Arakta",
                "scientific_species": "Punica granatum cv. Arakta",
                "price": 145,
                "price_display": "₹145/kg",
                "season": "Year-round",
                "duration_days": 1095,
                "yield_per_acre": 60,
                "characteristics": "Heavy bearer with attractive deep red fruit surface and blood-red juicy seeds"
            },
            {
                "name": "Mridula",
                "scientific_species": "Punica granatum cv. Mridula",
                "price": 135,
                "price_display": "₹135/kg",
                "season": "Year-round",
                "duration_days": 1095,
                "yield_per_acre": 55,
                "characteristics": "Enriched aril sweetness, bright crimson rind and soft edible seeds"
            },
            {
                "name": "Sinduri",
                "scientific_species": "Punica granatum cv. Sinduri",
                "price": 120,
                "price_display": "₹120/kg",
                "season": "Year-round",
                "duration_days": 1095,
                "yield_per_acre": 50,
                "characteristics": "Hardy semi-arid cultivar tolerant to sunburn and fruit cracking in dry weather"
            }
        ]
    },
    "Ragi": {
        "unit": "quintal",
        "botanical_genus": "Eleusine coracana",
        "varieties": [
            {
                "name": "GPU-28",
                "scientific_species": "Eleusine coracana cv. GPU-28",
                "price": 3600,
                "price_display": "₹3,600/quintal",
                "season": "Kharif",
                "duration_days": 110,
                "yield_per_acre": 12,
                "characteristics": "Premier finger millet variety of Karnataka with compact fist-shaped earheads and blast resistance"
            },
            {
                "name": "MR-1",
                "scientific_species": "Eleusine coracana cv. MR-1",
                "price": 3400,
                "price_display": "₹3,400/quintal",
                "season": "Kharif",
                "duration_days": 105,
                "yield_per_acre": 10,
                "characteristics": "Early maturing, high tillering variety yielding nutritious brown grains rich in calcium"
            },
            {
                "name": "GPU-67",
                "scientific_species": "Eleusine coracana cv. GPU-67",
                "price": 3500,
                "price_display": "₹3,500/quintal",
                "season": "Kharif",
                "duration_days": 115,
                "yield_per_acre": 11,
                "characteristics": "High grain and quality straw yielder with outstanding resilience to drought spells"
            },
            {
                "name": "ML-365",
                "scientific_species": "Eleusine coracana cv. ML-365",
                "price": 3300,
                "price_display": "₹3,300/quintal",
                "season": "Kharif",
                "duration_days": 100,
                "yield_per_acre": 9,
                "characteristics": "Short duration drought escape variety ideal for late sowing and dry farming zones"
            },
            {
                "name": "KMR-204",
                "scientific_species": "Eleusine coracana cv. KMR-204",
                "price": 3550,
                "price_display": "₹3,550/quintal",
                "season": "Kharif",
                "duration_days": 108,
                "yield_per_acre": 11,
                "characteristics": "Uniform flowering and maturity, high malt recovery and culinary suitability for ragi mudde"
            },
            {
                "name": "Indaf-5",
                "scientific_species": "Eleusine coracana cv. Indaf-5",
                "price": 3450,
                "price_display": "₹3,450/quintal",
                "season": "Kharif",
                "duration_days": 112,
                "yield_per_acre": 10,
                "characteristics": "Open earhead Indo-African hybrid derivative with high grain weight"
            }
        ]
    },
    "Groundnut": {
        "unit": "quintal",
        "botanical_genus": "Arachis hypogaea",
        "varieties": [
            {
                "name": "TMV-2",
                "scientific_species": "Arachis hypogaea subsp. fastigiata",
                "price": 6700,
                "price_display": "₹6,700/quintal",
                "season": "Kharif",
                "duration_days": 105,
                "yield_per_acre": 8,
                "characteristics": "Standard Spanish bunch groundnut with 49% oil content and high shelling turnout"
            },
            {
                "name": "JL-24 (Phule Pragati)",
                "scientific_species": "Arachis hypogaea cv. JL-24",
                "price": 6500,
                "price_display": "₹6,500/quintal",
                "season": "Kharif/Rabi",
                "duration_days": 100,
                "yield_per_acre": 9,
                "characteristics": "Early maturing bunch type with two-seeded bold pink pods, widely popular across Karnataka"
            },
            {
                "name": "GPBD-4",
                "scientific_species": "Arachis hypogaea cv. GPBD-4",
                "price": 6800,
                "price_display": "₹6,800/quintal",
                "season": "Kharif",
                "duration_days": 110,
                "yield_per_acre": 10,
                "characteristics": "Bred by UAS Dharwad, highly resistant to late leaf spot and rust, high oleic acid content"
            },
            {
                "name": "K-6 (Kadiri-6)",
                "scientific_species": "Arachis hypogaea cv. Kadiri-6",
                "price": 6400,
                "price_display": "₹6,400/quintal",
                "season": "Kharif",
                "duration_days": 95,
                "yield_per_acre": 7,
                "characteristics": "Drought-hardy selection tailored for light red sandy soils of Chitradurga and Kolar"
            },
            {
                "name": "TAG-24",
                "scientific_species": "Arachis hypogaea cv. TAG-24",
                "price": 6600,
                "price_display": "₹6,600/quintal",
                "season": "Kharif/Rabi",
                "duration_days": 100,
                "yield_per_acre": 8,
                "characteristics": "Semi-dwarf compact canopy variety released by BARC with high harvest index"
            }
        ]
    },
    "Sugarcane": {
        "unit": "quintal",
        "botanical_genus": "Saccharum officinarum",
        "varieties": [
            {
                "name": "Co-86032",
                "scientific_species": "Saccharum officinarum cv. Co-86032",
                "price": 325,
                "price_display": "₹325/quintal",
                "season": "Year-round",
                "duration_days": 360,
                "yield_per_acre": 400,
                "characteristics": "Superstar sugarcane variety of peninsular India with 14.5% sucrose and excellent ratoon ability"
            },
            {
                "name": "CoC-671",
                "scientific_species": "Saccharum officinarum cv. CoC-671",
                "price": 310,
                "price_display": "₹310/quintal",
                "season": "Year-round",
                "duration_days": 330,
                "yield_per_acre": 350,
                "characteristics": "Early high sugar cane producing golden jaggery with superior crystal recovery"
            },
            {
                "name": "Co-0238",
                "scientific_species": "Saccharum officinarum cv. Co-0238",
                "price": 330,
                "price_display": "₹330/quintal",
                "season": "Year-round",
                "duration_days": 345,
                "yield_per_acre": 380,
                "characteristics": "Thick heavy canes with high sugar recovery, profuse tillering and low fiber"
            },
            {
                "name": "Co-62175",
                "scientific_species": "Saccharum officinarum cv. Co-62175",
                "price": 300,
                "price_display": "₹300/quintal",
                "season": "Year-round",
                "duration_days": 340,
                "yield_per_acre": 320,
                "characteristics": "Hardy variety tolerant to drought and salinity, reliable performance under irregular irrigation"
            },
            {
                "name": "SNK-44 (Early)",
                "scientific_species": "Saccharum officinarum cv. SNK-44",
                "price": 315,
                "price_display": "₹315/quintal",
                "season": "Year-round",
                "duration_days": 300,
                "yield_per_acre": 360,
                "characteristics": "Bred for Northern Karnataka sugar belt (Belagavi, Bagalkot) with early harvest window"
            }
        ]
    },
    "Tomato": {
        "unit": "kg",
        "botanical_genus": "Solanum lycopersicum",
        "varieties": [
            {
                "name": "Arka Rakshak (Hybrid)",
                "scientific_species": "Solanum lycopersicum F1 Hybrid",
                "price": 35,
                "price_display": "₹35/kg",
                "season": "Rabi/Summer",
                "duration_days": 75,
                "yield_per_acre": 140,
                "characteristics": "Triple disease resistant hybrid (ToLCV + BW + Early Blight), deep red firm fruits with long shelf life"
            },
            {
                "name": "Pusa Ruby",
                "scientific_species": "Solanum lycopersicum cv. Pusa Ruby",
                "price": 28,
                "price_display": "₹28/kg",
                "season": "Year-round",
                "duration_days": 70,
                "yield_per_acre": 120,
                "characteristics": "Early flattish round tomato with pleasant acidity, ideal for processing and household cooking"
            },
            {
                "name": "Arka Vikas",
                "scientific_species": "Solanum lycopersicum cv. Arka Vikas",
                "price": 30,
                "price_display": "₹30/kg",
                "season": "Year-round",
                "duration_days": 72,
                "yield_per_acre": 130,
                "characteristics": "Semi-determinate variety bred by IIHR Bengaluru, adaptable to moisture stress and hot summer"
            },
            {
                "name": "NS-501 (Hybrid)",
                "scientific_species": "Solanum lycopersicum F1 NS-501",
                "price": 38,
                "price_display": "₹38/kg",
                "season": "Rabi/Summer",
                "duration_days": 80,
                "yield_per_acre": 150,
                "characteristics": "Commercial shipper hybrid with square-round firm fruits ideal for distant long transport"
            },
            {
                "name": "PKM-1",
                "scientific_species": "Solanum lycopersicum cv. PKM-1",
                "price": 25,
                "price_display": "₹25/kg",
                "season": "Year-round",
                "duration_days": 65,
                "yield_per_acre": 110,
                "characteristics": "High vitamin C variety yielding prolific clusters of smooth medium sized fruits"
            },
            {
                "name": "Shivam Hybrid",
                "scientific_species": "Solanum lycopersicum F1 Shivam",
                "price": 32,
                "price_display": "₹32/kg",
                "season": "Year-round",
                "duration_days": 75,
                "yield_per_acre": 145,
                "characteristics": "Uniform shiny fruits with high firmness and strong resistance to leaf curl virus"
            }
        ]
    },
    "Mango": {
        "unit": "kg",
        "botanical_genus": "Mangifera indica",
        "varieties": [
            {
                "name": "Alphonso (Hapus)",
                "scientific_species": "Mangifera indica cv. Alphonso",
                "price": 150,
                "price_display": "₹150/kg",
                "season": "Mar-Jun",
                "duration_days": 1825,
                "yield_per_acre": 30,
                "characteristics": "Undisputed king of mangoes with golden saffron flesh, fiberless texture and intoxicating fragrance"
            },
            {
                "name": "Badami (Karnataka Alphonso)",
                "scientific_species": "Mangifera indica cv. Badami",
                "price": 100,
                "price_display": "₹100/kg",
                "season": "Apr-Jun",
                "duration_days": 1825,
                "yield_per_acre": 40,
                "characteristics": "Karnataka's signature dessert mango, sweet creamy pulp with thin skin and rich aroma"
            },
            {
                "name": "Totapuri (Ginimoothi)",
                "scientific_species": "Mangifera indica cv. Totapuri",
                "price": 55,
                "price_display": "₹55/kg",
                "season": "Apr-Jul",
                "duration_days": 1825,
                "yield_per_acre": 60,
                "characteristics": "Parrot-beak shaped mango heavily cultivated in Kolar & Srinivaspur for commercial pulp processing"
            },
            {
                "name": "Raspuri (Sweet Rasalu)",
                "scientific_species": "Mangifera indica cv. Raspuri",
                "price": 70,
                "price_display": "May-Jul",
                "duration_days": 1825,
                "yield_per_acre": 50,
                "characteristics": "Extremely juicy aromatic local mango beloved in Old Mysuru and Bengaluru regions"
            },
            {
                "name": "Malgova",
                "scientific_species": "Mangifera indica cv. Malgova",
                "price": 85,
                "price_display": "₹85/kg",
                "season": "May-Jul",
                "duration_days": 1825,
                "yield_per_acre": 45,
                "characteristics": "Large round fruit (up to 400g) with thick sweet fiberless pulp and tiny flat stone"
            },
            {
                "name": "Neelam",
                "scientific_species": "Mangifera indica cv. Neelam",
                "price": 45,
                "price_display": "₹45/kg",
                "season": "Jun-Aug",
                "duration_days": 1825,
                "yield_per_acre": 55,
                "characteristics": "Late season variety with exceptional keeping quality and regular annual bearing"
            },
            {
                "name": "Mallika",
                "scientific_species": "Mangifera indica (Neelam x Dashehari)",
                "price": 90,
                "price_display": "₹90/kg",
                "season": "May-Jun",
                "duration_days": 1825,
                "yield_per_acre": 48,
                "characteristics": "Hybrid variety combining high TSS (sugar), uniform canary yellow flesh and disease resistance"
            }
        ]
    },
    "Onion": {
        "unit": "quintal",
        "botanical_genus": "Allium cepa",
        "varieties": [
            {
                "name": "Bellary Red",
                "scientific_species": "Allium cepa cv. Bellary Red",
                "price": 2600,
                "price_display": "₹2,600/quintal",
                "season": "Kharif/Rabi",
                "duration_days": 115,
                "yield_per_acre": 90,
                "characteristics": "Renowned Karnataka variety with flattish-round pungent red bulbs and outstanding storage life"
            },
            {
                "name": "Arka Kalyan",
                "scientific_species": "Allium cepa cv. Arka Kalyan",
                "price": 2800,
                "price_display": "₹2,800/quintal",
                "season": "Kharif",
                "duration_days": 125,
                "yield_per_acre": 110,
                "characteristics": "Bred by IIHR Bengaluru, tolerant to purple blotch disease, deep red globular flesh"
            },
            {
                "name": "Bhima Super",
                "scientific_species": "Allium cepa cv. Bhima Super",
                "price": 2900,
                "price_display": "₹2,900/quintal",
                "season": "Kharif",
                "duration_days": 110,
                "yield_per_acre": 100,
                "characteristics": "Bred by DOGR, bright red single-centered bulbs suited for early Kharif harvest"
            },
            {
                "name": "Nashik Red",
                "scientific_species": "Allium cepa cv. Nashik Red",
                "price": 2500,
                "price_display": "₹2,500/quintal",
                "season": "Rabi",
                "duration_days": 120,
                "yield_per_acre": 95,
                "characteristics": "Standard commercial red onion with tight outer scales and minimal bolting"
            },
            {
                "name": "Pusa White",
                "scientific_species": "Allium cepa cv. Pusa White Flat",
                "price": 3100,
                "price_display": "₹3,100/quintal",
                "season": "Rabi",
                "duration_days": 130,
                "yield_per_acre": 85,
                "characteristics": "White onion cultivar with high total soluble solids (14% TSS) suited for dehydration"
            }
        ]
    },
    "Potato": {
        "unit": "quintal",
        "botanical_genus": "Solanum tuberosum",
        "varieties": [
            {
                "name": "Kufri Jyoti",
                "scientific_species": "Solanum tuberosum cv. Kufri Jyoti",
                "price": 1800,
                "price_display": "₹1,800/quintal",
                "season": "Rabi",
                "duration_days": 100,
                "yield_per_acre": 85,
                "characteristics": "Widely grown table potato with oval white tubers, resistant to late blight"
            },
            {
                "name": "Kufri Pukhraj",
                "scientific_species": "Solanum tuberosum cv. Kufri Pukhraj",
                "price": 1650,
                "price_display": "₹1,650/quintal",
                "season": "Rabi",
                "duration_days": 80,
                "yield_per_acre": 110,
                "characteristics": "Early bulking variety with smooth yellow skin, high yield in short crop windows"
            },
            {
                "name": "Kufri Chandramukhi",
                "scientific_species": "Solanum tuberosum cv. Chandramukhi",
                "price": 1900,
                "price_display": "₹1,900/quintal",
                "season": "Rabi",
                "duration_days": 90,
                "yield_per_acre": 80,
                "characteristics": "Attractive oval flat white tubers with shallow eyes and superior boiling score"
            },
            {
                "name": "Kufri Chipsona-1",
                "scientific_species": "Solanum tuberosum cv. Chipsona-1",
                "price": 2100,
                "price_display": "₹2,100/quintal",
                "season": "Rabi",
                "duration_days": 105,
                "yield_per_acre": 90,
                "characteristics": "Industrial processing variety with high dry matter and low reducing sugar for chips"
            }
        ]
    },
    "Turmeric": {
        "unit": "quintal",
        "botanical_genus": "Curcuma longa",
        "varieties": [
            {
                "name": "Salem Local",
                "scientific_species": "Curcuma longa cv. Salem",
                "price": 9500,
                "price_display": "₹9,500/quintal",
                "season": "Kharif",
                "duration_days": 270,
                "yield_per_acre": 110,
                "characteristics": "High grade long bright orange-yellow mother fingers with 4.5% curcumin content"
            },
            {
                "name": "IISR Pratibha",
                "scientific_species": "Curcuma longa cv. Pratibha",
                "price": 10500,
                "price_display": "₹10,500/quintal",
                "season": "Kharif",
                "duration_days": 225,
                "yield_per_acre": 130,
                "characteristics": "High curcumin (6.25%) early variety released by IISR with golden yellow polished fingers"
            },
            {
                "name": "Pragati",
                "scientific_species": "Curcuma longa cv. Pragati",
                "price": 10200,
                "price_display": "₹10,200/quintal",
                "season": "Kharif",
                "duration_days": 210,
                "yield_per_acre": 120,
                "characteristics": "Short duration variety (7 months) with 5.0% curcumin, suited for crop rotation"
            },
            {
                "name": "Erode Local",
                "scientific_species": "Curcuma longa cv. Erode",
                "price": 9800,
                "price_display": "₹9,800/quintal",
                "season": "Kharif",
                "duration_days": 260,
                "yield_per_acre": 105,
                "characteristics": "Famous GI-tagged South Indian turmeric with dark yellow core and fragrant aroma"
            }
        ]
    },
    "Chilli": {
        "unit": "quintal",
        "botanical_genus": "Capsicum annuum",
        "varieties": [
            {
                "name": "Byadgi Kaddi",
                "scientific_species": "Capsicum annuum cv. Byadgi Kaddi",
                "price": 28000,
                "price_display": "₹28,000/quintal",
                "season": "Kharif",
                "duration_days": 150,
                "yield_per_acre": 14,
                "characteristics": "GI-tagged Karnataka specialty, extra long wrinkled deep red pods with high ASTA color (150+)"
            },
            {
                "name": "Byadgi Dabbi",
                "scientific_species": "Capsicum annuum cv. Byadgi Dabbi",
                "price": 32000,
                "price_display": "₹32,000/quintal",
                "season": "Kharif",
                "duration_days": 155,
                "yield_per_acre": 12,
                "characteristics": "Plump pouch-shaped dry chilli with intense crimson natural oleoresin color and mild pungency"
            },
            {
                "name": "Guntur Sannam (S4)",
                "scientific_species": "Capsicum annuum cv. Guntur Sannam",
                "price": 18000,
                "price_display": "₹18,000/quintal",
                "season": "Kharif/Rabi",
                "duration_days": 140,
                "yield_per_acre": 18,
                "characteristics": "India's highest volume spice chilli with fiery heat (35,000 to 40,000 SHU) and thick skin"
            },
            {
                "name": "Pusa Jwala",
                "scientific_species": "Capsicum annuum cv. Pusa Jwala",
                "price": 19500,
                "price_display": "₹19,500/quintal",
                "season": "Kharif",
                "duration_days": 130,
                "yield_per_acre": 16,
                "characteristics": "Early pungent variety with light green slender fruits turning bright red at maturity"
            }
        ]
    }
}


# Comprehensive crop species/varieties and agronomic recommendation engine
from crop_varieties_data import CROP_SPECIES, get_crop_species_info, recommend_crop_varieties


def get_district_for_taluk(taluk_name: str) -> str:
    taluk_clean = taluk_name.strip().lower()
    for district, taluks in TALUK_MAP.items():
        for t in taluks:
            if t.lower() == taluk_clean or taluk_clean in t.lower() or t.lower() in taluk_clean:
                return district
    return taluk_name  # Return taluk name itself as fallback (it may be a district)


def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def get_soil_data_from_csv():
    """Extract average pH and soil type from the crop dataset."""
    if not os.path.exists(CSV_FILE):
        return {"ph": 6.2, "soil_type": "Laterite"}
    
    ph_values = []
    soil_types = {}
    
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    ph_values.append(float(row['pH']))
                    soil = row.get('Soil_Type', 'Laterite')
                    soil_types[soil] = soil_types.get(soil, 0) + 1
                except (ValueError, KeyError):
                    continue
    except Exception as e:
        print(f"Error reading CSV for soil data: {e}")
        return {"ph": 6.2, "soil_type": "Laterite"}
    
    avg_ph = round(sum(ph_values) / len(ph_values), 2) if ph_values else 6.2
    most_common_soil = max(soil_types, key=soil_types.get) if soil_types else "Laterite"
    
    return {"ph": avg_ph, "soil_type": most_common_soil}

# Regional Agro-Climatic Zones & District Suitability Mapping for Karnataka & Neighboring States
KARNATAKA_DISTRICT_CROPS = {
    # ── Coastal Karnataka (High rainfall, laterite soil, acidic pH, humid) ──
    "Dakshina Kannada": ["Rice", "Arecanut", "Coconut", "Cashew", "Rubber", "Banana", "Pepper", "Ginger", "Turmeric"],
    "Udupi": ["Rice", "Arecanut", "Coconut", "Cashew", "Banana", "Pepper", "Ginger", "Turmeric", "Rubber"],
    "Uttara Kannada": ["Rice", "Arecanut", "Coconut", "Cashew", "Banana", "Pepper", "Cardamom", "Ginger", "Turmeric"],

    # ── Hilly / Malnad Karnataka (High elevation, cooler temp, heavy rainfall) ──
    "Chikkamagaluru": ["Coffee", "Cardamom", "Arecanut", "Pepper", "Ginger", "Rice", "Banana", "Turmeric"],
    "Kodagu": ["Coffee", "Cardamom", "Pepper", "Rice", "Banana", "Ginger", "Rubber", "Turmeric"],
    "Hassan": ["Coffee", "Cardamom", "Potato", "Ragi", "Maize", "Pepper", "Ginger", "Coconut", "Banana"],
    "Shivamogga": ["Arecanut", "Rice", "Ginger", "Pepper", "Banana", "Maize", "Coconut", "Turmeric"],

    # ── Northern Dry Karnataka (Low rainfall, black cotton soil, high heat) ──
    "Bagalkot": ["Jowar", "Bengal Gram", "Sugarcane", "Maize", "Pomegranate", "Onion", "Chilli", "Wheat", "Cotton"],
    "Ballari": ["Cotton", "Chilli", "Jowar", "Bengal Gram", "Maize", "Groundnut", "Rice", "Pomegranate"],
    "Bidar": ["Bengal Gram", "Red Gram", "Jowar", "Sugarcane", "Wheat", "Maize", "Chilli"],
    "Gadag": ["Bengal Gram", "Jowar", "Cotton", "Maize", "Chilli", "Groundnut", "Wheat", "Onion"],
    "Kalaburagi": ["Red Gram", "Bengal Gram", "Jowar", "Wheat", "Cotton", "Sugarcane", "Maize"],
    "Koppal": ["Rice", "Jowar", "Bengal Gram", "Maize", "Pomegranate", "Chilli", "Groundnut", "Cotton"],
    "Raichur": ["Rice", "Cotton", "Chilli", "Jowar", "Bengal Gram", "Groundnut", "Red Gram"],
    "Vijayapura": ["Jowar", "Bengal Gram", "Pomegranate", "Wheat", "Maize", "Chilli", "Sugarcane", "Cotton"],
    "Yadgir": ["Red Gram", "Rice", "Jowar", "Bengal Gram", "Cotton", "Groundnut"],
    "Vijayanagara": ["Cotton", "Chilli", "Maize", "Sugarcane", "Jowar", "Bengal Gram", "Pomegranate"],

    # ── Northern Transition Karnataka (Moderate rainfall, transitional soils) ──
    "Belagavi": ["Sugarcane", "Maize", "Cotton", "Jowar", "Bengal Gram", "Groundnut", "Chilli", "Tomato", "Wheat", "Rice"],
    "Dharwad": ["Cotton", "Maize", "Bengal Gram", "Jowar", "Chilli", "Groundnut", "Wheat", "Onion", "Tomato"],
    "Haveri": ["Maize", "Chilli", "Cotton", "Groundnut", "Jowar", "Bengal Gram", "Sugarcane", "Tomato"],
    "Davanagere": ["Maize", "Rice", "Sugarcane", "Cotton", "Arecanut", "Tomato", "Chilli", "Groundnut"],

    # ── Southern Dry & Central Karnataka (Red sandy/loamy, moderate rainfall) ──
    "Chitradurga": ["Groundnut", "Ragi", "Maize", "Arecanut", "Pomegranate", "Cotton", "Onion", "Chilli"],
    "Tumakuru": ["Coconut", "Arecanut", "Ragi", "Groundnut", "Maize", "Mango", "Tomato"],
    "Mandya": ["Sugarcane", "Rice", "Ragi", "Coconut", "Banana", "Tomato", "Maize"],
    "Mysuru": ["Rice", "Ragi", "Cotton", "Sugarcane", "Banana", "Maize", "Ginger", "Turmeric"],
    "Chamarajanagar": ["Turmeric", "Banana", "Sugarcane", "Ragi", "Maize", "Groundnut", "Cotton", "Chilli"],

    # ── Eastern Dry & Bengaluru Transition (Red soils, plateau climate) ──
    "Bengaluru Rural": ["Ragi", "Tomato", "Potato", "Mango", "Maize", "Groundnut", "Banana"],
    "Bengaluru Urban": ["Ragi", "Tomato", "Potato", "Mango", "Banana", "Maize"],
    "Kolar": ["Tomato", "Mango", "Potato", "Ragi", "Groundnut", "Chilli", "Maize"],
    "Chikkaballapur": ["Tomato", "Potato", "Mango", "Ragi", "Maize", "Groundnut", "Pomegranate"],
    "Ramanagara": ["Ragi", "Mango", "Coconut", "Banana", "Tomato", "Turmeric", "Maize"],
}

def get_allowed_crops_for_district(district: str) -> List[str]:
    """Returns valid agronomic crops strictly suitable for a given district."""
    if not district:
        return list(CROP_PROFILES.keys())
    
    # Check exact match
    if district in KARNATAKA_DISTRICT_CROPS:
        return KARNATAKA_DISTRICT_CROPS[district]
    
    # Case insensitive match
    for d_name, crops in KARNATAKA_DISTRICT_CROPS.items():
        if d_name.lower() == district.lower():
            return crops
            
    # Kerala districts
    kerala_districts = ["Thiruvananthapuram", "Ernakulam", "Palakkad", "Kozhikode", "Wayanad", "Idukki", "Kasaragod", "Thrissur", "Malappuram", "Kollam", "Kottayam", "Alappuzha", "Kannur"]
    if any(k.lower() == district.lower() for k in kerala_districts):
        return ["Rubber", "Coffee", "Cardamom", "Pepper", "Coconut", "Rice", "Banana", "Ginger", "Turmeric", "Cashew"]

    # Tamil Nadu districts
    tamil_districts = ["Chennai", "Coimbatore", "Madurai", "Salem", "Thanjavur", "Tiruchirappalli", "Tirunelveli", "Erode", "Nilgiris", "Dindigul", "Tiruppur"]
    if any(k.lower() == district.lower() for k in tamil_districts):
        return ["Rice", "Sugarcane", "Cotton", "Banana", "Coconut", "Groundnut", "Maize", "Turmeric", "Tomato", "Chilli"]

    # Maharashtra / Dry zones
    maha_districts = ["Pune", "Nagpur", "Nashik", "Kolhapur", "Aurangabad", "Solapur", "Satara", "Sangli", "Ratnagiri"]
    if any(k.lower() == district.lower() for k in maha_districts):
        return ["Sugarcane", "Cotton", "Jowar", "Bengal Gram", "Wheat", "Pomegranate", "Onion", "Tomato", "Groundnut"]

    # Fallback to all profiles
    return list(CROP_PROFILES.keys())

def get_recommendations_from_csv(ph, temp, rainfall, humidity=None, district=None, taluk=None, soil_type=None):
    """
    Find best matching crops based on regional suitability, 
    soil pH, Temperature, Rainfall, and Humidity using a calibrated multi-parameter scoring model.
    """
    scores = {}
    target_humidity = humidity if humidity is not None else 85.0
    
    # Determine district from taluk if not directly provided
    resolved_district = district
    if not resolved_district and taluk:
        resolved_district = get_district_for_taluk(taluk)
    
    allowed_crops = get_allowed_crops_for_district(resolved_district)
    
    # Preferred soils mapping for bonus scoring
    crop_soil_preferences = {
        "Rice": ["Laterite", "Alluvial", "Clay Loam", "Red Sandy"],
        "Arecanut": ["Laterite", "Red Loam", "Clay Loam", "Dark Hilly"],
        "Coconut": ["Laterite", "Coastal Alluvial", "Red Sandy", "Alluvial"],
        "Cashew": ["Laterite", "Red Sandy"],
        "Rubber": ["Laterite", "Dark Hilly", "Red Loamy"],
        "Pepper": ["Laterite", "Dark Hilly", "Red Loam"],
        "Cardamom": ["Dark Hilly", "Forest Loam", "Red Clayey"],
        "Coffee": ["Dark Hilly", "Red Clayey", "Forest Loam", "Laterite"],
        "Banana": ["Alluvial", "Laterite", "Red Loam", "Clay Loam"],
        "Ginger": ["Laterite", "Red Loamy", "Sandy Loam"],
        "Turmeric": ["Red Loamy", "Alluvial", "Laterite"],
        "Jowar": ["Black Cotton", "Deep Black", "Black Clayey", "Mixed Red & Black"],
        "Cotton": ["Black Cotton", "Deep Black", "Black Clayey"],
        "Bengal Gram": ["Black Cotton", "Deep Black", "Black Clayey"],
        "Red Gram": ["Red Loamy", "Black Cotton", "Mixed Red & Black", "Red Sandy"],
        "Wheat": ["Black Cotton", "Alluvial", "Deep Black"],
        "Pomegranate": ["Black Cotton", "Mixed Red & Black", "Red Sandy"],
        "Ragi": ["Red Sandy", "Red Loam", "Laterite"],
        "Groundnut": ["Red Sandy", "Red Loam", "Sandy Loam"],
        "Sugarcane": ["Black Cotton", "Alluvial", "Red Loam"],
        "Tomato": ["Red Loam", "Red Sandy", "Alluvial"],
        "Chilli": ["Black Cotton", "Red Loamy", "Mixed Red & Black"],
        "Onion": ["Red Loam", "Black Cotton", "Sandy Loam"],
        "Potato": ["Red Loamy", "Red Sandy", "Sandy Loam"],
        "Mango": ["Red Sandy", "Red Loam", "Laterite"],
    }
    
    try:
        for crop in allowed_crops:
            if crop not in CROP_PROFILES:
                continue
            profile = CROP_PROFILES[crop]
            row_ph = profile["ph"]
            row_temp = profile["temp"]
            row_hum = profile["humidity"]
            row_rainfall = profile["rainfall"]
            
            # Normalized agronomic distances (weighted)
            # pH: range 4-9 (5) | Temp: 15-40 (25) | Hum: 30-100 (70) | Rain: 500-5000 (4500)
            d_ph = (abs(row_ph - ph) / 5.0) * 0.25
            d_temp = (abs(row_temp - temp) / 25.0) * 0.25
            d_hum = (abs(row_hum - target_humidity) / 70.0) * 0.20
            d_rain = (abs(row_rainfall - rainfall) / 4500.0) * 0.30
            
            distance = (d_ph**2 + d_temp**2 + d_hum**2 + d_rain**2)**0.5
            base_score = 1.0 / (1.0 + distance)
            
            # Soil type affinity bonus
            soil_bonus = 0.0
            if soil_type:
                preferred = crop_soil_preferences.get(crop, [])
                if any(p.lower() in soil_type.lower() or soil_type.lower() in p.lower() for p in preferred):
                    soil_bonus = 0.15
                    
            scores[crop] = base_score + soil_bonus
            
    except Exception as e:
        print(f"Error in recommendation logic: {e}")
        return allowed_crops[:5] if allowed_crops else ["Rice", "Arecanut", "Banana"]

    if not scores:
        return allowed_crops[:5] if allowed_crops else ["Coconut", "Arecanut", "Pepper"]
    
    # Return Top 5 unique crops sorted by score
    recommended = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [crop for crop, score in recommended[:5]]

def get_market_history(crop, taluk=None):
    """Get 5-year market price history for a crop."""
    history = []
    if not os.path.exists(MARKET_HISTORY_FILE):
        return history
    
    try:
        with open(MARKET_HISTORY_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['Crop'] == crop:
                    if taluk and row['Taluk'] != taluk:
                        continue
                    history.append({
                        "taluk": row['Taluk'],
                        "crop": row['Crop'],
                        "year": int(row['Year']),
                        "month": row['Month'],
                        "price": float(row['Price']),
                        "unit": row['Unit'],
                        "trend": row['Trend']
                    })
    except Exception as e:
        print(f"Error reading market history: {e}")
    
    return history

def get_avg_yield_for_crop(crop):
    """Get average yield per acre from farmer details dataset."""
    yields = []
    if not os.path.exists(FARMER_DETAILS_FILE):
        return None
    
    try:
        with open(FARMER_DETAILS_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['Primary_Crop'] == crop:
                    acres = float(row['Total_Land_Acres'])
                    total_yield = float(row['Yield_Quantity'])
                    if acres > 0:
                        yields.append(total_yield / acres)
    except Exception as e:
        print(f"Error reading farmer details: {e}")
    
    if yields:
        return round(sum(yields) / len(yields), 1)
        
    crop_yields = {
        "Coffee": 12.0,
        "Cardamom": 1.5,
        "Ginger": 80.0,
        "Jowar": 8.0,
        "Cotton": 7.0,
        "Maize": 20.0,
        "Bengal Gram": 6.0,
        "Red Gram": 5.0,
        "Wheat": 12.0,
        "Pomegranate": 60.0,
        "Ragi": 10.0,
        "Groundnut": 8.0,
        "Sugarcane": 350.0,
        "Tomato": 120.0,
        "Mango": 40.0,
        "Rice": 15.0,
        "Banana": 180.0,
        "Arecanut": 10.0,
        "Pepper": 4.0,
        "Cashew": 6.0,
        "Rubber": 8.0,
        "Coconut": 40.0,
    }
    return crop_yields.get(crop, 10.0)

# Models
class RegistrationRequest(BaseModel):
    name: str
    aadhaar_number: Optional[str] = ""
    survey_number: str
    phone_number: str
    state: str
    district: str
    taluk: str
    hobli: str
    password: str
    land_area_acres: float = 0.0
    land_area_guntas: float = 0.0
    primary_crop: Optional[str] = None
    soil_type: Optional[str] = None

class LoginRequest(BaseModel):
    name: str
    password: str

class CropHistoryEntry(BaseModel):
    year: int = Field(ge=1900, le=date.today().year)
    crop_name: str = Field(min_length=1, max_length=100)
    season: str = Field(min_length=1, max_length=50)
    cultivated_area_acres: float = Field(gt=0, allow_inf_nan=False)
    yield_quantity: float = Field(ge=0, allow_inf_nan=False)
    yield_unit: str = Field(default="kg", min_length=1, max_length=30)
    soil_type: str = Field(min_length=1, max_length=100)
    soil_ph: float = Field(ge=0, le=14, allow_inf_nan=False)
    irrigation_type: str = Field(min_length=1, max_length=100)
    profit: Optional[float] = Field(default=None, allow_inf_nan=False)

class CropHistoryBatch(BaseModel):
    records: List[CropHistoryEntry] = Field(min_length=1, max_length=25)

class UpdateFarmerRequest(BaseModel):
    current_name: Optional[str] = None
    name: Optional[str] = None
    phone_number: Optional[str] = None
    survey_number: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    hobli: Optional[str] = None
    land_area_acres: Optional[float] = None
    land_area_guntas: Optional[float] = None
    primary_crop: Optional[str] = None
    soil_type: Optional[str] = None

@app.post("/register")
async def register_farmer(reg: RegistrationRequest):
    clean_name = reg.name.strip()
    clean_phone = reg.phone_number.strip()
    clean_survey = reg.survey_number.strip()
    clean_state = reg.state.strip() or "Karnataka"
    clean_district = reg.district.strip() or "Dakshina Kannada"
    clean_taluk = reg.taluk.strip() or "Mangaluru"
    clean_hobli = reg.hobli.strip() or "Kasaba"
    clean_pass = reg.password.strip()
    acres = float(reg.land_area_acres or 0.0)
    guntas = float(reg.land_area_guntas or 0.0)

    # Determine regional default primary crop and soil type if missing
    regional_crops = {
        "Mangaluru": "Rice", "Bantwal": "Arecanut", "Puttur": "Arecanut",
        "Belthangady": "Rubber", "Sullia": "Rubber", "Udupi": "Rice",
        "Kundapura": "Cashew", "Karkala": "Pepper", "Karwar": "Rice",
        "Sirsi": "Arecanut", "Kumta": "Coconut", "Honnavar": "Rice",
        "Harihar": "Ragi", "Davanagere": "Maize", "Bengaluru": "Ragi",
        "Mysuru": "Rice", "Mandya": "Sugarcane", "Hassan": "Coffee"
    }
    prim_crop = reg.primary_crop or regional_crops.get(clean_taluk, "Rice")
    soil = reg.soil_type or DISTRICT_BASELINES.get(clean_district, {}).get("soil_type", "Laterite Soil")

    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        p = "%s" if db_type == "mysql" else "?"

        # Check if farmer already exists in MySQL Workbench (or fallback)
        cursor.execute(
            f"SELECT id FROM farmers WHERE LOWER(TRIM(name)) = LOWER({p}) OR (phone_number != '' AND phone_number = {p})",
            (clean_name, clean_phone)
        )
        existing = cursor.fetchone()

        if existing:
            fid = existing[0]
            cursor.execute(f'''
                UPDATE farmers
                SET name={p}, aadhaar_number={p}, survey_number={p}, phone_number={p},
                    state={p}, district={p}, taluk={p}, hobli={p}, password={p},
                    land_area_acres={p}, land_area_guntas={p}, primary_crop={p}, soil_type={p}
                WHERE id={p}
            ''', (clean_name, reg.aadhaar_number or "", clean_survey, clean_phone, clean_state, clean_district, clean_taluk, clean_hobli, clean_pass, acres, guntas, prim_crop, soil, fid))
        else:
            cursor.execute(f'''
                INSERT INTO farmers (name, aadhaar_number, survey_number, phone_number, state, district, taluk, hobli, password, land_area_acres, land_area_guntas, primary_crop, soil_type)
                VALUES ({", ".join([p] * 13)})
            ''', (clean_name, reg.aadhaar_number or "", clean_survey, clean_phone, clean_state, clean_district, clean_taluk, clean_hobli, clean_pass, acres, guntas, prim_crop, soil))
            fid = cursor.lastrowid

        if hasattr(conn, "commit"):
            conn.commit()
        conn.close()

        # Mirror to SQLite if connected to MySQL so backup stays synced
        if db_type == "mysql" and os.path.exists("farmer_portal.db"):
            try:
                s_conn = sqlite3.connect("farmer_portal.db")
                s_cur = s_conn.cursor()
                s_cur.execute("SELECT id FROM farmers WHERE LOWER(TRIM(name)) = LOWER(?) OR (phone_number != '' AND phone_number = ?)", (clean_name, clean_phone))
                s_exist = s_cur.fetchone()
                if s_exist:
                    s_cur.execute('''
                        UPDATE farmers
                        SET name=?, aadhaar_number=?, survey_number=?, phone_number=?, state=?, district=?, taluk=?, hobli=?, password=?, land_area_acres=?, land_area_guntas=?, primary_crop=?, soil_type=?
                        WHERE id=?
                    ''', (clean_name, reg.aadhaar_number or "", clean_survey, clean_phone, clean_state, clean_district, clean_taluk, clean_hobli, clean_pass, acres, guntas, prim_crop, soil, s_exist[0]))
                else:
                    s_cur.execute('''
                        INSERT INTO farmers (name, aadhaar_number, survey_number, phone_number, state, district, taluk, hobli, password, land_area_acres, land_area_guntas, primary_crop, soil_type)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (clean_name, reg.aadhaar_number or "", clean_survey, clean_phone, clean_state, clean_district, clean_taluk, clean_hobli, clean_pass, acres, guntas, prim_crop, soil))
                s_conn.commit()
                s_conn.close()
            except Exception as se:
                print(f"SQLite shadow sync notice: {se}")

        return {
            "status": "success",
            "message": "Farmer registered successfully in MySQL Workbench",
            "database": "MySQL Workbench (farmer_portal)" if db_type == "mysql" else "SQLite fallback",
            "farmer_id": fid,
            "name": clean_name
        }
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
async def login_farmer(login: LoginRequest):
    clean_name = login.name.strip()
    clean_pass = login.password.strip()
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        p = "%s" if db_type == "mysql" else "?"
        
        # Check if user exists by Name OR Phone Number
        cursor.execute(
            f"SELECT id, name, taluk, district, state, hobli, aadhaar_number, survey_number, phone_number, land_area_acres, land_area_guntas, primary_crop, soil_type, password FROM farmers WHERE LOWER(TRIM(name)) = LOWER({p}) OR (phone_number != '' AND phone_number = {p})",
            (clean_name, clean_name)
        )
        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Name or Phone Number not found in database. Please register first.")

        # Verify password
        db_pass = str(row[13] or "")
        if db_pass != clean_pass:
            raise HTTPException(status_code=401, detail="Password incorrect")

        access_token = secrets.token_urlsafe(32)
        CROP_HISTORY_SESSIONS[access_token] = int(row[0])

        return {
            "status": "success",
            "database": "MySQL Workbench (farmer_portal)" if db_type == "mysql" else "SQLite fallback",
            "access_token": access_token,
            "user": {
                "id": f"FP-{row[0]}",
                "name": row[1],
                "taluk": row[2] or "Mangaluru",
                "district": row[3] or "Dakshina Kannada",
                "state": row[4] or "Karnataka",
                "hobli": row[5] or "Kasaba",
                "aadhaar_number": row[6] or "",
                "survey_number": row[7] or "120",
                "phone_number": row[8] or "",
                "land_area_acres": float(row[9] or 0.0),
                "land_area_guntas": float(row[10] or 0.0),
                "primary_crop": row[11] or "Rice",
                "soil_type": row[12] or "Laterite Soil"
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during login")

def _crop_history_farmer_id(authorization: Optional[str]) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Login required to access crop history")
    farmer_id = CROP_HISTORY_SESSIONS.get(authorization[7:].strip())
    if farmer_id is None:
        raise HTTPException(status_code=401, detail="Crop history session is invalid or expired")
    return farmer_id

def _crop_history_record(row):
    return {
        "id": int(row[0]),
        "year": int(row[1]),
        "crop_name": row[2],
        "season": row[3],
        "cultivated_area_acres": float(row[4]),
        "yield_quantity": float(row[5]),
        "yield_unit": row[6],
        "soil_type": row[7],
        "soil_ph": float(row[8]),
        "irrigation_type": row[9],
        "profit": float(row[10]) if row[10] is not None else None,
        "created_at": str(row[11]) if row[11] else None,
        "updated_at": str(row[12]) if row[12] else None
    }

@app.post("/logout")
async def logout_farmer(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        CROP_HISTORY_SESSIONS.pop(authorization[7:].strip(), None)
    return {"status": "success"}

@app.get("/farmer/crop-history")
async def list_farmer_crop_history(authorization: Optional[str] = Header(None)):
    farmer_id = _crop_history_farmer_id(authorization)
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        p = "%s" if db_type == "mysql" else "?"
        cursor.execute(
            f"SELECT id, year, crop_name, season, cultivated_area_acres, yield_quantity, yield_unit, soil_type, soil_ph, irrigation_type, profit, created_at, updated_at FROM farmer_crop_history WHERE farmer_id = {p} ORDER BY year DESC, id DESC",
            (farmer_id,)
        )
        records = [_crop_history_record(row) for row in cursor.fetchall()]
        conn.close()
        return {"records": records}
    except Exception as e:
        if "conn" in locals():
            conn.close()
        print(f"Crop history lookup error: {e}")
        raise HTTPException(status_code=500, detail="Failed to load crop history")

@app.post("/farmer/crop-history")
async def add_farmer_crop_history(
    batch: CropHistoryBatch,
    authorization: Optional[str] = Header(None)
):
    farmer_id = _crop_history_farmer_id(authorization)
    entries = []
    for entry in batch.records:
        values = entry.model_dump()
        for key in ("crop_name", "season", "soil_type", "irrigation_type", "yield_unit"):
            values[key] = values[key].strip()
            if not values[key]:
                raise HTTPException(status_code=422, detail=f"{key.replace('_', ' ').capitalize()} is required")
        entries.append(values)
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        p = "%s" if db_type == "mysql" else "?"
        if db_type == "mysql":
            conn.begin()
        records = []
        for values in entries:
            cursor.execute(
                f"INSERT INTO farmer_crop_history (farmer_id, year, crop_name, season, cultivated_area_acres, yield_quantity, yield_unit, soil_type, soil_ph, irrigation_type, profit) VALUES ({', '.join([p] * 11)})",
                (
                    farmer_id,
                    values["year"],
                    values["crop_name"],
                    values["season"],
                    values["cultivated_area_acres"],
                    values["yield_quantity"],
                    values["yield_unit"],
                    values["soil_type"],
                    values["soil_ph"],
                    values["irrigation_type"],
                    values["profit"]
                )
            )
            records.append({
                "id": int(cursor.lastrowid),
                "year": values["year"],
                "crop_name": values["crop_name"],
                "season": values["season"],
                "cultivated_area_acres": values["cultivated_area_acres"],
                "yield_quantity": values["yield_quantity"],
                "yield_unit": values["yield_unit"],
                "soil_type": values["soil_type"],
                "soil_ph": values["soil_ph"],
                "irrigation_type": values["irrigation_type"],
                "profit": values["profit"]
            })
        if hasattr(conn, "commit"):
            conn.commit()
        conn.close()
        return {"records": records}
    except HTTPException:
        raise
    except Exception as e:
        if "conn" in locals():
            if hasattr(conn, "rollback"):
                conn.rollback()
            conn.close()
        print(f"Crop history save error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save crop history")

@app.put("/farmer/crop-history/{record_id}")
async def update_farmer_crop_history(
    record_id: int,
    entry: CropHistoryEntry,
    authorization: Optional[str] = Header(None)
):
    farmer_id = _crop_history_farmer_id(authorization)
    values = entry.model_dump()
    for key in ("crop_name", "season", "soil_type", "irrigation_type", "yield_unit"):
        values[key] = values[key].strip()
        if not values[key]:
            raise HTTPException(status_code=422, detail=f"{key.replace('_', ' ').capitalize()} is required")
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        p = "%s" if db_type == "mysql" else "?"
        cursor.execute(
            f"UPDATE farmer_crop_history SET year={p}, crop_name={p}, season={p}, cultivated_area_acres={p}, yield_quantity={p}, yield_unit={p}, soil_type={p}, soil_ph={p}, irrigation_type={p}, profit={p}, updated_at=CURRENT_TIMESTAMP WHERE id={p} AND farmer_id={p}",
            (
                values["year"], values["crop_name"], values["season"],
                values["cultivated_area_acres"], values["yield_quantity"], values["yield_unit"],
                values["soil_type"], values["soil_ph"], values["irrigation_type"], values["profit"],
                record_id, farmer_id
            )
        )
        if cursor.rowcount == 0:
            cursor.execute(
                f"SELECT id FROM farmer_crop_history WHERE id={p} AND farmer_id={p}",
                (record_id, farmer_id)
            )
            if not cursor.fetchone():
                conn.close()
                raise HTTPException(status_code=404, detail="Crop history record not found")
        if hasattr(conn, "commit"):
            conn.commit()
        cursor.execute(
            f"SELECT id, year, crop_name, season, cultivated_area_acres, yield_quantity, yield_unit, soil_type, soil_ph, irrigation_type, profit, created_at, updated_at FROM farmer_crop_history WHERE id={p} AND farmer_id={p}",
            (record_id, farmer_id)
        )
        record = _crop_history_record(cursor.fetchone())
        conn.close()
        return {"record": record}
    except HTTPException:
        raise
    except Exception as e:
        if "conn" in locals():
            conn.close()
        print(f"Crop history update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update crop history")

@app.delete("/farmer/crop-history/{record_id}")
async def delete_farmer_crop_history(
    record_id: int,
    authorization: Optional[str] = Header(None)
):
    farmer_id = _crop_history_farmer_id(authorization)
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        p = "%s" if db_type == "mysql" else "?"
        cursor.execute(
            f"DELETE FROM farmer_crop_history WHERE id={p} AND farmer_id={p}",
            (record_id, farmer_id)
        )
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Crop history record not found")
        if hasattr(conn, "commit"):
            conn.commit()
        conn.close()
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        if "conn" in locals():
            conn.close()
        print(f"Crop history delete error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete crop history")

@app.post("/farmer/update")
async def update_farmer_profile(upd: UpdateFarmerRequest):
    clean_curr = (upd.current_name or upd.name or "").strip()
    if not clean_curr:
        raise HTTPException(status_code=400, detail="Farmer name is required to update profile")
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        p = "%s" if db_type == "mysql" else "?"

        cursor.execute(f"SELECT id FROM farmers WHERE LOWER(TRIM(name)) = LOWER({p})", (clean_curr,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail="Farmer not found in MySQL Workbench database")

        fid = row[0]
        updates = []
        vals = []
        if upd.name:
            updates.append(f"name = {p}")
            vals.append(upd.name.strip())
        if upd.phone_number is not None:
            updates.append(f"phone_number = {p}")
            vals.append(upd.phone_number.strip())
        if upd.survey_number is not None:
            updates.append(f"survey_number = {p}")
            vals.append(upd.survey_number.strip())
        if upd.state is not None:
            updates.append(f"state = {p}")
            vals.append(upd.state.strip())
        if upd.district is not None:
            updates.append(f"district = {p}")
            vals.append(upd.district.strip())
        if upd.taluk is not None:
            updates.append(f"taluk = {p}")
            vals.append(upd.taluk.strip())
        if upd.hobli is not None:
            updates.append(f"hobli = {p}")
            vals.append(upd.hobli.strip())
        if upd.land_area_acres is not None:
            updates.append(f"land_area_acres = {p}")
            vals.append(float(upd.land_area_acres))
        if upd.land_area_guntas is not None:
            updates.append(f"land_area_guntas = {p}")
            vals.append(float(upd.land_area_guntas))
        if upd.primary_crop is not None:
            updates.append(f"primary_crop = {p}")
            vals.append(upd.primary_crop.strip())
        if upd.soil_type is not None:
            updates.append(f"soil_type = {p}")
            vals.append(upd.soil_type.strip())

        if updates:
            vals.append(fid)
            cursor.execute(f"UPDATE farmers SET {', '.join(updates)} WHERE id = {p}", tuple(vals))
            if hasattr(conn, "commit"):
                conn.commit()

        # Re-fetch updated record
        cursor.execute(f"SELECT id, name, taluk, district, state, hobli, aadhaar_number, survey_number, phone_number, land_area_acres, land_area_guntas, primary_crop, soil_type FROM farmers WHERE id = {p}", (fid,))
        updated_row = cursor.fetchone()
        conn.close()

        # Shadow sync to SQLite if exists
        if db_type == "mysql" and os.path.exists("farmer_portal.db"):
            try:
                s_conn = sqlite3.connect("farmer_portal.db")
                s_cur = s_conn.cursor()
                s_updates = [u.replace("%s", "?") for u in updates]
                if s_updates:
                    s_cur.execute(f"UPDATE farmers SET {', '.join(s_updates)} WHERE LOWER(TRIM(name)) = LOWER(?)", tuple([v for v in vals[:-1]] + [clean_curr]))
                    s_conn.commit()
                s_conn.close()
            except Exception as se:
                print(f"SQLite update shadow sync notice: {se}")

        return {
            "status": "success",
            "message": "Farmer profile updated successfully in MySQL Workbench",
            "database": "MySQL Workbench (farmer_portal)",
            "user": {
                "id": f"FP-{updated_row[0]}",
                "name": updated_row[1],
                "taluk": updated_row[2] or "Mangaluru",
                "district": updated_row[3] or "Dakshina Kannada",
                "state": updated_row[4] or "Karnataka",
                "hobli": updated_row[5] or "Kasaba",
                "aadhaar_number": updated_row[6] or "",
                "survey_number": updated_row[7] or "120",
                "phone_number": updated_row[8] or "",
                "land_area_acres": float(updated_row[9] or 0.0),
                "land_area_guntas": float(updated_row[10] or 0.0),
                "primary_crop": updated_row[11] or "Rice",
                "soil_type": updated_row[12] or "Laterite Soil"
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Profile update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/farmers")
async def list_registered_farmers():
    """List all registered farmers saved in MySQL Workbench."""
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, phone_number, survey_number, state, district, taluk, hobli, land_area_acres, land_area_guntas, primary_crop, soil_type, created_at FROM farmers ORDER BY id DESC")
        rows = cursor.fetchall()
        conn.close()

        farmers_list = []
        for r in rows:
            farmers_list.append({
                "id": f"FP-{r[0]}",
                "name": r[1],
                "phone_number": r[2] or "",
                "survey_number": r[3] or "",
                "state": r[4] or "Karnataka",
                "district": r[5] or "",
                "taluk": r[6] or "",
                "hobli": r[7] or "",
                "land_area_acres": float(r[8] or 0.0),
                "land_area_guntas": float(r[9] or 0.0),
                "primary_crop": r[10] or "Rice",
                "soil_type": r[11] or "Laterite Soil",
                "created_at": str(r[12]) if len(r) > 12 and r[12] else None
            })

        return {
            "status": "success",
            "database": "MySQL Workbench (farmer_portal)" if db_type == "mysql" else "SQLite fallback",
            "total_registered_farmers": len(farmers_list),
            "farmers": farmers_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/farmer-info/{name}")
async def get_farmer_info(name: str):
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        p = "%s" if db_type == "mysql" else "?"
        cursor.execute(f"SELECT id, name, taluk, district, state, hobli, aadhaar_number, survey_number, phone_number, land_area_acres, land_area_guntas, primary_crop, soil_type FROM farmers WHERE LOWER(TRIM(name)) = LOWER({p})", (name.strip(),))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                "id": f"FP-{user[0]}",
                "name": user[1],
                "taluk": user[2] or "Mangaluru",
                "district": user[3] or "Dakshina Kannada",
                "state": user[4] or "Karnataka",
                "hobli": user[5] or "Kasaba",
                "aadhaar_number": user[6] or "",
                "survey_number": user[7] or "120",
                "phone_number": user[8] or "",
                "land_area_acres": float(user[9] or 0.0),
                "land_area_guntas": float(user[10] or 0.0),
                "primary_crop": user[11] or "Rice",
                "soil_type": user[12] or "Laterite Soil",
                "database": "MySQL Workbench (farmer_portal)" if db_type == "mysql" else "SQLite fallback"
            }
        raise HTTPException(status_code=404, detail="Farmer not found in database")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Farmer Portal API is running"}

# Helper to resolve coordinates from location name (GPS format "lat,lon" or Taluk lookup)
def get_location_coordinates(location: str) -> tuple:
    try:
        parts = location.split(',')
        if len(parts) == 2:
            return float(parts[0].strip()), float(parts[1].strip())
    except ValueError:
        pass
        
    loc_clean = location.strip().title()
    # Check direct Taluk coords mapping
    if loc_clean in TALUK_COORDS:
        return TALUK_COORDS[loc_clean]
        
    # Check if this is a taluk listed in our taluk map, and match it
    for dist, taluks in TALUK_MAP.items():
        for t in taluks:
            if t.lower() in location.lower() or location.lower() in t.lower():
                if t in TALUK_COORDS:
                    return TALUK_COORDS[t]
                    
    # District fallbacks
    district_fallbacks = {
        "Dakshina Kannada": (12.9141, 74.8560),
        "Udupi": (13.3409, 74.7421),
        "Uttara Kannada": (14.8000, 74.1300),
        "Bengaluru Urban": (12.9716, 77.5946),
        "Bengaluru Rural": (13.2483, 77.7128),
        "Hassan": (13.0050, 76.1028),
        "Chikkamagaluru": (13.3161, 75.7720),
        "Kodagu": (12.4244, 75.7389),
        "Shivamogga": (13.9299, 75.5681),
        "Tumakuru": (13.3392, 77.1140),
        "Mandya": (12.5218, 76.8973),
        "Mysuru": (12.2958, 76.6394),
        "Kalaburagi": (17.3297, 76.8343),
        "Belagavi": (15.8497, 74.4977),
        "Davanagere": (14.4644, 75.9219),
        "Dharwad": (15.4589, 75.0078),
        "Ballari": (15.1394, 76.9214),
        "Bagalkot": (16.1817, 75.6958),
        "Bidar": (17.9104, 77.5199),
        "Vijayapura": (16.8302, 75.7100),
    }
    
    for d, coords in district_fallbacks.items():
        if d.lower() in location.lower() or location.lower() in d.lower():
            return coords
            
    return (12.9141, 74.8560)

# WMO Weather Codes to descriptions
WMO_WEATHER_CODES = {
    0: "Clear Sky",
    1: "Partly Cloudy",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    56: "Light Drizzle",
    57: "Dense Drizzle",
    61: "Light Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    66: "Light Rain",
    67: "Heavy Rain",
    71: "Slight Snowfall",
    73: "Moderate Snowfall",
    75: "Heavy Snowfall",
    77: "Snow Grains",
    80: "Light Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Heavy Hail"
}

@app.get("/soil-data")
async def get_soil_info(taluk: Optional[str] = None, district: Optional[str] = None):
    """Get soil pH, type, and live parameters (temperature, moisture) from Open-Meteo."""
    target_district = "Dakshina Kannada"
    location_name = "Mangaluru"
    if taluk:
        location_name = taluk
        target_district = get_district_for_taluk(taluk) or "Dakshina Kannada"
    elif district:
        location_name = district
        target_district = district
        
    lat, lon = get_location_coordinates(location_name)
    
    # Get baseline soil type and pH
    soil_type = "Laterite"
    ph = 6.2
    if target_district and target_district in DISTRICT_BASELINES:
        ph = DISTRICT_BASELINES[target_district]["ph"]
        soil_type = DISTRICT_BASELINES[target_district]["soil_type"]
    else:
        # Fallback to CSV check
        try:
            csv_data = get_soil_data_from_csv()
            if csv_data:
                ph = csv_data.get("ph", ph)
                soil_type = csv_data.get("soil_type", soil_type)
        except Exception:
            pass
            
    # Fetch live variables
    live_temp = 25.4
    live_moisture = 34.2
    
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=soil_temperature_0_to_7cm,soil_moisture_0_to_7cm&timezone=auto"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            curr = data.get("current_weather", {})
            hourly = data.get("hourly", {})
            curr_time = curr.get("time")
            idx = 0
            if curr_time and "time" in hourly:
                times = hourly["time"]
                if curr_time in times:
                    idx = times.index(curr_time)
                else:
                    idx = next((i for i, t in enumerate(times) if t.startswith(curr_time[:13])), 0)
                    
            if "soil_temperature_0_to_7cm" in hourly and len(hourly["soil_temperature_0_to_7cm"]) > idx:
                live_temp = float(hourly["soil_temperature_0_to_7cm"][idx])
            if "soil_moisture_0_to_7cm" in hourly and len(hourly["soil_moisture_0_to_7cm"]) > idx:
                val = float(hourly["soil_moisture_0_to_7cm"][idx])
                live_moisture = round(val * 100, 1) if val <= 1.0 else round(val, 1)
    except Exception as e:
        print(f"Soil parameters fetch error: {e}")
        
    return {
        "ph": ph,
        "soil_type": soil_type,
        "temperature": round(live_temp, 1),
        "moisture": round(live_moisture, 1),
        "latitude": lat,
        "longitude": lon,
        "source": "Open-Meteo Soil Variable Service"
    }

@app.get("/lookup/{survey_number:path}")
async def lookup_survey(survey_number: str):
    """Check survey details. If not in mock_db.json, dynamically simulate a Karnataka Bhoomi RTC."""
    data = load_data()
    surveys = data.get("surveys", {})
    
    s_norm = survey_number.strip().upper()
    if s_norm in surveys:
        return surveys[s_norm]
        
    # Dynamically generate realistic survey details for Karnataka
    import hashlib
    h = int(hashlib.md5(s_norm.encode()).hexdigest(), 16)
    
    districts = list(TALUK_MAP.keys())
    district = districts[h % len(districts)]
    taluks = TALUK_MAP[district]
    taluk = taluks[(h >> 2) % len(taluks)]
    
    hoblis_options = {
        "Mangaluru": ["Mangaluru A", "Mangaluru B", "Surathkal", "Gurupura", "Mulki", "Haleyangadi", "Moodabidri"],
        "Bantwal": ["Bantwal", "Panemangaluru", "Vittal", "Rayi", "Navoor"],
        "Puttur": ["Puttur", "Uppinangady", "Nelyadi", "Kadaba"],
        "Belthangady": ["Belthangady", "Venur", "Kokkada", "Dharmasthala", "Poonjalkatte"],
        "Sullia": ["Sullia", "Panja", "Bellare", "Subrahmanya"],
        "Moodabidri": ["Moodabidri Kasaba", "Belavai", "Padumarnadu", "Puttige", "Mijar"],
        "Kadaba": ["Kadaba Kasaba", "Subrahmanya", "Nelyadi"],
    }
    hoblis = hoblis_options.get(taluk, [f"{taluk} Kasaba Hobli", f"{taluk} Rural Hobli"])
    hobli = hoblis[(h >> 4) % len(hoblis)]
    
    villages = ["Keladi", "Koteshwara", "Hadinbal", "Hanubalu", "Belavai", "Ullal", "Vittal", "Kokkada", "Subrahmanya", "Kalladka"]
    village = villages[(h >> 6) % len(villages)]
    
    return {
        "state": "Karnataka",
        "district": district,
        "taluk": taluk,
        "village": village,
        "hobli": hobli,
        "land_acres": 1 + (h % 5),
        "land_guntas": h % 40,
        "owner_name": f"Farmer {s_norm}"
    }

@app.get("/weather/{location}")
async def get_weather(location: str):
    lat, lon = get_location_coordinates(location)
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=relative_humidity_2m,precipitation,rain,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm&daily=precipitation_sum&timezone=auto"
        response = requests.get(url, timeout=12)
        
        if response.status_code == 200:
            data = response.json()
            curr = data.get("current_weather", {})
            hourly = data.get("hourly", {})
            daily = data.get("daily", {})
            
            # Find the hourly index that matches current weather time
            curr_time = curr.get("time")
            idx = 0
            if curr_time and "time" in hourly:
                times = hourly["time"]
                if curr_time in times:
                    idx = times.index(curr_time)
                else:
                    try:
                        idx = next((i for i, t in enumerate(times) if t.startswith(curr_time[:13])), 0)
                    except StopIteration:
                        pass
            
            temp = curr.get("temperature", 28.0)
            wind_speed = curr.get("windspeed", 5.0)
            weather_code = curr.get("weathercode", 0)
            description = WMO_WEATHER_CODES.get(weather_code, "Overcast")
            
            humidity = 65
            if "relative_humidity_2m" in hourly and len(hourly["relative_humidity_2m"]) > idx:
                humidity = int(hourly["relative_humidity_2m"][idx])
                
            rain_current = 0.0
            if "precipitation" in hourly and len(hourly["precipitation"]) > idx:
                rain_current = float(hourly["precipitation"][idx])
                
            soil_temp = 25.0
            if "soil_temperature_0_to_7cm" in hourly and len(hourly["soil_temperature_0_to_7cm"]) > idx:
                soil_temp = float(hourly["soil_temperature_0_to_7cm"][idx])
                
            soil_moisture = 30.0
            if "soil_moisture_0_to_7cm" in hourly and len(hourly["soil_moisture_0_to_7cm"]) > idx:
                val = float(hourly["soil_moisture_0_to_7cm"][idx])
                if val <= 1.0:
                    soil_moisture = round(val * 100, 1)
                else:
                    soil_moisture = round(val, 1)
            
            today_rain = 0.0
            if "precipitation_sum" in daily and len(daily["precipitation_sum"]) > 0:
                today_rain = float(daily["precipitation_sum"][0])
            
            estimated_annual_rainfall = 1200
            district = get_district_for_taluk(location.split(',')[0].strip()) if ',' in location else get_district_for_taluk(location)
            if district in DISTRICT_BASELINES:
                estimated_annual_rainfall = DISTRICT_BASELINES[district]["avg_rainfall"]
            
            return {
                "temperature": round(temp, 1),
                "humidity": humidity,
                "rainfall": round(estimated_annual_rainfall),
                "rain_today": round(today_rain, 1),
                "rain_current": round(rain_current, 1),
                "soil_temp": round(soil_temp, 1),
                "soil_moisture": round(soil_moisture, 1),
                "description": description,
                "location": location.split(',')[0].strip().title() if ',' in location else location,
                "latitude": lat,
                "longitude": lon,
                "source": "Open-Meteo Weather & Soil API"
            }
        else:
            print(f"Open-Meteo API returned {response.status_code}: {response.text}")
            return generate_mock_weather_for_coords(location, lat, lon)
    except Exception as e:
        print(f"Weather fetch error: {e}")
        return generate_mock_weather_for_coords(location, lat, lon)

def generate_mock_weather_for_coords(location: str, lat: float, lon: float):
    res = generate_mock_weather(location)
    res["latitude"] = lat
    res["longitude"] = lon
    res["soil_temp"] = round(res["temperature"] - 2.5, 1)
    res["soil_moisture"] = round(30 + (res["humidity"] * 0.2), 1)
    res["rain_today"] = round(res["rain_current"] * 4.5, 1)
    res["source"] = "Simulated Live Parameters (Open-Meteo offline)"
    return res

def generate_mock_weather(location: str):
    """Generate realistic mock weather based on district/taluk baselines."""
    district = get_district_for_taluk(location)
    baseline = DISTRICT_BASELINES.get(district, {
        "ph": 6.5, "soil_type": "Red Sandy", 
        "avg_temp": 26.5, "avg_humidity": 65, "avg_rainfall": 800
    })
    
    import hashlib
    h = int(hashlib.md5(location.lower().encode()).hexdigest(), 16)
    temp_var = ((h % 5) - 2) * 0.5 # -1C to +1C
    humidity_var = ((h % 7) - 3) # -3% to +3%
    rainfall_var = ((h % 11) - 5) * 10 # -50mm to +50mm
    
    temp = baseline["avg_temp"] + temp_var
    humidity = baseline["avg_humidity"] + humidity_var
    rainfall = baseline["avg_rainfall"] + rainfall_var
    
    conditions = ["Clear Skies", "Scattered Clouds", "Mostly Cloudy", "Light Rain", "Dry & Sunny", "Humid & Cloudy", "Overcast", "Mist"]
    if rainfall > 2000:
        conditions = ["Light Rain", "Heavy Rain", "Humid & Cloudy", "Overcast"]
    elif rainfall < 700:
        conditions = ["Dry & Sunny", "Clear Skies", "Scattered Clouds"]
        
    condition = conditions[h % len(conditions)]
    
    return {
        "temperature": round(temp, 1),
        "humidity": int(humidity),
        "rainfall": round(max(100, rainfall)),
        "rain_current": 1.2 if "Rain" in condition else 0.0,
        "description": condition,
        "location": location,
        "source": "fallback"
    }

@app.get("/bhoomi/land-map")
async def get_bhoomi_land_map(
    taluk: str,
    hobli: Optional[str] = None,
    survey_number: Optional[str] = None,
    user_name: Optional[str] = "You",
    user_acres: Optional[float] = 2.0,
    user_guntas: Optional[float] = 0.0,
    user_crop: Optional[str] = "Rice",
    lat: Optional[float] = None,
    lon: Optional[float] = None
):
    """Generate a mock Bhoomi cadastral map centered on the farmer's land."""
    # Resolve center coordinates
    center_lat, center_lon = 12.9141, 74.8560
    if lat is not None and lon is not None:
        center_lat = lat
        center_lon = lon
    elif hobli and hobli in HOBLI_COORDS:
        center_lat, center_lon = HOBLI_COORDS[hobli]
    else:
        center_lat, center_lon = get_location_coordinates(taluk)
        
    # Standardize survey number
    user_survey = survey_number or "120"
    user_survey_clean = user_survey.strip().upper()
    
    # Generate a 3x3 grid of adjacent land parcels
    spacing = 0.0012
    width = 0.0010
    
    parcels = []
    first_names = [
        "Ramesh", "Suresh", "Manjunath", "Ganesh", "Shekhar", "Kempe", "Ananda", "Basavaraj", 
        "Nagaraj", "Sharanappa", "Venkatesh", "Kumar", "Rahul", "Sathish", "Padma", "Parvathi", 
        "Gopal", "Ashok", "Kavitha", "Keshav", "Anil", "Praveen", "Pradeep", "Mahesh", 
        "Santosh", "Sunil", "Shiva", "Vijay", "Ajay", "Ravi", "Ravindra", "Chandrashekhar", 
        "Mahadev", "Sidda", "Siddaraju", "Raju", "Somanna", "Ningappa", "Mallappa", "Hanumanth", 
        "Lakshman", "Ram", "Krishna", "Somesh", "Harish", "Devendra", "Kiran", "Rohit", 
        "Sachin", "Deepak", "Naveen", "Lokesh", "Prashanth", "Pooja", "Radha", "Suma", "Lakshmi",
        "Jayaram", "Narayana", "Manoj", "Sharada", "Pushpa", "Usha", "Geetha", "Renuka",
        "Anitha", "Kamala", "Bhoomi", "Roopa", "Shwetha", "Divya", "Sangeetha", "Prema",
        "Basappa", "Eshwar", "Yogesh", "Vasant", "Govinda", "Dhananjaya", "Raghavendra", "Sudhir",
        "Giridhara", "Balaram", "Muniyappa", "Shankar", "Shivananda", "Gururaj", "Chidanand", "Vittal",
        "Jagadish", "Vidyadhar", "Panduranga", "Madhav", "Mukund", "Dayanand", "Srikant", "Babu",
        "Subhash", "Thippeswamy", "Chennappa", "Bhyrappa", "Doddanagouda", "Girish", "Bheema", "Yallappa"
    ]
    last_names = [
        "Gowda", "Patil", "Bhat", "Hegde", "Naik", "Nayak", "Pujari", "Poojary", "Reddy", 
        "Shetty", "Kulkarni", "Pinto", "Kotian", "Kamath", "Acharya", "Salian", "Castelino", 
        "Moras", "Rao", "Devadiga", "Mendonca", "Alva", "Bhandary", "Suvarna", "Barke", 
        "Kunder", "Amin", "Banga", "Karkera", "Shinde", "Deshmukh", "Joshi", "Prabhu",
        "Shenoy", "Bairy", "Bangera", "Sequeira", "Fernandes", "Marla", "Ballal",
        "Mani", "Somayaji", "Adiga", "Hebbar", "Holla", "Udupa", "Karanth", "Kavoor",
        "Gatti", "Madivala", "Kulal", "Billava", "Kharvi", "Moger", "Bunt", "Maratha",
        "Chavan", "Jadhav", "More", "Ghatage", "Biradar", "Inamdar", "Nadiger", "Angadi",
        "Hiremath", "Pattar", "Badiger", "Kambar", "Sunagar", "Metri", "Tahasildar"
    ]

    kannada_first = {
        "Ramesh": "ರಮೇಶ್", "Suresh": "ಸುರೇಶ್", "Manjunath": "ಮಂಜುನಾಥ್", "Ganesh": "ಗಣೇಶ್", 
        "Shekhar": "ಶೇಖರ್", "Kempe": "ಕೆಂಪೇ", "Ananda": "ಆನಂದ್", "Basavaraj": "ಬಸವರಾಜ್", 
        "Nagaraj": "ನಾಗರಾಜ್", "Sharanappa": "ಶರಣಪ್ಪ", "Venkatesh": "ವೆಂಕಟೇಶ್", "Kumar": "ಕುಮಾರ್",
        "Rahul": "ರಾಹುಲ್", "Sathish": "ಸತೀಶ್", "Padma": "ಪದ್ಮಾ", "Parvathi": "ಪಾರ್ವತಿ", 
        "Gopal": "ಗೋಪಾಲ್", "Ashok": "ಅಶೋಕ್", "Kavitha": "ಕವಿತಾ", "Keshav": "ಕೇಶವ್", "Anil": "ಅನಿಲ್",
        "Praveen": "ಪ್ರವೀಣ್", "Pradeep": "ಪ್ರದೀಪ್", "Mahesh": "ಮಹೇಶ್", "Santosh": "ಸಂತೋಷ್",
        "Sunil": "ಸುನಿಲ್", "Shiva": "ಶಿವ", "Vijay": "ವಿಜಯ್", "Ajay": "ಅಜಯ್", "Ravi": "ರವಿ",
        "Ravindra": "ರವೀಂದ್ರ", "Chandrashekhar": "ಚಂದ್ರಶೇಖರ್", "Mahadev": "ಮಹಾದೇವ", "Sidda": "ಸಿದ್ದ",
        "Siddaraju": "ಸಿದ್ದರಾಜು", "Raju": "ರಾಜು", "Somanna": "ಸೋಮಣ್ಣ", "Ningappa": "ನಿಂಗಪ್ಪ",
        "Mallappa": "ಮಲ್ಲಪ್ಪ", "Hanumanth": "ಹನುಮಂತ", "Lakshman": "ಲಕ್ಷ್ಮಣ", "Ram": "ರಾಮ್",
        "Krishna": "ಕೃಷ್ಣ", "Somesh": "ಸೋಮೇಶ್", "Harish": "ಹರೀಶ್", "Devendra": "ದೇವೇಂದ್ರ",
        "Kiran": "ಕಿರಣ್", "Rohit": "ರೋಹಿತ್", "Sachin": "ಸಚಿನ್", "Deepak": "ದೀಪಕ್",
        "Naveen": "ನವೀನ್", "Lokesh": "ಲೋಕೇಶ್", "Prashanth": "ಪ್ರಶಾಂತ್", "Pooja": "ಪೂಜಾ",
        "Radha": "ರಾಧಾ", "Suma": "ಸುಮಾ", "Lakshmi": "ಲಕ್ಷ್ಮಿ",
        "Jayaram": "ಜಯರಾಮ್", "Narayana": "ನಾರಾಯಣ", "Manoj": "ಮನೋಜ್", "Sharada": "ಶಾರದಾ", 
        "Pushpa": "ಪುಷ್ಪ", "Usha": "ಉಷಾ", "Geetha": "ಗೀತಾ", "Renuka": "ರೇಣುಕಾ",
        "Anitha": "ಅನಿತಾ", "Kamala": "ಕಮಲಾ", "Bhoomi": "ಭೂಮಿ", "Roopa": "ರೂಪಾ", 
        "Shwetha": "ಶ್ವೇತಾ", "Divya": "ದಿವ್ಯಾ", "Sangeetha": "ಸಂಗೀತಾ", "Prema": "ಪ್ರೇಮಾ",
        "Basappa": "ಬಸಪ್ಪ", "Eshwar": "ಈಶ್ವರ್", "Yogesh": "ಯೋಗೇಶ್", "Vasant": "ವಸಂತ್", 
        "Govinda": "ಗೋವಿಂದ", "Dhananjaya": "ಧನಂಜಯ", "Raghavendra": "ರಾಘವೇಂದ್ರ", "Sudhir": "ಸುಧೀರ್",
        "Giridhara": "ಗಿರಿಧರ", "Balaram": "ಬಲರಾಮ್", "Muniyappa": "ಮುನಿಯಪ್ಪ", "Shankar": "ಶಂಕರ್", 
        "Shivananda": "ಶಿವಾನಂದ", "Gururaj": "ಗುರುರಾಜ್", "Chidanand": "ಚಿದಾನಂದ", "Vittal": "ವಿಠ್ಠಲ್",
        "Jagadish": "ಜಗದೀಶ್", "Vidyadhar": "ವಿದ್ಯಾಧರ್", "Panduranga": "ಪಾಂಡುರಂಗ", "Madhav": "ಮಾಧವ್", 
        "Mukund": "ಮುಕುಂದ್", "Dayanand": "ದಯಾನಂದ", "Srikant": "ಶ್ರೀಕಾಂತ್", "Babu": "ಬಾಬು",
        "Subhash": "ಸುಭಾಷ್", "Thippeswamy": "ತಿಪ್ಪೇಸ್ವಾಮಿ", "Chennappa": "ಚೆನ್ನಪ್ಪ", "Bhyrappa": "ಭೈರಪ್ಪ", 
        "Doddanagouda": "ದೊಡ್ಡನಗೌಡ", "Girish": "ಗಿರೀಶ್", "Bheema": "ಭೀಮ", "Yallappa": "ಯಲ್ಲಪ್ಪ"
    }
    kannada_last = {
        "Gowda": "ಗೌಡ", "Patil": "ಪಾಟೀಲ್", "Bhat": "ಭಟ್", "Hegde": "ಹೆಗಡೆ", "Naik": "ನಾಯ್ಕ್", 
        "Nayak": "ನಾಯಕ್", "Pujari": "ಪೂಜಾರಿ", "Poojary": "ಪೂಜಾರಿ", "Reddy": "ರೆಡ್ಡಿ", 
        "Shetty": "ಶೆಟ್ಟಿ", "Kulkarni": "ಕುಲಕರ್ಣಿ", "Pinto": "ಪಿಂಟೋ", "Kotian": "ಕೋಟ್ಯಾನ್",
        "Kamath": "ಕಾಮತ್", "Acharya": "ಆಚಾರ್ಯ", "Salian": "ಸಾಲ್ಯಾನ್", "Castelino": "ಕ್ಯಾಸ್ಟೆಲಿನೊ",
        "Moras": "ಮೊರಾಸ್", "Rao": "ರಾವ್", "Devadiga": "ದೇವಾಡಿಗ", "Mendonca": "ಮೆಂಡೋನ್ಸಾ",
        "Alva": "ಆಳ್ವ", "Bhandary": "ಭಂಡಾರಿ", "Suvarna": "ಸುವರ್ಣ", "Barke": "ಬಾರ್ಕೆ",
        "Kunder": "ಕುಂದರ್", "Amin": "ಅಮೀನ್", "Banga": "ಬಂಗಾ", "Karkera": "ಕರ್ಕೇರ",
        "Shinde": "ಶಿಂಧೆ", "Deshmukh": "ದೇಶ್ಮುಖ್", "Joshi": "ಜೋಷಿ", "Prabhu": "ಪ್ರಭು",
        "Shenoy": "ಶೆಣೈ", "Bairy": "ಬೈರಿ", "Bangera": "ಬಂಗೇರ", "Sequeira": "ಸಿಕ್ವೇರಾ",
        "Fernandes": "ಫರ್ನಾಂಡಿಸ್", "Marla": "ಮಾರ್ಲ", "Ballal": "ಬಲ್ಲಾಳ್",
        "Mani": "ಮಣಿ", "Somayaji": "ಸೋಮಯಾಜಿ", "Adiga": "ಅಡಿಗ", "Hebbar": "ಹೆಬ್ಬಾರ್",
        "Holla": "ಹೊಳ್ಳ", "Udupa": "ಉಡುಪ", "Karanth": "ಕಾರಂತ್", "Kavoor": "ಕಾವೂರು",
        "Gatti": "ಗಟ್ಟಿ", "Madivala": "ಮಡಿವಾಳ", "Kulal": "ಕುಲಾಲ್", "Billava": "ಬಿಲ್ಲವ",
        "Kharvi": "ಖಾರ್ವಿ", "Moger": "ಮೊಗೇರ", "Bunt": "ಬಂಟ್", "Maratha": "ಮರಾಠಾ",
        "Chavan": "ಚವಾಣ್", "Jadhav": "ಜಾಧವ್", "More": "ಮೋರೆ", "Ghatage": "ಘಾಟ್ಗೆ",
        "Biradar": "ಬಿರಾದಾರ್", "Inamdar": "ಇನಾಮ್ದಾರ್", "Nadiger": "ನಾಡೀಗೇರ್", "Angadi": "ಅಂಗಡಿ",
        "Hiremath": "ಹಿರೇಮಠ್", "Pattar": "ಪಟ್ಟಾರ್", "Badiger": "ಬಡಿಗೇರ್", "Kambar": "ಕಂಬಾರ್",
        "Sunagar": "ಸುಣಗಾರ್", "Metri": "ಮೇತ್ರಿ", "Tahasildar": "ತಹಶೀಲ್ದಾರ್"
    }

    import re
    import hashlib

    m_survey = re.search(r'\d+', user_survey_clean)
    survey_base = int(m_survey.group()) if m_survey else (abs(int(hashlib.md5(user_survey_clean.encode()).hexdigest(), 16)) % 800 + 50)

    # Adjoining RTC plot base offsets for the 8 adjacent directions
    adjacent_offsets = {
        (-1, -1): (survey_base - 1, 1),
        (-1,  0): (survey_base - 1, 2),
        (-1,  1): (survey_base, 1),
        ( 0, -1): (survey_base, 2),
        ( 0,  1): (survey_base, 3),
        ( 1, -1): (survey_base + 1, 1),
        ( 1,  0): (survey_base + 1, 2),
        ( 1,  1): (survey_base + 2, 1),
    }

    used_survey_numbers = {user_survey_clean}
    used_farmer_names = set()
    used_first_names = set()
    used_last_names = set()

    # Check if the user survey or name matches a registered record in MySQL Workbench
    db_matched_farmer = None
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        p = "%s" if db_type == "mysql" else "?"
        cursor.execute(
            f"SELECT id, name, survey_number, phone_number, state, district, taluk, hobli, land_area_acres, land_area_guntas, primary_crop, soil_type FROM farmers WHERE UPPER(TRIM(survey_number)) = {p} OR (name != '' AND LOWER(TRIM(name)) = {p})",
            (user_survey_clean, (user_name or "").strip().lower())
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            db_matched_farmer = {
                "id": row[0], "name": row[1], "survey_number": row[2], "phone": row[3],
                "state": row[4], "district": row[5], "taluk": row[6], "hobli": row[7],
                "acres": float(row[8] or 0.0), "guntas": float(row[9] or 0.0),
                "primary_crop": row[10] or user_crop or "Rice",
                "soil_type": row[11] or DISTRICT_BASELINES.get(district, {}).get("soil_type", "Laterite Soil")
            }
    except Exception as dbe:
        print(f"Bhoomi map DB lookup notice: {dbe}")

    # Check if the user survey matches an authentic record in mangaluru_farmer_details.csv
    csv_matched_user = None
    if not db_matched_farmer and os.path.exists(FARMER_DETAILS_FILE):
        try:
            with open(FARMER_DETAILS_FILE, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get('Survey_Number', '').strip().upper() == user_survey_clean:
                        csv_matched_user = row
                        break
        except Exception:
            pass

    resolved_user_name = (db_matched_farmer.get("name") if db_matched_farmer else None) or (csv_matched_user.get("Farmer_Name") if csv_matched_user else None) or user_name or "You"

    if resolved_user_name and resolved_user_name.strip().lower() != "you":
        u_clean = resolved_user_name.strip().lower()
        used_farmer_names.add(u_clean)
        u_parts = u_clean.split()
        if u_parts:
            used_first_names.add(u_parts[0])
            if len(u_parts) > 1:
                used_last_names.add(u_parts[-1])

    # Distinct random seed specific to this taluk, hobli, and user plot/survey number
    survey_seed = int(hashlib.sha256(f"{taluk}_{hobli or ''}_{user_survey_clean}".encode()).hexdigest(), 16)
    rng = random.Random(survey_seed)

    # Shuffle candidates deterministically based on the given plot/survey number
    cand_firsts = [f for f in first_names if f.lower() not in used_first_names]
    cand_lasts = [l for l in last_names if l.lower() not in used_last_names]
    rng.shuffle(cand_firsts)
    rng.shuffle(cand_lasts)

    # Deprioritize recently used farmers across previous searches so changing plot/survey gives completely new farmers
    recent_set = set(RECENT_SURVEY_FARMERS)
    cand_firsts.sort(key=lambda x: x.lower() in recent_set)
    cand_lasts.sort(key=lambda x: x.lower() in recent_set)

    # Pre-select 8 completely unique neighbours (no repeating first names, no repeating last names, no repeating full names)
    pre_assigned_neighbours = []
    f_ptr = 0
    l_ptr = 0
    while len(pre_assigned_neighbours) < 8 and f_ptr < len(cand_firsts) and l_ptr < len(cand_lasts):
        fn = cand_firsts[f_ptr]
        ln = cand_lasts[l_ptr]
        full_n = f"{fn} {ln}"
        f_ptr += 1
        l_ptr += 1
        if full_n.lower() not in used_farmer_names and fn.lower() not in used_first_names and ln.lower() not in used_last_names:
            used_farmer_names.add(full_n.lower())
            used_first_names.add(fn.lower())
            used_last_names.add(ln.lower())
            pre_assigned_neighbours.append({
                "fname": fn,
                "lname": ln,
                "full": full_n,
                "full_kn": f"{kannada_first.get(fn, fn)} {kannada_last.get(ln, ln)}"
            })

    # Fallback to satisfy 8 neighbours if needed
    attempt_fill = 0
    while len(pre_assigned_neighbours) < 8 and attempt_fill < len(first_names):
        fn = first_names[(survey_seed + attempt_fill * 13) % len(first_names)]
        ln = last_names[(survey_seed + attempt_fill * 17) % len(last_names)]
        full_n = f"{fn} {ln}"
        attempt_fill += 1
        if full_n.lower() not in used_farmer_names and fn.lower() not in used_first_names:
            used_farmer_names.add(full_n.lower())
            used_first_names.add(fn.lower())
            pre_assigned_neighbours.append({
                "fname": fn,
                "lname": ln,
                "full": full_n,
                "full_kn": f"{kannada_first.get(fn, fn)} {kannada_last.get(ln, ln)}"
            })

    # Cache assigned names in history to ensure the next new plot/survey query receives fresh farmers
    for nb in pre_assigned_neighbours:
        RECENT_SURVEY_FARMERS.append(nb["full"].lower())
        RECENT_SURVEY_FARMERS.append(nb["fname"].lower())
    
    district = get_district_for_taluk(taluk) or "Dakshina Kannada"
    coastal_districts = ["Dakshina Kannada", "Udupi", "Uttara Kannada"]
    malnad_districts = ["Chikkamagaluru", "Kodagu", "Hassan", "Shivamogga"]
    northern_districts = ["Bagalkot", "Ballari", "Belagavi", "Bidar", "Chitradurga", "Davanagere", "Dharwad", "Gadag", "Haveri", "Kalaburagi", "Koppal", "Raichur", "Vijayanagara", "Vijayapura", "Yadgir"]
    
    if district in coastal_districts:
        crops = ["Rice", "Banana", "Arecanut", "Pepper", "Cashew", "Coconut"]
    elif district in malnad_districts:
        crops = ["Coffee", "Cardamom", "Ginger", "Pepper", "Banana"]
    elif district in northern_districts:
        crops = ["Jowar", "Cotton", "Maize", "Bengal Gram", "Red Gram", "Wheat"]
    else:
        crops = ["Ragi", "Maize", "Groundnut", "Sugarcane", "Tomato", "Mango"]

    nb_index = 0
    
    for r in [-1, 0, 1]:
        for c in [-1, 0, 1]:
            is_user = (r == 0 and c == 0)
            cell_key = f"{taluk}_{hobli or ''}_{user_survey_clean}_{r}_{c}"
            h_val = int(hashlib.md5(cell_key.encode()).hexdigest(), 16)
            
            lat_c = center_lat + r * spacing
            lon_c = center_lon + c * spacing
            
            lat_min = lat_c - width / 2.0
            lat_max = lat_c + width / 2.0
            lon_min = lon_c - width / 2.0
            lon_max = lon_c + width / 2.0
            
            # Deterministically perturb the corners of the polygon based on h_val
            p_scale = 0.00012
            p_lat_min = lat_min + (((h_val & 0xFF) % 7) - 3) * (p_scale / 6.0)
            p_lat_max = lat_max + ((((h_val >> 8) & 0xFF) % 7) - 3) * (p_scale / 6.0)
            p_lon_min = lon_min + ((((h_val >> 16) & 0xFF) % 7) - 3) * (p_scale / 6.0)
            p_lon_max = lon_max + ((((h_val >> 24) & 0xFF) % 7) - 3) * (p_scale / 6.0)
            
            polygon = [
                [p_lat_min, p_lon_min],
                [p_lat_max, p_lon_min + (((h_val >> 4) & 0x03) - 1) * 0.00003],
                [p_lat_max + (((h_val >> 12) & 0x03) - 1) * 0.00003, p_lon_max],
                [p_lat_min, p_lon_max + (((h_val >> 20) & 0x03) - 1) * 0.00003]
            ]
            
            recommended_crops = []
            suggested_work = ""
            suggested_work_kn = ""
            is_empty = False

            if is_user:
                s_num = user_survey_clean
                owner = resolved_user_name
                if owner and owner.strip().lower() == "rahul":
                    owner_kn = "ರಾಹುಲ್"
                elif owner and owner.strip() in kannada_first:
                    owner_kn = kannada_first[owner.strip()]
                elif owner and " " in owner.strip():
                    parts = owner.strip().split()
                    owner_kn = f"{kannada_first.get(parts[0], parts[0])} {kannada_last.get(parts[-1], parts[-1])}"
                else:
                    owner_kn = "ನೀವು"

                if db_matched_farmer:
                    acres = float(db_matched_farmer["acres"] or user_acres or 2.0)
                    guntas = float(db_matched_farmer["guntas"] or user_guntas or 0.0)
                    crop = db_matched_farmer["primary_crop"] or user_crop or "Rice"
                    soil = db_matched_farmer["soil_type"] or DISTRICT_BASELINES.get(district, {}).get("soil_type", "Red Sandy")
                elif csv_matched_user:
                    acres = float(csv_matched_user.get("Total_Land_Acres", user_acres or 2.0))
                    guntas = float(csv_matched_user.get("Total_Land_Guntas", user_guntas or 0.0))
                    crop = csv_matched_user.get("Primary_Crop", user_crop or "Rice")
                    soil = csv_matched_user.get("Soil_Type", DISTRICT_BASELINES.get(district, {}).get("soil_type", "Red Sandy"))
                else:
                    acres = user_acres or 2.0
                    guntas = user_guntas or 0.0
                    crop = user_crop or "Rice"
                    soil = DISTRICT_BASELINES.get(district, {}).get("soil_type", "Red Sandy")

                l_type = "Wet" if crop in ["Rice", "Sugarcane"] else "Garden" if crop in ["Arecanut", "Coconut", "Coffee"] else "Dry"
                l_type_kn = "ತರಿ (Wet)" if l_type == "Wet" else "ಬಾಗಾಯ್ತು (Garden)" if l_type == "Garden" else "ಖುಷ್ಕಿ (Dry)"
            else:
                base_cand, sub_cand = adjacent_offsets.get((r, c), (survey_base + r * 2 + c, 1))
                s_num = f"{base_cand}/{sub_cand}"
                while s_num in used_survey_numbers:
                    sub_cand += 1
                    s_num = f"{base_cand}/{sub_cand}"
                used_survey_numbers.add(s_num)

                # Assign pre-selected completely unique non-repeated farmer
                assigned_nb = pre_assigned_neighbours[nb_index % len(pre_assigned_neighbours)]
                nb_index += 1
                owner = assigned_nb["full"]
                owner_kn = assigned_nb["full_kn"]

                is_empty = (h_val % 4 == 0)
                
                if is_empty:
                    crop = "Empty Land (Fallow)"
                    l_type = "Dry"
                    l_type_kn = "ಖುಷ್ಕಿ (Dry)"
                    soil = DISTRICT_BASELINES.get(district, {}).get("soil_type", "Laterite")
                else:
                    crop = crops[h_val % len(crops)]
                    l_type = "Wet" if crop in ["Rice", "Sugarcane"] else "Garden" if crop in ["Arecanut", "Coconut", "Coffee"] else "Dry"
                    l_type_kn = "ತರಿ (Wet)" if l_type == "Wet" else "ಬಾಗಾಯ್ತು (Garden)" if l_type == "Garden" else "ಖುಷ್ಕಿ (Dry)"
                    soil = DISTRICT_BASELINES.get(district, {}).get("soil_type", "Laterite")
                
                acres = 1 + (h_val % 4)
                guntas = (h_val >> 2) % 40

            # Calculate recommendations & suggested work for all parcels (user, empty, or neighbour)
            baseline = DISTRICT_BASELINES.get(district, {"soil_type": "Laterite", "ph": 6.2, "avg_temp": 28.0, "avg_humidity": 85, "avg_rainfall": 3500})
            rec_list = get_recommendations_from_csv(baseline["ph"], baseline["avg_temp"], baseline["avg_rainfall"], baseline["avg_humidity"], district=district, soil_type=soil)
            recommended_crops = rec_list[:3]  # Top 3 suggestions
            
            # Add detailed agricultural development work suggestions based on soil type
            work_suggestions = {
                "Laterite": (
                    "Soil conservation, deep plowing before monsoon, planting cashew/pepper/rubber, and application of organic compost & lime to adjust pH.",
                    "ಮಣ್ಣು ಸಂರಕ್ಷಣೆ, ಮುಂಗಾರಿಗೆ ಮುನ್ನ ಆಳವಾದ ಉಳುಮೆ, ಗೋಡಂಬಿ/ಕಾಳುಮೆಣಸು/ರಬ್ಬರ್ ನೆಡುವುದು, ಮಣ್ಣಿನ ಆಮ್ಲೀಯತೆ ಸರಿಪಡಿಸಲು ಸಾವಯವ ಗೊಬ್ಬರ ಮತ್ತು ಸುಣ್ಣದ ಬಳಕೆ."
                ),
                "Red Sandy": (
                    "Drip irrigation setup, green manuring, crop rotation with legumes to improve soil nitrogen, and mulching to prevent moisture loss.",
                    "ಹನಿ ನೀರಾವರಿ ಅಳವಡಿಕೆ, ಹಸಿರು ಎಲೆ ಗೊಬ್ಬರ ಬಳಕೆ, ಮಣ್ಣಿನ ಸಾರಜನಕ ಹೆಚ್ಚಿಸಲು ದ್ವಿದಳ ಧಾನ್ಯಗಳೊಂದಿಗೆ ಬೆಳೆ ಸರದಿ, ತೇವಾಂಶ ತಡೆಯಲು ಹೊದಿಕೆ (Mulching) ವಿಧಾನ."
                ),
                "Black Cotton": (
                    "Constructing drainage channels to prevent waterlogging, soil aeration, gypsum application, and crop rotation with cotton or gram.",
                    "ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿದುಹೋಗುವ ಚರಂಡಿ ನಿರ್ಮಾಣ, ಮಣ್ಣಿನ ವಾತಾಯನ ಕ್ರಿಯೆ, ಜಿಪ್ಸಮ್ ಬಳಕೆ, ಹತ್ತಿ ಅಥವಾ ಕಡಲೆಯೊಂದಿಗೆ ಬೆಳೆ ಸರದಿ."
                ),
                "Red Clayey": (
                    "Adding organic compost to improve soil texture, contour bunding to prevent erosion, planting fruits like banana/mango, and deep drainage.",
                    "ಮಣ್ಣಿನ ವಿನ್ಯಾಸ ಸುಧಾರಿಸಲು ಸಾವಯವ ಗೊಬ್ಬರ ಸೇರಿಸುವುದು, ಮಣ್ಣಿನ ಸವಕಳಿ ತಡೆಯಲು ಸಮಪಾತಳಿ ಬದು ನಿರ್ಮಾಣ, ಬಾಳೆ/ಮಾವಿನ ಹಣ್ಣಿನ ಗಿಡ ನೆಡುವುದು, ಬಸಿಕಾಲುವೆ ನಿರ್ಮಾಣ."
                )
            }
            work_en, work_kn = work_suggestions.get(soil, (
                "Organic composting, terracing, contour bunding to prevent soil erosion, and crop rotation.",
                "ಸಾವಯವ ಗೊಬ್ಬರ ತಯಾರಿಕೆ, ತಟ್ಟಿ ಹಂತದ ಕೃಷಿ, ಮಣ್ಣಿನ ಸವಕಳಿ ತಡೆಯಲು ಸಮಪಾತಳಿ ಬದು ನಿರ್ಮಾಣ ಮತ್ತು ಬೆಳೆ ಸರದಿ."
            ))
            suggested_work = work_en
            suggested_work_kn = work_kn
            
            crop_kn_map = {
                "Rice": "ಅಕ್ಕಿ (ಭತ್ತ)", "Banana": "ಬಾಳೆಹಣ್ಣು", "Arecanut": "ಅಡಿಕೆ", "Pepper": "ಕಾಳುಮೆಣಸು", 
                "Cashew": "ಗೋಡಂಬಿ", "Rubber": "ರಬ್ಬರ್", "Coconut": "ತೆಂಗಿನಕಾಯಿ", "Coffee": "ಕಾಫಿ", 
                "Cardamom": "ಏಲಕ್ಕಿ", "Ginger": "ಶುಂಠಿ", "Jowar": "ಜೋಳ", "Cotton": "ಹತ್ತಿ", 
                "Maize": "ಮೆಕ್ಕೆಜೋಳ", "Bengal Gram": "ಕಡಲೆ", "Red Gram": "ತೊಗರಿ", "Wheat": "ಗೋಧಿ", 
                "Pomegranate": "ದಾಳಿಂಬೆ", "Ragi": "ರಾಗಿ", "Groundnut": "ಶೇಂಗಾ", "Sugarcane": "ಕಬ್ಬು", 
                "Tomato": "ಟೊಮೆಟೊ", "Mango": "ಮಾವಿನಹಣ್ಣು", "Fallow": "ಬೀಳು ಜಮೀನು (ಖಾಲಿ)"
            }
            crop_kn = crop_kn_map.get(crop, crop)
            
            soil_kn_map = {
                "Laterite": "ಲ್ಯಾಟರೈಟ್ (ಕೆಂಪು ಜೇಡಿ ಮಣ್ಣು)", "Red Sandy": "ಕೆಂಪು ಉಸುಕು ಮಣ್ಣು", 
                "Red Loam": "ಕೆಂಪು ಲೋಮ್ ಮಣ್ಣು", "Black Cotton": "ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು", 
                "Mixed Red & Black": "ಕೆಂಪು ಮತ್ತು ಕಪ್ಪು ಮಿಶ್ರಿತ ಮಣ್ಣು", "Black Clayey": "ಕಪ್ಪು ಜೇಡಿ ಮಣ್ಣು",
                "Red Clayey": "ಕೆಂಪು ಜೇಡಿ ಮಣ್ಣು", "Red Loamy": "ಕೆಂಪು ಲೋಮಿ ಮಣ್ಣು"
            }
            soil_kn = soil_kn_map.get(soil, soil)
            
            parcels.append({
                "survey_number": s_num,
                "owner_name": owner,
                "owner_name_kn": owner_kn,
                "land_acres": int(acres),
                "land_guntas": int(guntas),
                "land_type": l_type,
                "land_type_kn": l_type_kn,
                "soil_type": soil,
                "soil_type_kn": soil_kn,
                "crop_grown": crop,
                "crop_grown_kn": crop_kn,
                "is_user": is_user,
                "is_empty": is_empty,
                "recommended_crops": recommended_crops,
                "suggested_work": suggested_work,
                "suggested_work_kn": suggested_work_kn,
                "polygon": polygon
            })
            
    return {
        "center": [center_lat, center_lon],
        "parcels": parcels,
        "taluk": taluk,
        "hobli": hobli or f"{taluk} Kasaba Hobli",
        "district": district
    }

@app.get("/recommendations/{taluk}")
async def get_recommendations(
    taluk: str,
    ph: Optional[float] = Query(None, description="Soil pH value"),
    temp: Optional[float] = Query(None, description="Temperature in Celsius"),
    rainfall: Optional[float] = Query(None, description="Rainfall in mm"),
    humidity: Optional[float] = Query(None, description="Humidity in %")
):
    data = load_data()
    market_prices = data.get("market_prices", [])
    
    price_map = {item["crop"]: item for item in market_prices}
    
    # Map taluk to district to retrieve localized baseline parameters
    district = get_district_for_taluk(taluk)
    baseline = DISTRICT_BASELINES.get(district, {"soil_type": "Laterite", "ph": 6.2, "avg_temp": 28.0, "avg_humidity": 85, "avg_rainfall": 3500})
    
    final_ph = ph if ph is not None else baseline["ph"]
    final_temp = temp if temp is not None else baseline["avg_temp"]
    final_rainfall = rainfall if rainfall is not None else baseline["avg_rainfall"]
    final_humidity = humidity if humidity is not None else baseline["avg_humidity"]
    soil_type = baseline["soil_type"]
    
    # Find matching crops strictly suited to this region and parameters
    crop_names = get_recommendations_from_csv(final_ph, final_temp, final_rainfall, humidity=final_humidity, district=district, taluk=taluk, soil_type=soil_type)
    
    enriched_recommendations = []
    for crop in crop_names:
        price_info = price_map.get(crop, {"crop": crop, "price": "Price on Request", "trend": "stable"})
        species_info = get_crop_species_info(
            crop,
            ph=final_ph,
            temp=final_temp,
            rainfall=final_rainfall,
            humidity=final_humidity,
            soil_type=soil_type,
            taluk=taluk,
            district=district
        )
        item = dict(price_info)
        if species_info:
            item["unit"] = species_info.get("unit")
            item["botanical_genus"] = species_info.get("botanical_genus")
            item["crop_image"] = species_info.get("crop_image")
            item["varieties_count"] = species_info.get("varieties_count")
            item["price_range"] = species_info.get("price_range", {}).get("display")
            item["varieties"] = species_info.get("varieties", [])
            item["top_varieties"] = species_info.get("varieties", [])[:3]
            item["best_variety"] = species_info.get("varieties", [])[0] if species_info.get("varieties") else None
        else:
            item["varieties"] = []
            item["varieties_count"] = 0
            item["price_range"] = item.get("price")
            item["top_varieties"] = []
            item["best_variety"] = None
        enriched_recommendations.append(item)
            
    return {
        "soil_data": {
            "ph": final_ph,
            "temp": final_temp,
            "rainfall": final_rainfall,
            "soil_type": soil_type,
            "taluk": taluk,
            "district": district
        },
        "recommended_crops": enriched_recommendations
    }

@app.get("/crop-varieties/{crop}")
async def get_crop_varieties(
    crop: str,
    taluk: Optional[str] = Query(None, description="Taluk name for location suitability"),
    district: Optional[str] = Query(None, description="District name"),
    ph: Optional[float] = Query(None, description="Soil pH value"),
    temp: Optional[float] = Query(None, description="Temperature in Celsius"),
    rainfall: Optional[float] = Query(None, description="Rainfall in mm"),
    humidity: Optional[float] = Query(None, description="Humidity in %"),
    soil_type: Optional[str] = Query(None, description="Soil Type"),
    season: Optional[str] = Query(None, description="Current or target season (Kharif, Rabi, Summer)")
):
    """
    Returns authentic agricultural varieties for a crop, dynamically evaluated and ranked
    based on the farmer's location, soil requirements, climate, growing season, maturity period, and expected yield.
    """
    resolved_district = district
    if taluk and not resolved_district:
        resolved_district = get_district_for_taluk(taluk)

    info = get_crop_species_info(
        crop,
        ph=ph,
        temp=temp,
        rainfall=rainfall,
        humidity=humidity,
        soil_type=soil_type,
        season=season,
        taluk=taluk,
        district=resolved_district
    )
    if not info:
        raise HTTPException(status_code=404, detail=f"Crop '{crop}' not found in catalog. Available: {list(CROP_SPECIES.keys())}")
    return info

@app.get("/crop-species")
async def get_all_crop_species(crop: Optional[str] = Query(None, description="Optional crop name to filter")):
    """Get all crop species and varieties with individual prices, duration, yield, and agronomic characteristics."""
    if crop:
        info = get_crop_species_info(crop)
        if not info:
            raise HTTPException(status_code=404, detail=f"Crop species not found for '{crop}'. Available: {list(CROP_SPECIES.keys())}")
        return info

    result = {}
    for crop_name in CROP_SPECIES:
        result[crop_name] = get_crop_species_info(crop_name)
    return {
        "total_crops": len(CROP_SPECIES),
        "crops": result
    }

@app.get("/crop-species/{crop}")
async def get_crop_species_by_name(crop: str):
    """Get varieties, botanical species, and individual pricing for a particular crop."""
    info = get_crop_species_info(crop)
    if not info:
        raise HTTPException(status_code=404, detail=f"Crop '{crop}' not found in species catalog. Available: {list(CROP_SPECIES.keys())}")
    return info

@app.get("/market-prices")
async def get_market_prices():
    data = load_data()
    return data.get("market_prices", [])

@app.get("/taluk-market-prices")
async def get_taluk_market_prices():
    """Get latest market prices for all crops across all taluks from the history CSV."""
    if not os.path.exists(MARKET_HISTORY_FILE):
        return {"taluks": [], "crops": [], "prices": {}}
    
    try:
        # Read the CSV and get the latest prices (2025, most recent month)
        all_data = {}
        taluks_set = set()
        crops_set = set()
        
        with open(MARKET_HISTORY_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                taluk = row['Taluk']
                crop = row['Crop']
                year = int(row['Year'])
                price = float(row['Price'])
                unit = row['Unit']
                trend = row['Trend']
                
                taluks_set.add(taluk)
                crops_set.add(crop)
                
                key = f"{taluk}_{crop}"
                # Keep only the latest entry (highest year, latest month)
                if key not in all_data or year > all_data[key]['year']:
                    all_data[key] = {
                        "taluk": taluk,
                        "crop": crop,
                        "price": round(price, 2),
                        "unit": unit,
                        "trend": trend,
                        "year": year
                    }
                elif year == all_data[key]['year']:
                    # Same year, update with newer month data
                    all_data[key] = {
                        "taluk": taluk,
                        "crop": crop,
                        "price": round(price, 2),
                        "unit": unit,
                        "trend": trend,
                        "year": year
                    }
        
        # Organize as taluk -> crop -> price
        prices_by_taluk = {}
        for key, data in all_data.items():
            taluk = data["taluk"]
            if taluk not in prices_by_taluk:
                prices_by_taluk[taluk] = {}
            prices_by_taluk[taluk][data["crop"]] = {
                "price": data["price"],
                "unit": data["unit"],
                "trend": data["trend"]
            }
        
        return {
            "taluks": sorted(list(taluks_set)),
            "crops": sorted(list(crops_set)),
            "prices": prices_by_taluk
        }
    except Exception as e:
        print(f"Error reading taluk market prices: {e}")
        return {"taluks": [], "crops": [], "prices": {}}


def fetch_datagov_prices(district_filter: str = None):
    """Fetch live market prices from data.gov.in API."""
    try:
        params = {
            "api-key": DATAGOV_API_KEY,
            "format": "json",
            "limit": "100",
            "filters[state]": "Karnataka",
        }
        if district_filter:
            params["filters[district]"] = district_filter

        response = requests.get(DATAGOV_BASE_URL, params=params, timeout=15)
        if response.status_code == 200:
            data = response.json()
            records = data.get("records", [])
            total = data.get("total", 0)

            # Group by market
            markets = {}
            commodities = set()
            for rec in records:
                market = rec.get("market", "Unknown")
                if market not in markets:
                    markets[market] = []
                commodities.add(rec.get("commodity", ""))
                markets[market].append({
                    "commodity": rec.get("commodity", ""),
                    "variety": rec.get("variety", ""),
                    "grade": rec.get("grade", ""),
                    "min_price": rec.get("min_price", 0),
                    "max_price": rec.get("max_price", 0),
                    "modal_price": rec.get("modal_price", 0),
                    "arrival_date": rec.get("arrival_date", ""),
                })

            return {
                "source": "data.gov.in",
                "total": total,
                "district": district_filter or "All Karnataka",
                "markets": markets,
                "commodities": sorted(list(commodities)),
                "records": [{
                    "market": rec.get("market", ""),
                    "commodity": rec.get("commodity", ""),
                    "variety": rec.get("variety", ""),
                    "grade": rec.get("grade", ""),
                    "min_price": rec.get("min_price", 0),
                    "max_price": rec.get("max_price", 0),
                    "modal_price": rec.get("modal_price", 0),
                    "arrival_date": rec.get("arrival_date", ""),
                } for rec in records],
            }
        else:
            print(f"data.gov.in API returned {response.status_code}")
            return None
    except Exception as e:
        print(f"data.gov.in API error: {e}")
        return None


def generate_fallback_apmc_prices(district: str) -> dict:
    from datetime import date
    import hashlib
    
    today_str = date.today().strftime("%d/%m/%Y")
    
    crops_map = {
        "Coastal": ["Rice", "Banana", "Arecanut", "Pepper", "Cashew", "Coconut"],
        "Malnad": ["Coffee", "Cardamom", "Ginger", "Pepper", "Banana", "Arecanut"],
        "Northern Dry": ["Jowar", "Cotton", "Maize", "Bengal Gram", "Red Gram", "Wheat", "Pomegranate"],
        "Southern Dry": ["Ragi", "Maize", "Groundnut", "Sugarcane", "Tomato", "Mango", "Coconut"]
    }
    
    coastal_districts = ["Dakshina Kannada", "Udupi", "Uttara Kannada"]
    malnad_districts = ["Chikkamagaluru", "Kodagu", "Hassan", "Shivamogga"]
    northern_districts = [
        "Bagalkot", "Ballari", "Belagavi", "Bidar", "Chitradurga", "Davanagere", 
        "Dharwad", "Gadag", "Haveri", "Kalaburagi", "Koppal", "Raichur", 
        "Vijayanagara", "Vijayapura", "Yadgir"
    ]
    
    zone = "Southern Dry"
    if district in coastal_districts:
        zone = "Coastal"
    elif district in malnad_districts:
        zone = "Malnad"
    elif district in northern_districts:
        zone = "Northern Dry"
        
    crops = crops_map[zone]
    
    base_modal_prices = {
        "Rice": 2300, "Banana": 40, "Arecanut": 46000, "Pepper": 600, 
        "Cashew": 120, "Rubber": 180, "Coconut": 35, "Coffee": 250, 
        "Cardamom": 1500, "Ginger": 120, "Jowar": 2900, "Cotton": 6200, 
        "Maize": 2100, "Bengal Gram": 5300, "Red Gram": 7600, "Wheat": 2300, 
        "Pomegranate": 140, "Ragi": 3400, "Groundnut": 6600, "Sugarcane": 310, 
        "Tomato": 32, "Mango": 85
    }
    
    taluks = TALUK_MAP.get(district, [district])
    records = []
    markets = {}
    
    for taluk in taluks[:3]:
        mkt_name = f"{taluk} APMC"
        markets[mkt_name] = []
        for crop in crops:
            modal = base_modal_prices.get(crop, 1500)
            h = int(hashlib.md5(f"{taluk}_{crop}".encode()).hexdigest(), 16)
            var_pct = ((h % 10) - 5) / 100.0 # -5% to +4%
            modal = int(modal * (1.0 + var_pct))
            min_p = int(modal * 0.92)
            max_p = int(modal * 1.06)
            
            rec = {
                "market": mkt_name,
                "commodity": crop,
                "variety": "Local / Common",
                "grade": "FAQ",
                "min_price": min_p,
                "max_price": max_p,
                "modal_price": modal,
                "arrival_date": today_str
            }
            records.append(rec)
            markets[mkt_name].append(rec)
            
    return {
        "source": "Simulated APMC (Fallback)",
        "total": len(records),
        "district": district,
        "markets": markets,
        "commodities": sorted(list(set(crops))),
        "records": records
    }


@app.get("/district-market-prices/{district}")
async def get_district_market_prices(district: str):
    """Get live APMC market prices for a specific district from data.gov.in with local fallbacks."""
    api_district = DISTRICT_API_MAP.get(district, district)
    result = fetch_datagov_prices(api_district)
    
    if result and result.get("records"):
        result["requested_district"] = district
        result["api_district"] = api_district
        return result
        
    fallback_res = generate_fallback_apmc_prices(district)
    fallback_res["requested_district"] = district
    fallback_res["api_district"] = api_district
    return fallback_res


@app.get("/market-prices-live")
async def get_all_live_market_prices():
    """Get all live APMC market prices across Karnataka with fallback support."""
    result = fetch_datagov_prices()
    if result and result.get("records"):
        return result
        
    return generate_fallback_apmc_prices("Dakshina Kannada")


def generate_mock_market_history(crop: str, taluk: str = None) -> list:
    history = []
    base_prices = {
        "Coffee": (240.0, "kg"),
        "Cardamom": (1350.0, "kg"),
        "Ginger": (110.0, "kg"),
        "Jowar": (2700.0, "quintal"),
        "Cotton": (5900.0, "quintal"),
        "Maize": (1850.0, "quintal"),
        "Bengal Gram": (4700.0, "quintal"),
        "Red Gram": (7100.0, "quintal"),
        "Wheat": (2250.0, "quintal"),
        "Pomegranate": (130.0, "kg"),
        "Ragi": (2900.0, "quintal"),
        "Groundnut": (6200.0, "quintal"),
        "Sugarcane": (300.0, "quintal"),
        "Tomato": (28.0, "kg"),
        "Mango": (72.0, "kg"),
    }
    
    base_price, unit = base_prices.get(crop, (1500.0, "quintal"))
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    import hashlib
    h = int(hashlib.md5(crop.encode("utf-8")).hexdigest(), 16)
    
    t_name = taluk or "Karnataka APMC"
    for year in range(2020, 2025):
        year_multiplier = 1.0 + (year - 2020) * 0.05 + ((h % 5) - 2) * 0.01
        for m_idx, month in enumerate(months):
            month_factor = 1.0 + math.sin(m_idx * (math.pi / 6)) * 0.08 + ((h + m_idx) % 7 - 3) * 0.01
            price = round(base_price * year_multiplier * month_factor, 2)
            
            trend = "stable"
            if m_idx > 0:
                prev_factor = 1.0 + math.sin((m_idx - 1) * (math.pi / 6)) * 0.08 + ((h + m_idx - 1) % 7 - 3) * 0.01
                if month_factor > prev_factor + 0.01:
                    trend = "up"
                elif month_factor < prev_factor - 0.01:
                    trend = "down"
            
            history.append({
                "taluk": t_name,
                "crop": crop,
                "year": year,
                "month": month,
                "price": price,
                "unit": unit,
                "trend": trend,
                "Market_Name": f"{t_name} Market"
            })
            
    return history


@app.get("/market-history/{crop}")
async def get_crop_market_history(crop: str, taluk: Optional[str] = Query(None)):
    """Get 5-year price history for a crop, optionally filtered by taluk."""
    history = get_market_history(crop, taluk)
    if not history:
        history = generate_mock_market_history(crop, taluk)
    if not history:
        return {"crop": crop, "history": [], "summary": {}}
    
    # Calculate yearly averages
    yearly_avg = {}
    for entry in history:
        year = entry["year"]
        if year not in yearly_avg:
            yearly_avg[year] = {"total": 0, "count": 0}
        yearly_avg[year]["total"] += entry["price"]
        yearly_avg[year]["count"] += 1
    
    summary = {}
    for year, vals in yearly_avg.items():
        summary[year] = round(vals["total"] / vals["count"], 2)
    
    return {
        "crop": crop,
        "unit": history[0]["unit"] if history else "",
        "history": history[-60:],  # last 60 entries
        "yearly_averages": summary
    }

@app.get("/profit-estimate")
async def estimate_profit(
    crop: str = Query(..., description="Crop name"),
    acres: float = Query(0, description="Land area in acres"),
    guntas: float = Query(0, description="Land area in guntas"),
    survey_number: Optional[str] = Query(None, description="Survey number"),
    variety: Optional[str] = Query(None, description="Specific crop variety/species name")
):
    """Estimate profit for a crop based on land area, using historical data."""
    # Convert guntas to acres if needed (40 guntas = 1 acre)
    total_acres = acres + (guntas / 40.0)
    
    if total_acres <= 0:
        raise HTTPException(status_code=400, detail="Please provide valid land area")
    
    # Get average yield per acre from farmer dataset
    avg_yield = get_avg_yield_for_crop(crop)
    
    # Fallback yields per acre
    fallback_yields = {
        'Rice': 18, 'Arecanut': 8, 'Coconut': 6000,
        'Pepper': 150, 'Cashew': 200, 'Rubber': 500, 'Banana': 2500
    }
    yield_units = {
        'Rice': 'quintal', 'Arecanut': 'quintal', 'Coconut': 'piece',
        'Pepper': 'kg', 'Cashew': 'kg', 'Rubber': 'kg', 'Banana': 'kg'
    }
    
    yield_per_acre = avg_yield if avg_yield else fallback_yields.get(crop, 100)
    unit = yield_units.get(crop, 'kg')
    
    # Check if a specific variety was selected from CROP_SPECIES
    selected_variety = None
    species_info = get_crop_species_info(crop)
    if species_info:
        unit = species_info.get("unit", unit)
        if variety:
            for v in species_info.get("varieties", []):
                if v["name"].lower() == variety.lower() or variety.lower() in v["name"].lower():
                    selected_variety = v
                    break

    # Get current market price
    data = load_data()
    market_prices = data.get("market_prices", [])
    current_price_info = next((p for p in market_prices if p["crop"] == crop), None)
    
    # Extract numeric price
    current_price = 0
    if selected_variety:
        current_price = float(selected_variety.get("price", 0))
        yield_per_acre = selected_variety.get("yield_per_acre", yield_per_acre)
        price_display = selected_variety.get("price_display", f"₹{current_price:,.0f}/{unit}")
    elif current_price_info:
        price_str = current_price_info["price"]
        price_display = price_str
        import re
        match = re.search(r'[\d,]+', price_str)
        if match:
            current_price = float(match.group().replace(',', ''))
    else:
        price_display = f"₹{current_price:,.0f}/{unit}" if current_price else "N/A"
    
    # Calculate estimates
    estimated_yield = round(yield_per_acre * total_acres, 1)
    estimated_revenue = round(estimated_yield * current_price)
    estimated_input_cost = round(estimated_revenue * 0.40)  # ~40% input cost
    estimated_profit = estimated_revenue - estimated_input_cost
    profit_per_acre = round(estimated_profit / total_acres) if total_acres > 0 else 0
    
    # Get 5-year price trend
    history = get_market_history(crop, "Mangaluru")
    yearly_prices = {}
    for entry in history:
        year = entry["year"]
        if year not in yearly_prices:
            yearly_prices[year] = {"total": 0, "count": 0}
        yearly_prices[year]["total"] += entry["price"]
        yearly_prices[year]["count"] += 1
    
    price_trend = []
    for year in sorted(yearly_prices.keys()):
        avg = round(yearly_prices[year]["total"] / yearly_prices[year]["count"], 2)
        price_trend.append({"year": year, "avg_price": avg})
    
    return {
        "crop": crop,
        "variety": selected_variety["name"] if selected_variety else None,
        "variety_details": selected_variety,
        "available_varieties": [v["name"] for v in species_info["varieties"]] if species_info else [],
        "land_acres": round(total_acres, 2),
        "land_guntas": round(total_acres * 40),
        "survey_number": survey_number,
        "yield_per_acre": yield_per_acre,
        "yield_unit": unit,
        "estimated_total_yield": estimated_yield,
        "current_price_per_unit": current_price,
        "price_display": price_display,
        "estimated_revenue": estimated_revenue,
        "estimated_input_cost": estimated_input_cost,
        "estimated_profit": estimated_profit,
        "profit_per_acre": profit_per_acre,
        "trend": current_price_info["trend"] if current_price_info else "stable",
        "price_history_5yr": price_trend
    }

def generate_mock_neighbours(taluk: str, hobli: str = None, exclude_name: str = None) -> dict:
    import hashlib
    
    district = get_district_for_taluk(taluk)
    baseline = DISTRICT_BASELINES.get(district, {
        "ph": 6.5, "soil_type": "Red Sandy", 
        "avg_temp": 26.5, "avg_humidity": 65, "avg_rainfall": 800
    })
    
    # Retrieve crops typical to this district/zone
    coastal_districts = ["Dakshina Kannada", "Udupi", "Uttara Kannada"]
    malnad_districts = ["Chikkamagaluru", "Kodagu", "Hassan", "Shivamogga"]
    northern_districts = [
        "Bagalkot", "Ballari", "Belagavi", "Bidar", "Chitradurga", "Davanagere", 
        "Dharwad", "Gadag", "Haveri", "Kalaburagi", "Koppal", "Raichur", 
        "Vijayanagara", "Vijayapura", "Yadgir"
    ]
    
    if district in coastal_districts:
        crops = ["Rice", "Banana", "Arecanut", "Pepper", "Cashew", "Coconut"]
    elif district in malnad_districts:
        crops = ["Coffee", "Cardamom", "Ginger", "Pepper", "Banana"]
    elif district in northern_districts:
        crops = ["Jowar", "Cotton", "Maize", "Bengal Gram", "Red Gram", "Wheat"]
    else: # Southern Dry
        crops = ["Ragi", "Maize", "Groundnut", "Sugarcane", "Tomato", "Mango"]
        
    first_names = ["Ramesh", "Suresh", "Manjunath", "Ganesh", "Shekhar", "Kempe", "Ananda", "Basavaraj", "Nagaraj", "Sharanappa", "Venkatesh", "Kumar"]
    last_names = ["Gowda", "Patil", "Bhat", "Hegde", "Naik", "Nayak", "Pujari", "Reddy", "Shetty", "Kulkarni"]
    
    h_tal = int(hashlib.md5(taluk.encode()).hexdigest(), 16)
    num_neighbours = 6 + (h_tal % 5)
    
    neighbours = []
    crop_counts = {}
    total_land = 0.0
    crop_profits = {}
    crop_yields = {}
    
    target_hobli = hobli or f"{taluk} Kasaba Hobli"
    
    for i in range(num_neighbours):
        h_ind = int(hashlib.md5(f"{taluk}_{i}".encode()).hexdigest(), 16)
        
        fname = first_names[h_ind % len(first_names)]
        lname = last_names[(h_ind >> 2) % len(last_names)]
        name = f"{fname} {lname}"
        if exclude_name and name.lower() == exclude_name.lower():
            continue
            
        primary = crops[h_ind % len(crops)]
        secondary = crops[(h_ind + 1) % len(crops)]
        if primary == secondary:
            secondary = crops[(h_ind + 2) % len(crops)]
            
        acres = 2 + (h_ind % 8)
        guntas = h_ind % 40
        tot_acres = acres + guntas / 40.0
        total_land += tot_acres
        
        yield_base = {
            "Coffee": 12.0, "Cardamom": 1.5, "Ginger": 80.0, "Jowar": 8.0, 
            "Cotton": 7.0, "Maize": 20.0, "Bengal Gram": 6.0, "Red Gram": 5.0, 
            "Wheat": 12.0, "Pomegranate": 60.0, "Ragi": 10.0, "Groundnut": 8.0, 
            "Sugarcane": 350.0, "Tomato": 120.0, "Mango": 40.0, "Rice": 15.0, 
            "Banana": 180.0, "Arecanut": 10.0, "Pepper": 4.0, "Cashew": 6.0, 
            "Rubber": 8.0, "Coconut": 40.0
        }
        
        y_base = yield_base.get(primary, 10.0)
        y_val = round(y_base * (0.85 + ((h_ind % 30) / 100.0)), 1)
        
        profit_base = {
            "Coffee": 45000, "Cardamom": 90000, "Ginger": 60000, "Jowar": 18000,
            "Cotton": 28000, "Maize": 22000, "Bengal Gram": 25000, "Red Gram": 30000,
            "Wheat": 24000, "Pomegranate": 85000, "Ragi": 20000, "Groundnut": 24000,
            "Sugarcane": 55000, "Tomato": 40000, "Mango": 50000, "Rice": 22000,
            "Banana": 75000, "Arecanut": 120000, "Pepper": 80000, "Cashew": 35000,
            "Rubber": 50000, "Coconut": 40000
        }
        p_base = profit_base.get(primary, 25000)
        profit_per_acre = int(p_base * (0.90 + ((h_ind % 20) / 100.0)))
        tot_profit = int(tot_acres * profit_per_acre)
        
        unit = "kg" if primary in ["Coffee", "Cardamom", "Ginger", "Pepper", "Cashew", "Rubber", "Tomato", "Mango", "Pomegranate"] else ("piece" if primary == "Coconut" else "quintal")
        
        # Select authentic variety for primary crop
        crop_species_obj = CROP_SPECIES.get(primary, {})
        v_list = crop_species_obj.get("varieties", [])
        if v_list:
            selected_var = v_list[h_ind % len(v_list)]
            var_name = selected_var.get("name", f"{primary} Standard")
            var_season = selected_var.get("season", "Kharif")
            var_duration = selected_var.get("duration_days", 120)
            var_price = selected_var.get("price", p_base)
            var_price_display = selected_var.get("price_display", f"₹{var_price:,}/{unit}")
            var_yield_exp = selected_var.get("expected_yield", f"{y_val} {unit}/acre")
            var_soil = selected_var.get("soil_type", baseline["soil_type"])
            var_sci = selected_var.get("scientific_species", "")
        else:
            var_name = f"{primary} Standard"
            var_season = "Kharif"
            var_duration = 120
            var_price = 2500
            var_price_display = f"₹2,500/{unit}"
            var_yield_exp = f"{y_val} {unit}/acre"
            var_soil = baseline["soil_type"]
            var_sci = ""

        soil_ph = round(baseline.get("ph", 6.5) + ((h_ind % 7) - 3) * 0.1, 1)

        neighbours.append({
            "farmer_id": f"F-{1000 + h_ind % 9000}",
            "name": name,
            "hobli": target_hobli,
            "primary_crop": primary,
            "secondary_crop": secondary,
            "variety": var_name,
            "variety_scientific": var_sci,
            "growing_season": var_season,
            "duration_days": var_duration,
            "market_price": var_price,
            "market_price_display": var_price_display,
            "expected_yield": var_yield_exp,
            "land_acres": acres,
            "land_guntas": guntas,
            "soil_type": var_soil or baseline["soil_type"],
            "soil_ph": soil_ph,
            "latest_year": 2024,
            "latest_yield": round(y_val * tot_acres, 1),
            "yield_unit": unit,
            "yield_per_acre": y_val,
            "latest_profit": tot_profit,
            "profit_per_acre": profit_per_acre,
            "is_real_data": False,
            "data_source": "demo",
            "data_source_label": "Demo Simulation (Agro-Climatic Baseline)"
        })
        
        crop_counts[primary] = crop_counts.get(primary, 0) + 1
        crop_profits[primary] = crop_profits.get(primary, 0) + profit_per_acre
        crop_yields[primary] = crop_yields.get(primary, 0) + y_val
        
    crop_summary = []
    for crop, count in crop_counts.items():
        pct = round((count / len(neighbours)) * 100, 1)
        avg_prof = int(crop_profits[crop] / count)
        avg_yld = round(crop_yields[crop] / count, 1)
        unit = "kg" if crop in ["Coffee", "Cardamom", "Ginger", "Pepper", "Cashew", "Rubber", "Tomato", "Mango", "Pomegranate"] else ("piece" if crop == "Coconut" else "quintal")
        
        crop_land = sum([n["land_acres"] + n["land_guntas"]/40.0 for n in neighbours if n["primary_crop"] == crop])
        
        crop_summary.append({
            "crop": crop,
            "farmer_count": count,
            "percentage": pct,
            "total_land_acres": round(crop_land, 1),
            "avg_yield_per_acre": avg_yld,
            "avg_profit_per_acre": avg_prof,
            "yield_unit": unit
        })
        
    crop_summary = sorted(crop_summary, key=lambda x: x["percentage"], reverse=True)
    top_crop = crop_summary[0] if crop_summary else {"crop": "Ragi", "percentage": 100, "avg_profit_per_acre": 20000}
    
    insight = (
        f"🌾 Most of your neighbours ({top_crop['percentage']}%) in {taluk} grow {top_crop['crop']} "
        f"as their primary crop, earning an average profit of ₹{top_crop['avg_profit_per_acre']:,} per acre."
    )
    
    return {
        "neighbours": neighbours,
        "crop_summary": crop_summary,
        "total_farmers": len(neighbours),
        "scope": target_hobli if hobli else taluk,
        "scope_type": "hobli" if hobli else "taluk",
        "available_hoblis": [target_hobli, f"{taluk} Rural Hobli"],
        "insight": insight,
        "is_real_data": False,
        "data_badge": "Demo Data (Simulated)",
        "data_source_label": "Demonstration simulation calibrated to local agro-climatic conditions and soil profiles"
    }


def _enrich_neighbour_response(response: dict) -> dict:
    """Attach crop species/variety data to each crop in crop_summary, varieties breakdown, and top variety to each neighbour."""
    is_real = any(nb.get("is_real_data") for nb in response.get("neighbours", []))
    response["is_real_data"] = is_real
    response["data_badge"] = "Verified Farmer Records" if is_real else "Demo Data (Simulated)"
    response["data_source_label"] = (
        "Verified local farmer records from Taluk agriculture registry" 
        if is_real else 
        "Demonstration simulation calibrated to local agro-climatic conditions and soil profiles"
    )

    # Enrich crop_summary with full species info and varieties breakdown
    for cs in response.get("crop_summary", []):
        species = get_crop_species_info(cs["crop"])
        if species:
            cs["botanical_genus"] = species.get("botanical_genus", "")
            cs["varieties_count"] = species.get("varieties_count", 0)
            cs["price_range"] = species.get("price_range", {})
            cs["top_varieties"] = species.get("varieties", [])[:4]  # Top 4 varieties
            cs["all_varieties"] = species.get("varieties", [])
            var_names = [v.get("name") for v in species.get("varieties", []) if v.get("name")]
            cs["available_varieties"] = var_names
            if species.get("varieties"):
                first_v = species["varieties"][0]
                cs["primary_season"] = first_v.get("season", "Kharif")
                cs["soil_requirements"] = first_v.get("soil_type", "Loamy")
                cs["soil_ph_range"] = first_v.get("soil_ph_range", [6.0, 7.5])
        else:
            cs["botanical_genus"] = ""
            cs["varieties_count"] = 0
            cs["price_range"] = {}
            cs["top_varieties"] = []
            cs["all_varieties"] = []
            cs["available_varieties"] = []
            cs["primary_season"] = "Kharif"
            cs["soil_requirements"] = "Loamy"
            cs["soil_ph_range"] = [6.0, 7.5]

        # Calculate varieties breakdown among actual neighbours
        var_breakdown = {}
        for nb in response.get("neighbours", []):
            if nb.get("primary_crop") == cs["crop"]:
                vname = nb.get("variety") or "Standard Variety"
                if vname not in var_breakdown:
                    var_breakdown[vname] = {
                        "variety": vname,
                        "farmers_count": 0,
                        "farmer_names": [],
                        "yields": [],
                        "profits": [],
                        "market_price_display": nb.get("market_price_display", ""),
                        "growing_season": nb.get("growing_season", ""),
                        "soil_type": nb.get("soil_type", ""),
                        "soil_ph": nb.get("soil_ph", 6.5)
                    }
                var_breakdown[vname]["farmers_count"] += 1
                var_breakdown[vname]["farmer_names"].append(nb.get("name"))
                var_breakdown[vname]["yields"].append(nb.get("yield_per_acre", 0))
                var_breakdown[vname]["profits"].append(nb.get("profit_per_acre", 0))

        v_list = []
        for vname, vdata in var_breakdown.items():
            avg_y = round(sum(vdata["yields"]) / len(vdata["yields"]), 1) if vdata["yields"] else 0
            avg_p = int(sum(vdata["profits"]) / len(vdata["profits"])) if vdata["profits"] else 0
            v_list.append({
                "variety": vname,
                "farmers_count": vdata["farmers_count"],
                "farmer_names": vdata["farmer_names"][:3],
                "avg_yield": avg_y,
                "avg_profit": avg_p,
                "market_price_display": vdata["market_price_display"],
                "growing_season": vdata["growing_season"],
                "soil_type": vdata["soil_type"],
                "soil_ph": vdata["soil_ph"]
            })
        cs["varieties_breakdown"] = v_list

    # Enrich each neighbour with their crop's best-yielding variety if not set
    for nb in response.get("neighbours", []):
        species = get_crop_species_info(nb.get("primary_crop", ""))
        if species and species.get("varieties"):
            best = max(species["varieties"], key=lambda v: v.get("yield_per_acre", 0))
            if not nb.get("variety"):
                nb["variety"] = best.get("name", "")
                nb["growing_season"] = best.get("season", "Kharif")
                nb["expected_yield"] = best.get("expected_yield", "")
                nb["market_price_display"] = best.get("price_display", "")
            nb["crop_top_variety"] = best.get("name", "")
            nb["crop_top_variety_price"] = best.get("price_display", "")
            nb["crop_botanical_genus"] = species.get("botanical_genus", "")
            nb["crop_varieties_count"] = species.get("varieties_count", 0)
        else:
            nb["crop_top_variety"] = ""
            nb["crop_top_variety_price"] = ""
            nb["crop_botanical_genus"] = ""
            nb["crop_varieties_count"] = 0

    return response


@app.get("/neighbour-planting/{taluk}")
async def get_neighbour_planting(
    taluk: str,
    hobli: Optional[str] = Query(None, description="Filter by hobli for closer neighbours"),
    exclude_name: Optional[str] = Query(None, description="Exclude the logged-in farmer's name")
):
    """Get planting details of neighbouring farmers in the same taluk/hobli for comparison."""
    if not os.path.exists(FARMER_DETAILS_FILE):
        return _enrich_neighbour_response(generate_mock_neighbours(taluk, hobli, exclude_name))

    try:
        # Read all farmer records for this taluk
        farmer_records = {}  # farmer_id -> list of year records
        all_rows = []

        with open(FARMER_DETAILS_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['Taluk'].lower() != taluk.lower():
                    continue
                if hobli and row['Hobli'].lower() != hobli.lower():
                    continue
                if exclude_name and row['Farmer_Name'].lower() == exclude_name.lower():
                    continue
                all_rows.append(row)
                fid = row['Farmer_ID']
                if fid not in farmer_records:
                    farmer_records[fid] = []
                farmer_records[fid].append(row)

        if not farmer_records:
            return _enrich_neighbour_response(generate_mock_neighbours(taluk, hobli, exclude_name))

        # Build individual neighbour details (latest year per farmer)
        import hashlib
        neighbours = []
        for fid, records in farmer_records.items():
            latest = max(records, key=lambda r: int(r['Year']))
            acres = float(latest['Total_Land_Acres'])
            yield_qty = float(latest['Yield_Quantity'])
            yield_per_acre = round(yield_qty / acres, 1) if acres > 0 else 0
            primary = latest['Primary_Crop']
            unit = latest['Yield_Unit']
            
            # Select authentic variety for primary crop
            crop_species_obj = CROP_SPECIES.get(primary, {})
            v_list = crop_species_obj.get("varieties", [])
            h_fid = int(hashlib.md5(fid.encode()).hexdigest(), 16)
            if v_list:
                selected_var = v_list[h_fid % len(v_list)]
                var_name = selected_var.get("name", f"{primary} Local")
                var_season = selected_var.get("season", "Kharif")
                var_duration = selected_var.get("duration_days", 120)
                var_price = float(latest.get('Market_Price_Per_Unit')) if latest.get('Market_Price_Per_Unit') else selected_var.get("price", 0)
                var_price_display = f"₹{int(var_price):,}/{unit}"
                var_yield_exp = selected_var.get("expected_yield", f"{yield_per_acre} {unit}/acre")
                var_sci = selected_var.get("scientific_species", "")
            else:
                var_name = f"{primary} Local"
                var_season = "Kharif"
                var_duration = 120
                var_price = float(latest.get('Market_Price_Per_Unit', 0)) if latest.get('Market_Price_Per_Unit') else 0
                var_price_display = f"₹{int(var_price):,}/{unit}" if var_price else ""
                var_yield_exp = f"{yield_per_acre} {unit}/acre"
                var_sci = ""
                
            soil_ph = float(latest.get('pH', 6.0)) if latest.get('pH') else 6.0

            neighbours.append({
                "farmer_id": fid,
                "name": latest['Farmer_Name'],
                "hobli": latest['Hobli'],
                "primary_crop": primary,
                "secondary_crop": latest['Secondary_Crop'],
                "variety": var_name,
                "variety_scientific": var_sci,
                "growing_season": var_season,
                "duration_days": var_duration,
                "market_price": var_price,
                "market_price_display": var_price_display,
                "expected_yield": var_yield_exp,
                "land_acres": acres,
                "land_guntas": float(latest['Total_Land_Guntas']),
                "soil_type": latest.get('Soil_Type', 'Laterite'),
                "soil_ph": soil_ph,
                "latest_year": int(latest['Year']),
                "latest_yield": round(yield_qty, 1),
                "yield_unit": unit,
                "yield_per_acre": yield_per_acre,
                "latest_profit": float(latest['Profit_INR']),
                "profit_per_acre": float(latest['Profit_Per_Acre_INR']),
                "is_real_data": True,
                "data_source": "real",
                "data_source_label": "Verified Farmer (Mangaluru Taluk Records)"
            })

        # Aggregate crop summary
        crop_data = {}  # crop -> {farmers: set, total_acres, yields_per_acre, profits_per_acre}
        for fid, records in farmer_records.items():
            latest = max(records, key=lambda r: int(r['Year']))
            crop = latest['Primary_Crop']
            if crop not in crop_data:
                crop_data[crop] = {
                    "farmers": set(),
                    "total_acres": 0,
                    "yields_per_acre": [],
                    "profits_per_acre": [],
                }
            acres = float(latest['Total_Land_Acres'])
            yield_qty = float(latest['Yield_Quantity'])
            crop_data[crop]["farmers"].add(fid)
            crop_data[crop]["total_acres"] += acres
            if acres > 0:
                crop_data[crop]["yields_per_acre"].append(yield_qty / acres)
            crop_data[crop]["profits_per_acre"].append(float(latest['Profit_Per_Acre_INR']))

        total_farmers = len(farmer_records)
        crop_summary = []
        for crop, data in crop_data.items():
            count = len(data["farmers"])
            avg_yield = round(sum(data["yields_per_acre"]) / len(data["yields_per_acre"]), 1) if data["yields_per_acre"] else 0
            avg_profit = round(sum(data["profits_per_acre"]) / len(data["profits_per_acre"])) if data["profits_per_acre"] else 0
            crop_summary.append({
                "crop": crop,
                "farmer_count": count,
                "percentage": round((count / total_farmers) * 100, 1),
                "total_land_acres": round(data["total_acres"], 1),
                "avg_yield_per_acre": avg_yield,
                "avg_profit_per_acre": avg_profit,
                "yield_unit": neighbours[0]["yield_unit"] if neighbours else "unit",
            })

        # Sort by popularity
        crop_summary.sort(key=lambda x: x["farmer_count"], reverse=True)

        # Fix yield_unit per crop from actual data
        for cs in crop_summary:
            for n in neighbours:
                if n["primary_crop"] == cs["crop"]:
                    cs["yield_unit"] = n["yield_unit"]
                    break

        # Generate demand insight
        top_crop = crop_summary[0] if crop_summary else None
        least_crop = crop_summary[-1] if len(crop_summary) > 1 else None
        insight = ""
        if top_crop and least_crop:
            if top_crop["percentage"] >= 40:
                insight = (
                    f"🔍 {top_crop['percentage']}% of your neighbours grow {top_crop['crop']} — "
                    f"high local competition. Consider diversifying to {least_crop['crop']} "
                    f"(only {least_crop['percentage']}% farmers) for potentially better returns. "
                    f"Average profit for {least_crop['crop']}: ₹{least_crop['avg_profit_per_acre']:,}/acre."
                )
            else:
                insight = (
                    f"🌱 Crop diversity is good in your area! {top_crop['crop']} is the most popular "
                    f"({top_crop['percentage']}%) with avg profit of ₹{top_crop['avg_profit_per_acre']:,}/acre."
                )
        elif top_crop:
            insight = f"🌾 Most neighbours grow {top_crop['crop']} with avg profit of ₹{top_crop['avg_profit_per_acre']:,}/acre."

        # Get list of unique hoblis for the scope selector
        hoblis = sorted(list(set(n["hobli"] for n in neighbours)))

        res_payload = {
            "neighbours": neighbours,
            "crop_summary": crop_summary,
            "total_farmers": total_farmers,
            "scope": hobli or taluk,
            "scope_type": "hobli" if hobli else "taluk",
            "available_hoblis": hoblis,
            "insight": insight,
            "is_real_data": True,
            "data_badge": "Verified Farmer Records",
            "data_source_label": "Verified local farmer records from Taluk agriculture registry"
        }
        return _enrich_neighbour_response(res_payload)

    except Exception as e:
        print(f"Error in neighbour planting lookup: {e}")
        return {"neighbours": [], "crop_summary": [], "total_farmers": 0,
                "scope": taluk, "insight": "Error loading neighbour data.",
                "is_real_data": False, "data_badge": "Error", "data_source_label": ""}


@app.get("/reverse-geocode")
async def reverse_geocode(lat: float, lon: float):
    """Reverse geocode latitude and longitude to State, District, Taluk, Hobli."""
    try:
        # Nominatim reverse geocoding request with a custom User-Agent header (required by OSM)
        headers = {
            "User-Agent": "FarmerPortalApp/1.0 (poornimabhat@farmerportal.com)"
        }
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Geocoding service unavailable")
            
        res_data = response.json()
        address = res_data.get("address", {})
        
        # Get raw components
        raw_state = address.get("state", "")
        raw_district = address.get("state_district", "") or address.get("district", "") or address.get("county", "")
        raw_taluk = address.get("county", "") or address.get("subdistrict", "") or address.get("city", "") or address.get("town", "") or address.get("village", "")
        raw_hobli = address.get("suburb", "") or address.get("neighbourhood", "") or address.get("locality", "") or address.get("village", "")
        
        # Normalize and clean raw strings (e.g. remove "Taluk", "District", spaces)
        def clean(s):
            return s.replace("District", "").replace("Taluk", "").replace("Hobli", "").strip()
            
        clean_state = clean(raw_state)
        clean_district = clean(raw_district)
        clean_taluk = clean(raw_taluk)
        clean_hobli = clean(raw_hobli)
        
        # Check matching lists
        state = "Karnataka" if "karnataka" in clean_state.lower() else (clean_state or "Karnataka")
        
        # Try to map District
        district = "Dakshina Kannada"  # default fallback
        for d in DISTRICT_API_MAP.keys():
            if d.lower() in clean_district.lower() or clean_district.lower() in d.lower():
                district = d
                break
                
        # Try to map Taluk
        taluks = TALUK_MAP.get(district, ["Mangaluru"])
        taluk = taluks[0]
        for t in taluks:
            if t.lower() in clean_taluk.lower() or clean_taluk.lower() in t.lower():
                taluk = t
                break
                
        # Try to map Hobli
        hoblis_options = {
            "Mangaluru": ["Mangaluru A", "Mangaluru B", "Surathkal", "Gurupura", "Mulki", "Haleyangadi", "Moodabidri"],
            "Bantwal": ["Bantwal", "Panemangaluru", "Vittal", "Rayi", "Navoor"],
            "Puttur": ["Puttur", "Uppinangady", "Nelyadi", "Kadaba"],
            "Belthangady": ["Belthangady", "Venur", "Kokkada", "Dharmasthala", "Poonjalkatte"],
            "Sullia": ["Sullia", "Panja", "Bellare", "Subrahmanya"],
            "Moodabidri": ["Moodabidri Kasaba", "Belavai", "Padumarnadu", "Puttige", "Mijar"],
            "Kadaba": ["Kadaba Kasaba", "Subrahmanya", "Nelyadi"],
        }
        
        hoblis = hoblis_options.get(taluk, [f"{taluk} Kasaba Hobli", f"{taluk} Rural Hobli"])
        hobli = hoblis[0]
        for h in hoblis:
            if h.lower() in clean_hobli.lower() or clean_hobli.lower() in h.lower():
                hobli = h
                break
                
        return {
            "status": "success",
            "state": state,
            "district": district,
            "taluk": taluk,
            "hobli": hobli,
            "raw": {
                "state": raw_state,
                "district": raw_district,
                "taluk": raw_taluk,
                "hobli": raw_hobli,
                "display_name": res_data.get("display_name", "")
            }
        }
    except Exception as e:
        print(f"Reverse geocode error: {e}")
        # Default fallback coordinates mapping to Dakshina Kannada / Mangaluru
        return {
            "status": "fallback",
            "state": "Karnataka",
            "district": "Dakshina Kannada",
            "taluk": "Mangaluru",
            "hobli": "Mangaluru B",
            "detail": str(e)
        }


@app.get("/farmer-lookup")
async def farmer_lookup(name: str, phone: str = ""):
    """Check if a farmer exists in MySQL Workbench (or master dataset) and return their complete profile and history."""
    history = []
    farmer_info = {}

    def get_previous_crops(records, current_crops):
        if not records:
            return []

        latest_year = max(int(row["Year"]) for row in records)
        current_crop_names = {crop.strip().casefold() for crop in current_crops if crop}
        seen_crops = set()
        previous_crops = []
        for row in records:
            if int(row["Year"]) >= latest_year:
                continue
            for field in ("Primary_Crop", "Secondary_Crop"):
                crop = (row.get(field) or "").strip()
                crop_key = crop.casefold()
                if crop and crop_key not in current_crop_names and crop_key not in seen_crops:
                    previous_crops.append(crop)
                    seen_crops.add(crop_key)
        return previous_crops
    
    clean_name = (name or "").strip().lower()
    clean_phone = (phone or "").strip()

    # 1. Primary Check: MySQL Workbench database
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        p = "%s" if db_type == "mysql" else "?"
        cursor.execute(
            f"SELECT id, name, survey_number, phone_number, state, district, taluk, hobli, land_area_acres, land_area_guntas, primary_crop, soil_type FROM farmers WHERE LOWER(TRIM(name)) = LOWER({p}) OR (phone_number != '' AND phone_number = {p})",
            (clean_name, clean_phone)
        )
        f_row = cursor.fetchone()
        conn.close()

        if f_row:
            fid, f_name, f_survey, f_phone, f_state, f_district, f_taluk, f_hobli, f_acres, f_guntas, f_crop, f_soil = f_row
            f_acres_val = float(f_acres or 3.0)
            f_guntas_val = float(f_guntas or 0.0)
            total_ac = max(f_acres_val + (f_guntas_val / 40.0), 0.5)

            prim = f_crop or "Rice"
            sec = "Banana" if prim != "Banana" else "Pepper"
            soil_val = f_soil or DISTRICT_BASELINES.get(f_district, {}).get("soil_type", "Laterite Soil")

            farmer_info = {
                "id": f"FP-{fid}",
                "name": f_name,
                "acres": f_acres_val,
                "guntas": f_guntas_val,
                "primary_crop": prim,
                "secondary_crop": sec,
                "soil_type": soil_val,
                "ph": "6.2",
                "survey_number": f_survey or "108/A",
                "hobli": f_hobli or "Kasaba",
                "taluk": f_taluk or "Mangaluru",
                "district": f_district or "Dakshina Kannada",
                "state": f_state or "Karnataka",
                "phone": f_phone or phone,
                "data_source": "mysql",
                "data_source_label": "Verified Farmer Profile (MySQL Workbench)"
            }

            # Check if mangaluru_farmer_details.csv has historical crop records for this farmer
            if os.path.exists(FARMER_DETAILS_FILE):
                try:
                    crop_records = []
                    with open(FARMER_DETAILS_FILE, mode='r', encoding='utf-8') as f:
                        reader = csv.DictReader(f)
                        for row in reader:
                            r_name = row['Farmer_Name'].strip().lower()
                            r_phone = row['Phone'].strip()
                            if (clean_name and (r_name == clean_name or clean_name in r_name)) or (clean_phone and r_phone == clean_phone):
                                crop_records.append(row)
                                rev = float(row.get('Revenue_INR', 0) or 0)
                                prof = float(row.get('Profit_INR', 0) or 0)
                                cost = float(row.get('Input_Cost_INR', 0) or 0)
                                if cost == 0 and rev > 0 and prof > 0:
                                    cost = max(rev - prof, 0)
                                ppa = float(row.get('Profit_Per_Acre_INR', 0) or 0)
                                if ppa == 0 and prof > 0:
                                    ppa = round(prof / max(f_acres_val, 0.1))

                                history.append({
                                    "year": int(row['Year']),
                                    "yield": float(row['Yield_Quantity']),
                                    "unit": row.get('Yield_Unit', 'kg'),
                                    "profit": prof,
                                    "revenue": rev,
                                    "input_cost": cost,
                                    "market_price": float(row.get('Market_Price_Per_Unit', 0) or 0),
                                    "profit_per_acre": ppa
                                })
                    latest_record = max(crop_records, key=lambda row: int(row["Year"])) if crop_records else {}
                    farmer_info["previous_crops"] = get_previous_crops(
                        crop_records,
                        [prim, latest_record.get("Primary_Crop"), latest_record.get("Secondary_Crop")]
                    )
                except Exception as ce:
                    print(f"CSV history lookup note: {ce}")

            # Generate realistic 5-year history calibrated to actual registered acres & crop if not in CSV
            if not history:
                base_yield = 24.0 if prim == "Rice" else (15.0 if prim == "Arecanut" else (180.0 if prim == "Banana" else 350.0))
                base_price = 2400 if prim == "Rice" else (48000 if prim == "Arecanut" else (28 if prim == "Banana" else 145))
                unit_label = "Quintals" if prim in ["Rice", "Arecanut"] else "kg"

                for i, yr in enumerate([2021, 2022, 2023, 2024, 2025]):
                    factor = 1.0 + (i * 0.04) + ((hash(f"{f_name}_{yr}") % 7 - 3) * 0.02)
                    y_val = round(total_ac * base_yield * factor, 1)
                    p_val = round(base_price * (1.0 + i * 0.05), 1)
                    rev_val = round(y_val * p_val)
                    cost_val = round(rev_val * 0.42)
                    prof_val = rev_val - cost_val
                    ppa_val = round(prof_val / total_ac)
                    history.append({
                        "year": yr,
                        "yield": y_val,
                        "unit": unit_label,
                        "profit": prof_val,
                        "revenue": rev_val,
                        "input_cost": cost_val,
                        "market_price": p_val,
                        "profit_per_acre": ppa_val
                    })
    except Exception as dbe:
        print(f"MySQL lookup error in farmer_lookup: {dbe}")

    # 2. Secondary Check: CSV master dataset if not registered in MySQL
    if not farmer_info and os.path.exists(FARMER_DETAILS_FILE):
        try:
            matched_records = []
            with open(FARMER_DETAILS_FILE, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    r_name = row['Farmer_Name'].strip().lower()
                    r_phone = row['Phone'].strip()
                    matched = False
                    if clean_name and (r_name == clean_name or clean_name in r_name):
                        matched = True
                    elif clean_phone and r_phone == clean_phone:
                        matched = True

                    if matched:
                        matched_records.append(row)
                        
                        rev = float(row.get('Revenue_INR', 0) or 0)
                        prof = float(row.get('Profit_INR', 0) or 0)
                        cost = float(row.get('Input_Cost_INR', 0) or 0)
                        if cost == 0 and rev > 0 and prof > 0:
                            cost = max(rev - prof, 0)
                        ppa = float(row.get('Profit_Per_Acre_INR', 0) or 0)
                        if ppa == 0 and prof > 0:
                            total_ac = float(row.get('Total_Land_Acres', 1) or 1)
                            ppa = round(prof / max(total_ac, 0.1))

                        history.append({
                            "year": int(row['Year']),
                            "yield": float(row['Yield_Quantity']),
                            "unit": row.get('Yield_Unit', 'kg'),
                            "profit": prof,
                            "revenue": rev,
                            "input_cost": cost,
                            "market_price": float(row.get('Market_Price_Per_Unit', 0) or 0),
                            "profit_per_acre": ppa
                        })
            if matched_records:
                latest_record = max(matched_records, key=lambda row: int(row["Year"]))
                farmer_info = {
                    "id": latest_record['Farmer_ID'],
                    "name": latest_record['Farmer_Name'],
                    "acres": float(latest_record['Total_Land_Acres']),
                    "guntas": float(latest_record['Total_Land_Guntas']),
                    "primary_crop": latest_record['Primary_Crop'],
                    "secondary_crop": latest_record.get('Secondary_Crop', 'Banana'),
                    "soil_type": latest_record.get('Soil_Type', 'Laterite Soil'),
                    "ph": latest_record.get('pH', '6.2'),
                    "survey_number": latest_record.get('Survey_Number', '108/A'),
                    "hobli": latest_record.get('Hobli', 'Mangaluru B'),
                    "taluk": latest_record.get('Taluk', 'Mangaluru'),
                    "district": latest_record.get('District', 'Dakshina Kannada'),
                    "state": "Karnataka",
                    "phone": latest_record.get('Phone', phone),
                    "data_source": "csv",
                    "data_source_label": "Verified Farmer (Mangaluru Taluk Records)",
                    "previous_crops": get_previous_crops(
                        matched_records,
                        [latest_record['Primary_Crop'], latest_record.get('Secondary_Crop')]
                    )
                }
        except Exception as e:
            print(f"Error in farmer CSV lookup: {e}")

    # 3. Final fallback for guest farmer names
    if not farmer_info and clean_name:
        f_name = name.strip()
        farmer_info = {
            "id": f"FP-{abs(hash(f_name)) % 9000 + 1000}",
            "name": f_name,
            "acres": 3.0,
            "guntas": 0.0,
            "primary_crop": "Rice",
            "secondary_crop": "Banana",
            "soil_type": "Laterite Soil",
            "ph": "6.2",
            "survey_number": "108/A",
            "hobli": "Kasaba",
            "taluk": "Mangaluru",
            "district": "Dakshina Kannada",
            "state": "Karnataka",
            "phone": clean_phone or "9876543210"
        }
        for i, yr in enumerate([2021, 2022, 2023, 2024, 2025]):
            factor = 1.0 + (i * 0.04) + ((hash(f"{f_name}_{yr}") % 7 - 3) * 0.02)
            y_val = round(3.0 * 24.0 * factor, 1)
            p_val = round(2400 * (1.0 + i * 0.05), 1)
            rev_val = round(y_val * p_val)
            cost_val = round(rev_val * 0.42)
            prof_val = rev_val - cost_val
            ppa_val = round(prof_val / 3.0)
            history.append({
                "year": yr,
                "yield": y_val,
                "unit": "Quintals",
                "profit": prof_val,
                "revenue": rev_val,
                "input_cost": cost_val,
                "market_price": p_val,
                "profit_per_acre": ppa_val
            })

    if farmer_info:
        return {
            "found": True,
            "info": farmer_info,
            "history": sorted(history, key=lambda x: x['year'])
        }
    
    return {"found": False}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
