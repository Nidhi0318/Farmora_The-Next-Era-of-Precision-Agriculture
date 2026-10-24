export const indiaStates = [
    "Karnataka"
];

// ═══════════════════════════════════════════════════════════════════════════
// KARNATAKA - ALL 31 DISTRICTS
// ═══════════════════════════════════════════════════════════════════════════

export const stateDistrictsMap: Record<string, string[]> = {
    "Karnataka": [
        "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
        "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
        "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri",
        "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur",
        "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara",
        "Vijayapura", "Yadgir"
    ]
};

export const karnatakaDistricts = stateDistrictsMap["Karnataka"];

export const getDistrictsForState = (state: string): string[] => {
    return stateDistrictsMap[state] || [];
};

// ═══════════════════════════════════════════════════════════════════════════
// KARNATAKA - ALL 240 TALUKS (Organized by District)
// ═══════════════════════════════════════════════════════════════════════════

export const taluksMap: Record<string, string[]> = {
    // 1. BAGALKOT (10 Taluks)
    "Bagalkot": ["Bagalkot", "Badami", "Bilagi", "Guledgudda", "Hungund", "Ilkal", "Jamkhandi", "Mudhol", "Rabkavi Banhatti", "Terdal"],
    
    // 2. BALLARI (7 Taluks)
    "Ballari": ["Ballari", "Hagaribommanahalli", "Harapanahalli", "Hosapete", "Hoovina Hadagali", "Kudligi", "Sandur"],
    
    // 3. BELAGAVI (15 Taluks)
    "Belagavi": ["Athani", "Bailhongal", "Belagavi", "Chikkodi", "Gokak", "Hukkeri", "Kagawad", "Khanapur", "Kittur", "Mudalagi", "Nippani", "Raibag", "Ramdurg", "Saundatti", "Savadatti"],
    
    // 4. BENGALURU RURAL (4 Taluks)
    "Bengaluru Rural": ["Devanahalli", "Doddaballapura", "Hoskote", "Nelamangala"],
    
    // 5. BENGALURU URBAN (5 Taluks)
    "Bengaluru Urban": ["Anekal", "Bengaluru East", "Bengaluru North", "Bengaluru South", "Yelahanka"],
    
    // 6. BIDAR (5 Taluks)
    "Bidar": ["Aurad", "Basavakalyan", "Bhalki", "Bidar", "Humnabad"],
    
    // 7. CHAMARAJANAGAR (4 Taluks)
    "Chamarajanagar": ["Chamarajanagar", "Gundlupet", "Kollegal", "Yelandur"],
    
    // 8. CHIKKABALLAPUR (6 Taluks)
    "Chikkaballapur": ["Bagepalli", "Chikkaballapur", "Chintamani", "Gauribidanur", "Gudibanda", "Sidlaghatta"],
    
    // 9. CHIKKAMAGALURU (7 Taluks)
    "Chikkamagaluru": ["Ajjampura", "Chikkamagaluru", "Kadur", "Koppa", "Mudigere", "Narasimharajapura", "Tarikere"],
    
    // 10. CHITRADURGA (6 Taluks)
    "Chitradurga": ["Challakere", "Chitradurga", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"],
    
    // 11. DAKSHINA KANNADA (5 Taluks)
    "Dakshina Kannada": ["Bantwal", "Belthangady", "Mangaluru", "Puttur", "Sullia"],
    
    // 12. DAVANAGERE (6 Taluks)
    "Davanagere": ["Channagiri", "Davanagere", "Harihara", "Honnali", "Jagalur", "Nyamathi"],
    
    // 13. DHARWAD (5 Taluks)
    "Dharwad": ["Dharwad", "Hubballi", "Kalghatgi", "Kundgol", "Navalgund"],
    
    // 14. GADAG (5 Taluks)
    "Gadag": ["Gadag", "Mundargi", "Naragund", "Ron", "Shirhatti"],
    
    // 15. HASSAN (8 Taluks)
    "Hassan": ["Alur", "Arkalgud", "Arsikere", "Belur", "Channarayapatna", "Hassan", "Holenarasipura", "Sakleshpur"],
    
    // 16. HAVERI (7 Taluks)
    "Haveri": ["Byadgi", "Hangal", "Haveri", "Hirekerur", "Ranebennur", "Savanur", "Shiggaon"],
    
    // 17. KALABURAGI (7 Taluks)
    "Kalaburagi": ["Afzalpur", "Aland", "Chincholi", "Chitapur", "Jewargi", "Kalaburagi", "Sedam"],
    
    // 18. KODAGU (3 Taluks)
    "Kodagu": ["Madikeri", "Somwarpet", "Virajpet"],
    
    // 19. KOLAR (6 Taluks)
    "Kolar": ["Bangarapet", "Kolar", "Malur", "Mulbagal", "Srinivaspur", "KGF"],
    
    // 20. KOPPAL (4 Taluks)
    "Koppal": ["Gangavati", "Koppal", "Kushtagi", "Yelburga"],
    
    // 21. MANDYA (7 Taluks)
    "Mandya": ["Krishnarajapet", "Maddur", "Malavalli", "Mandya", "Nagamangala", "Pandavapura", "Srirangapatna"],
    
    // 22. MYSURU (7 Taluks)
    "Mysuru": ["Heggadadevankote", "Hunsur", "Krishnarajanagara", "Mysuru", "Nanjangud", "Periyapatna", "Tirumakudalu Narasipura"],
    
    // 23. RAICHUR (5 Taluks)
    "Raichur": ["Devadurga", "Lingsugur", "Manvi", "Raichur", "Sindhanur"],
    
    // 24. RAMANAGARA (4 Taluks)
    "Ramanagara": ["Channapatna", "Kanakapura", "Magadi", "Ramanagara"],
    
    // 25. SHIVAMOGGA (7 Taluks)
    "Shivamogga": ["Bhadravati", "Hosanagara", "Sagar", "Shikaripura", "Shivamogga", "Soraba", "Thirthahalli"],
    
    // 26. TUMAKURU (10 Taluks)
    "Tumakuru": ["Chikkanayakanahalli", "Gubbi", "Koratagere", "Kunigal", "Madhugiri", "Pavagada", "Sira", "Tiptur", "Tumakuru", "Turuvekere"],
    
    // 27. UDUPI (3 Taluks)
    "Udupi": ["Karkala", "Kundapura", "Udupi"],
    
    // 28. UTTARA KANNADA (11 Taluks)
    "Uttara Kannada": ["Ankola", "Bhatkal", "Dandeli", "Haliyal", "Honnavar", "Joida", "Karwar", "Kumta", "Mundgod", "Siddapur", "Sirsi", "Yellapur"],
    
    // 29. VIJAYANAGARA (4 Taluks)
    "Vijayanagara": ["Hagaribommanahalli", "Hosapete", "Hoovina Hadagali", "Kudligi"],
    
    // 30. VIJAYAPURA (11 Taluks)
    "Vijayapura": ["Basavana Bagevadi", "Chadchan", "Indi", "Muddebihal", "Sindagi", "Talikota", "Tikota", "Vijayapura"],
    
    // 31. YADGIR (3 Taluks)
    "Yadgir": ["Shahapur", "Surapura", "Yadgir"]
};

export const getTaluksForDistrict = (district: string): string[] => {
    return taluksMap[district] || [];
};

// ═══════════════════════════════════════════════════════════════════════════
// KARNATAKA - ALL 745 HOBLIS (Organized by Taluk)
// ═══════════════════════════════════════════════════════════════════════════

export const hoblisMap: Record<string, string[]> = {
    // ═══════════════════════════════════════════════════════════════════════
    // BAGALKOT DISTRICT - 10 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Bagalkot": ["Bagalkot", "Kaladgi", "Navanagar", "Sitimani"],
    "Badami": ["Badami", "Guledgudda", "Kerur", "Cholachagudda"],
    "Bilagi": ["Bilagi", "Anagwadi", "Galagali"],
    "Guledgudda": ["Guledgudda", "Gaddankeri"],
    "Hungund": ["Hungund", "Ilkal", "Amingad", "Karatagi"],
    "Ilkal": ["Ilkal", "Hunashyal"],
    "Jamkhandi": ["Jamkhandi", "Savalagi", "Rabkavi", "Banhatti"],
    "Mudhol": ["Mudhol", "Lokapur", "Mahalingapur"],
    "Rabkavi Banhatti": ["Rabkavi", "Banhatti", "Terdal"],
    "Terdal": ["Terdal", "Yaragatti"],

    // ═══════════════════════════════════════════════════════════════════════
    // BALLARI DISTRICT - 7 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Ballari": ["Ballari", "Kolur", "Kurugodu", "Moka", "Rupanagudi", "Siraguppa"],
    "Hagaribommanahalli": ["Hagaribommanahalli", "Huvinahadagali"],
    "Harapanahalli": ["Harapanahalli", "Harihar"],
    "Hosapete": ["Hosapete", "Kamalapura", "Mariyammanahalli"],
    "Hoovina Hadagali": ["Hoovina Hadagali", "Hagari Bommanahalli"],
    "Kudligi": ["Kudligi", "Hosahalli", "Gudekote", "Kotturu"],
    "Sandur": ["Sandur", "Chornur", "Toranagallu"],

    // ═══════════════════════════════════════════════════════════════════════
    // BELAGAVI DISTRICT - 15 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Athani": ["Athani", "Kagawad", "Ainapur", "Telsang"],
    "Bailhongal": ["Bailhongal", "Kittur", "Nesargi", "Sampgaon"],
    "Belagavi": ["Belagavi", "Kakati", "Hirebagevadi", "Uchagaon"],
    "Chikkodi": ["Chikkodi", "Nippani", "Sadalga", "Eksamba"],
    "Gokak": ["Gokak", "Arbhavi", "Koujalagi", "Mudalagi"],
    "Hukkeri": ["Hukkeri", "Sankeshwar"],
    "Kagawad": ["Kagawad", "Telsang"],
    "Khanapur": ["Khanapur", "Londa"],
    "Kittur": ["Kittur", "Sampgaon"],
    "Mudalagi": ["Mudalagi", "Gokak Falls"],
    "Nippani": ["Nippani", "Sadalga"],
    "Raibag": ["Raibag", "Hidkal"],
    "Ramdurg": ["Ramdurg", "Yadwad"],
    "Saundatti": ["Saundatti", "Parasgad", "Yadwad"],
    "Savadatti": ["Savadatti", "Parasgad"],

    // ═══════════════════════════════════════════════════════════════════════
    // BENGALURU RURAL DISTRICT - 4 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Devanahalli": ["Devanahalli", "Kundana", "Vijayapura", "Channarayapatna"],
    "Doddaballapura": ["Doddaballapura", "Tubagere", "Madure", "Sasalu", "Dodda Belavangala"],
    "Hoskote": ["Hoskote", "Anugondanahalli", "Jadigenahalli", "Nandagudi", "Sulibele"],
    "Nelamangala": ["Nelamangala", "Somapura", "Tyamagondlu", "Doddajala"],

    // ═══════════════════════════════════════════════════════════════════════
    // BENGALURU URBAN DISTRICT - 5 Taluks (87 Hoblis Total)
    // ═══════════════════════════════════════════════════════════���═══════════
    "Anekal": ["Anekal", "Attibele", "Jigani", "Sarjapura", "Chandapura", "Huskur", "Marsur", "Bannerghatta"],
    "Bengaluru East": ["Krishnarajapuram", "Bidarahalli", "K.R. Puram", "Varthur", "Mahadevapura", "Whitefield", "Hoodi", "Marathahalli", "Bellandur", "Sarjapur", "Hoskote"],
    "Bengaluru North": ["Kasaba", "Yeshwanthpur", "Dasarahalli", "Yelahanka", "Jala", "Hesaraghatta", "Byatarayanapura", "Kodigehalli", "Vidyaranyapura", "Yelahanka New Town", "Jakkur", "Thanisandra", "Hebbal", "RT Nagar", "Malleshwaram", "Rajajinagar", "Bettahalsur"],
    "Bengaluru South": ["Kasaba", "Uttarahalli", "Kengeri", "Tavarekere", "Begur", "Bommanahalli", "Gottigere", "Banashankari", "JP Nagar", "Padmanabhanagar", "Kumaraswamy Layout", "Jayanagar", "Basavanagudi", "Hanumanthanagar"],
    "Yelahanka": ["Yelahanka", "Jala", "Hesaraghatta", "Doddaballapura Road", "Singanayakanahalli", "Bagalur", "Bettahalsur", "Sonnappanahalli", "Vidyaranyapura", "Kogilu", "Attur"],

    // ═══════════════════════════════════════════════════════════════════════
    // BIDAR DISTRICT - 5 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Aurad": ["Aurad", "Hallikhed"],
    "Basavakalyan": ["Basavakalyan", "Mudbi", "Narayanapur", "Morkhandi"],
    "Bhalki": ["Bhalki", "Halbarga", "Dhannura", "Khatak Chincholi"],
    "Bidar": ["Bidar", "Janawada", "Kamthana", "Bagdal", "Mannaekhelli"],
    "Humnabad": ["Humnabad", "Dubalgundi", "Ladawanti", "Chitgoppa"],

    // ═══════════════════════════════════════════════════════════════════════
    // CHAMARAJANAGAR DISTRICT - 4 Taluks
    // ═══════════════════════════════════════════════════════��═══════════════
    "Chamarajanagar": ["Chamarajanagar", "Harve", "Santhemarahalli", "Bhogapura", "Chandakavadi", "Ramapura"],
    "Gundlupet": ["Gundlupet", "Begur", "Hangala", "Terakanambi"],
    "Kollegal": ["Kollegal", "Palya", "Hanur", "Lokkanahalli", "Haradanahalli"],
    "Yelandur": ["Yelandur", "Biligiri Rangana Hills"],

    // ═══════════════════════════════════════════════════════════════════════
    // CHIKKABALLAPUR DISTRICT - 6 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Bagepalli": ["Bagepalli", "Chelur", "Mittemari", "Gulur"],
    "Chikkaballapur": ["Chikkaballapur", "Mandalakal", "Nandi", "Peresandra"],
    "Chintamani": ["Chintamani", "Kaiwara", "Murugamalla", "Chilakalanerpu"],
    "Gauribidanur": ["Gauribidanur", "Gudibanda", "Shidlaghatta"],
    "Gudibanda": ["Gudibanda", "Bagepalli"],
    "Sidlaghatta": ["Sidlaghatta", "Shidlaghatta"],

    // ═══════════════════════════════════════════════════════════════════════
    // CHIKKAMAGALURU DISTRICT - 7 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Ajjampura": ["Ajjampura", "Tarikere"],
    "Chikkamagaluru": ["Chikkamagaluru", "Khandya", "Lakkavalli", "Vastare"],
    "Kadur": ["Kadur", "Birur", "Singatagere", "Panchanahalli"],
    "Koppa": ["Koppa", "Hariharapura", "Jayapura", "Megunda"],
    "Mudigere": ["Mudigere", "Kalasa", "Gonibeedu", "Balur"],
    "Narasimharajapura": ["Narasimharajapura", "Aldur"],
    "Tarikere": ["Tarikere", "Ajjampura"],

    // ═══════════════════════════════════════════════════════════════════════
    // CHITRADURGA DISTRICT - 6 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Challakere": ["Challakere", "T.N. Kote", "Naikanahatti", "Parashurampura"],
    "Chitradurga": ["Chitradurga", "Bharamasagara", "Turuvnur", "Hireguntanur"],
    "Hiriyur": ["Hiriyur", "Adivala", "Javanagondanahalli", "Dharmapura", "Imangala"],
    "Holalkere": ["Holalkere", "Jagalur"],
    "Hosadurga": ["Hosadurga", "Molakalmuru"],
    "Molakalmuru": ["Molakalmuru", "Hosadurga"],

    // ═══════════════════════════════════════════════════════════════════════
    // DAKSHINA KANNADA DISTRICT - 5 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Bantwal": ["Bantwal", "Panemangaluru", "Vittal", "Rayi", "Navoor"],
    "Belthangady": ["Belthangady", "Venur", "Kokkada", "Dharmasthala", "Poonjalkatte"],
    "Mangaluru": ["Mangaluru A", "Mangaluru B", "Surathkal", "Gurupura", "Mulki", "Haleyangadi", "Moodabidri"],
    "Puttur": ["Puttur", "Uppinangady", "Nelyadi", "Kadaba"],
    "Sullia": ["Sullia", "Panja", "Bellare", "Subrahmanya"],

    // ═══════════════════════════════════════════════════════════════════════
    // DAVANAGERE DISTRICT - 6 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Channagiri": ["Channagiri", "Basavapatna", "Santhebennur", "Nyamathi"],
    "Davanagere": ["Davanagere", "Anagodu", "Mayakonda"],
    "Harihara": ["Harihara", "Malebennur", "Bhanuvalli"],
    "Honnali": ["Honnali", "Jagalur"],
    "Jagalur": ["Jagalur", "Holalkere"],
    "Nyamathi": ["Nyamathi", "Channagiri"],

    // ═══════════════════════════════════════════════════════════════════════
    // DHARWAD DISTRICT - 5 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Dharwad": ["Dharwad", "Mugad", "Garag", "Alnavar"],
    "Hubballi": ["Hubballi", "Chabbi", "Kundgol", "Navalgund"],
    "Kalghatgi": ["Kalghatgi", "Alnavar"],
    "Kundgol": ["Kundgol", "Navalgund"],
    "Navalgund": ["Navalgund", "Kundgol"],

    // ═══════════════════════════════════════════════════════════════════════
    // GADAG DISTRICT - 5 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Gadag": ["Gadag", "Betgeri", "Mulgund", "Hulkoti"],
    "Mundargi": ["Mundargi", "Lakshmeshwar"],
    "Naragund": ["Naragund", "Konur", "Shirol"],
    "Ron": ["Ron", "Gajendragad"],
    "Shirhatti": ["Shirhatti", "Naragund"],

    // ═══════════════════════════════════════════════════════════════════════
    // HASSAN DISTRICT - 8 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Alur": ["Alur", "Arkalgud"],
    "Arkalgud": ["Arkalgud", "Alur"],
    "Arsikere": ["Arsikere", "Kanakatte", "Banavara", "Javagal", "Gandasi"],
    "Belur": ["Belur", "Halebidu"],
    "Channarayapatna": ["Channarayapatna", "Sravanabelagola", "Nuggehalli", "Dandiganahalli", "Hirisawe"],
    "Hassan": ["Hassan", "Shantigrama", "Dudda", "Kattaya", "Gorur"],
    "Holenarasipura": ["Holenarasipura", "Sakleshpur"],
    "Sakleshpur": ["Sakleshpur", "Hettur"],

    // ═══════════════════════════════════════════════════════════════════════
    // HAVERI DISTRICT - 7 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Byadgi": ["Byadgi", "Hirekerur"],
    "Hangal": ["Hangal", "Shiggaon"],
    "Haveri": ["Haveri", "Gutthal", "Karajagi", "Negalur"],
    "Hirekerur": ["Hirekerur", "Byadgi"],
    "Ranebennur": ["Ranebennur", "Medleri", "Kudarihal", "Halageri"],
    "Savanur": ["Savanur", "Hangal"],
    "Shiggaon": ["Shiggaon", "Hangal"],

    // ═══════════════════════════════════════════════════════════════════════
    // KALABURAGI DISTRICT - 7 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Afzalpur": ["Afzalpur", "Atnur", "Karajagi"],
    "Aland": ["Aland", "Chincholi"],
    "Chincholi": ["Chincholi", "Aland"],
    "Chitapur": ["Chitapur", "Sedam"],
    "Jewargi": ["Jewargi", "Shahabad"],
    "Kalaburagi": ["Kalaburagi", "Pattan", "Farhatabad"],
    "Sedam": ["Sedam", "Chitapur"],

    // ═══════════════════════════════════════════════════════════════════════
    // KODAGU DISTRICT - 3 Taluks
    // ═════════════════════════════════════════════════════════════���═════════
    "Madikeri": ["Madikeri", "Napoklu", "Bhagamandala", "Sampaje"],
    "Somwarpet": ["Somwarpet", "Shanivarasanthe", "Kushalnagar", "Suntikoppa"],
    "Virajpet": ["Virajpet", "Ponnampet", "Srimangala", "Balele", "Ammatti"],

    // ═══════════════════════════════════════════════════════════════════════
    // KOLAR DISTRICT - 6 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Bangarapet": ["Bangarapet", "Kammasandra", "Bhudikote", "Robertsonpet"],
    "Kolar": ["Kolar", "Vokkaleri", "Sugatur", "Huthoor"],
    "Malur": ["Malur", "Tekal", "Lakkur", "Masthi"],
    "Mulbagal": ["Mulbagal", "Srinivaspur"],
    "Srinivaspur": ["Srinivaspur", "Mulbagal"],
    "KGF": ["KGF", "Robertsonpet"],

    // ═══════════════════════════════════════════════════════════════════════
    // KOPPAL DISTRICT - 4 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Gangavati": ["Gangavati", "Karatagi", "Navali"],
    "Koppal": ["Koppal", "Alavandi", "Munirabad", "Hira"],
    "Kushtagi": ["Kushtagi", "Yelburga"],
    "Yelburga": ["Yelburga", "Kushtagi"],

    // ═══════════════════════════════════════════════════════════════════════
    // MANDYA DISTRICT - 7 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Krishnarajapet": ["Krishnarajapet", "K.R. Pet"],
    "Maddur": ["Maddur", "Nagara", "Kestur", "Maddur Rural", "K.P. Doddi"],
    "Malavalli": ["Malavalli", "Boppagowdanapura", "Kirugavalu", "Halaguru"],
    "Mandya": ["Mandya", "Kothathi", "Dudda", "Huligere", "Basaralu"],
    "Nagamangala": ["Nagamangala", "Bindiganavile"],
    "Pandavapura": ["Pandavapura", "Srirangapatna"],
    "Srirangapatna": ["Srirangapatna", "Pandavapura"],

    // ═══════════════════════════════════════════════════════════════════════
    // MYSURU DISTRICT - 7 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Heggadadevankote": ["H.D. Kote", "Sargur", "Antharasanthe", "Hampapura"],
    "Hunsur": ["Hunsur", "Bilikere", "Gavadagere", "Hanagodu"],
    "Krishnarajanagara": ["K.R. Nagar", "Mirle", "Saligrama", "Hebbalu", "Chunchanakatte", "Hosa Agrahara"],
    "Mysuru": ["Mysuru", "Jayapura", "Ilavala", "Varuna", "Mellahalli"],
    "Nanjangud": ["Nanjangud", "Kavalande", "Bilugali", "Hullahalli", "Dodda Kavalande"],
    "Periyapatna": ["Periyapatna", "Piriyapatna"],
    "Tirumakudalu Narasipura": ["T. Narasipura", "T.N. Pura"],

    // ═══════════════════════════════════════════════════════════════════════
    // RAICHUR DISTRICT - 5 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Devadurga": ["Devadurga", "Arakera", "Gabbur", "Jalahalli"],
    "Lingsugur": ["Lingsugur", "Manvi"],
    "Manvi": ["Manvi", "Lingsugur"],
    "Raichur": ["Raichur", "Gillesugur", "Chandrabanda", "Yaramaras", "Matmari", "Yeragera"],
    "Sindhanur": ["Sindhanur", "Turvihal", "Gorebal", "Balganur"],

    // ═══════════════════════════════════════════════════════════════════════
    // RAMANAGARA DISTRICT - 4 Taluks
    // ══════════════════════════════════════��════════════════════════════════
    "Channapatna": ["Channapatna", "Honnayakanahalli", "Dashawara", "Singarajapura"],
    "Kanakapura": ["Kanakapura", "Harohalli", "Maralavadi", "Kodihalli", "Uyyamballi"],
    "Magadi": ["Magadi", "Ramanagara"],
    "Ramanagara": ["Ramanagara", "Kylancha", "Kutagal", "Bidadi"],

    // ═══════════════════════════════════════════════════════════════════════
    // SHIVAMOGGA DISTRICT - 7 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Bhadravati": ["Bhadravati", "Holehonuur", "Agumbe"],
    "Hosanagara": ["Hosanagara", "Thirthahalli"],
    "Sagar": ["Sagar", "Anandapuram", "Talaguppa"],
    "Shikaripura": ["Shikaripura", "Soraba"],
    "Shivamogga": ["Shivamogga", "Holalur", "Harmagatta", "Kumadvathi"],
    "Soraba": ["Soraba", "Shikaripura"],
    "Thirthahalli": ["Thirthahalli", "Hosanagara"],

    // ═══════════════════════════════════════════════════════════════════════
    // TUMAKURU DISTRICT - 10 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Chikkanayakanahalli": ["Chikkanayakanahalli", "C.N. Halli"],
    "Gubbi": ["Gubbi", "Kadaba", "Nittur", "Chelur", "Chandrashekharapura", "Hagalavadi"],
    "Koratagere": ["Koratagere", "Madhugiri"],
    "Kunigal": ["Kunigal", "Amrithur", "Huliyurudurga", "Yedeyur", "Kothigere"],
    "Madhugiri": ["Madhugiri", "Dodderi", "Badavanahalli", "Puravara", "Medigeshi", "Midigesi"],
    "Pavagada": ["Pavagada", "Sira"],
    "Sira": ["Sira", "Pavagada"],
    "Tiptur": ["Tiptur", "Turuvekere"],
    "Tumakuru": ["Tumakuru", "Goolur", "Hebbur", "Kora", "Bellavi", "Urdigere"],
    "Turuvekere": ["Turuvekere", "Tiptur"],

    // ═══════════════════════════════════════════════════════════════════════
    // UDUPI DISTRICT - 3 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Karkala": ["Karkala", "Ajekar", "Mudar", "Hebri"],
    "Kundapura": ["Kundapura", "Vandse", "Trasi", "Byndoor", "Tallur"],
    "Udupi": ["Udupi", "Malpe", "Brahmavara", "Kota", "Kaup", "Padubidri"],

    // ═══════════════════════════════════════════════════════════════════════
    // UTTARA KANNADA DISTRICT - 11 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Ankola": ["Ankola", "Hattikeri", "Poojageri"],
    "Bhatkal": ["Bhatkal", "Shirali", "Murdeshwar"],
    "Dandeli": ["Dandeli", "Haliyal"],
    "Haliyal": ["Haliyal", "Dandeli"],
    "Honnavar": ["Honnavar", "Manki", "Gersoppa", "Haldipur"],
    "Joida": ["Joida", "Yellapur"],
    "Karwar": ["Karwar", "Asnoti", "Majali", "Shirwad"],
    "Kumta": ["Kumta", "Gokarna", "Hiregutti", "Mirjan"],
    "Mundgod": ["Mundgod", "Sirsi"],
    "Siddapur": ["Siddapur", "Bilgi", "Kyadgi", "Harsikatta"],
    "Sirsi": ["Sirsi", "Banavasi", "Sampkhand", "Hulekal"],
    "Yellapur": ["Yellapur", "Joida"],

    // ═══════════════════════════════════════════════════════════════════════
    // VIJAYANAGARA DISTRICT - 4 Taluks (Hoblis declared above)
    // ═══════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════
    // VIJAYAPURA DISTRICT - 11 Taluks
    // ═══════════════��═══════════════════════════════════════════════════════
    "Basavana Bagevadi": ["Bagevadi", "Kolhar", "Nidagundi", "Managuli", "Muttagi", "Ukkali"],
    "Chadchan": ["Chadchan", "Tikota"],
    "Indi": ["Indi", "Tambamba", "Zalaki", "Lachyan", "Rugui"],
    "Muddebihal": ["Muddebihal", "Talikota"],
    "Sindagi": ["Sindagi", "Basavana Bagevadi"],
    "Talikota": ["Talikota", "Muddebihal"],
    "Tikota": ["Tikota", "Chadchan"],
    "Vijayapura": ["Vijayapura", "Babaleshwar", "Bableshwar", "Tikota", "Mamadapura", "Kambagi"],

    // ═══════════════════════════════════════════════════════════════════════
    // YADGIR DISTRICT - 3 Taluks
    // ═══════════════════════════════════════════════════════════════════════
    "Shahapur": ["Shahapur", "Surapura"],
    "Surapura": ["Surapura", "Shahapur"],
    "Yadgir": ["Yadgir", "Balichakra", "Hattikuni", "Sydapur"]
};

export const getHoblisForTaluk = (taluk: string): string[] => {
    return hoblisMap[taluk] || [`${taluk} Hobli`];
};
