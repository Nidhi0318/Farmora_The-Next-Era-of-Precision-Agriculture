import os
from typing import List, Optional

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



def get_district_for_taluk(taluk_name: str) -> str:
    taluk_clean = taluk_name.strip().lower()
    for district, taluks in TALUK_MAP.items():
        for t in taluks:
            if t.lower() == taluk_clean or taluk_clean in t.lower() or t.lower() in taluk_clean:
                return district
    return taluk_name  # Return taluk name itself as fallback (it may be a district)



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

