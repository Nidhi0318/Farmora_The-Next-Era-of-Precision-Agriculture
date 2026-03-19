export const indiaStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const karnatakaDistricts = [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", 
    "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", 
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", 
    "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", 
    "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", 
    "Vijayapura", "Yadgir"
];

// Real taluks for the main focused districts, especially Dakshina Kannada where the dataset is from.
export const taluksMap: Record<string, string[]> = {
    "Dakshina Kannada": ["Mangaluru", "Bantwal", "Puttur", "Belthangady", "Sullia", "Moodabidri", "Kadaba"],
    "Udupi": ["Udupi", "Kundapura", "Karkala", "Byndoor", "Brahmavara", "Kaup", "Hebra"],
    "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Anekal", "Yelahanka"],
    "Mysuru": ["Mysuru", "Hunsur", "Krishnarajanagara", "Nanjangud", "Heggadadevanakote", "Piriyapatna", "Tirumakudalu Narasipura"],
    "Uttara Kannada": ["Karwar", "Ankola", "Kumta", "Honnavar", "Bhatkal", "Sirsi", "Siddapur", "Yellapur", "Mundgod", "Haliyal", "Joida", "Dandeli"],
};

export const hoblisMap: Record<string, string[]> = {
    // Dakshina Kannada Taluks
    "Mangaluru": ["Mangaluru A", "Mangaluru B", "Surathkal", "Gurupura", "Mulki"],
    "Bantwal": ["Bantwal", "Panemangaluru", "Vittal", "Rayi", "Navoor"],
    "Puttur": ["Puttur", "Uppinangady", "Nelyadi", "Kadaba"],
    "Belthangady": ["Belthangady", "Venur", "Kokkada"],
    "Sullia": ["Sullia", "Panja", "Bellare", "Subrahmanya"],
    
    // Udupi Taluks
    "Udupi": ["Udupi", "Malpe", "Brahmavara", "Kota"],
    "Kundapura": ["Kundapura", "Vandse", "Trasi"],
    "Karkala": ["Karkala", "Ajekar", "Mudar"],
    
    // Bengaluru Urban Taluks
    "Bengaluru North": ["Yeshwanthpur", "Dasarahalli", "Yelahanka", "Jala", "Hesaraghatta"],
    "Bengaluru South": ["Uttarahalli", "Kengeri", "Tavarekere", "Begur"],
    "Bengaluru East": ["Krishnarajapuram", "Bidarahalli"],
    "Anekal": ["Anekal", "Attibele", "Jigani", "Sarjapura"],

    // Uttara Kannada Taluks
    "Karwar": ["Karwar Kasaba", "Asnoti", "Majali", "Shirwad"],
    "Ankola": ["Ankola Kasaba", "Hattikeri"],
    "Kumta": ["Kumta Kasaba", "Gokarna", "Hiregutti", "Mirjan"],
    "Honnavar": ["Honnavar Kasaba", "Manki", "Gersoppa", "Haldipur"],
    "Bhatkal": ["Bhatkal Kasaba", "Shirali", "Murdeshwar"],
    "Sirsi": ["Sirsi Kasaba", "Banavasi", "Sampkhand", "Hulekal"],
    "Siddapur": ["Siddapur Kasaba", "Bilgi", "Kyadgi", "Harsikatta"],
    "Yellapur": ["Yellapur Kasaba", "Manchikeri", "Kirwatti"],
    "Mundgod": ["Mundgod Kasaba", "Pala"],
    "Haliyal": ["Haliyal Kasaba", "Tergaon", "Murkwad"],
    "Joida": ["Joida Kasaba", "Ramanagara", "Castle Rock"],
    "Dandeli": ["Dandeli Kasaba"]
};

/**
 * Returns taluks for a given district. Uses a dynamic fallback mechanism 
 * for simple code explanation and universal coverage without bloated files.
 */
export const getTaluksForDistrict = (district: string): string[] => {
    return taluksMap[district] || [`${district} North Taluk`, `${district} South Taluk`, `${district} Central Taluk`];
};

/**
 * Returns hoblis for a given taluk. Uses a dynamic fallback mechanism.
 */
export const getHoblisForTaluk = (taluk: string): string[] => {
    return hoblisMap[taluk] || [`${taluk} Kasaba Hobli`, `${taluk} Rural Hobli`, `${taluk} City Hobli`];
};
