export interface CropPrice {
    crop: string;
    price: string;
    trend: 'up' | 'down' | 'stable';
}

export interface WeatherData {
    temperature: number;
    humidity: number;
    rainfall: number;
    rainfall_source?: string;
    rain_today?: number;
    rain_current: number;
    description: string;
    location: string;
    source: string;
}

export interface SoilGridsEstimate {
    ph: number;
    organic_carbon_g_kg?: number;
    nitrogen_g_kg?: number;
    clay_pct?: number;
    sand_pct?: number;
    silt_pct?: number;
    cec_cmol_kg?: number;
    bulk_density_kg_dm3?: number;
    source: string;
    depth_interval?: string;
}

export interface SoilData {
    ph: number;
    ph_source?: string;
    soil_type: string;
    temperature?: number;
    moisture?: number;
    soilgrids?: SoilGridsEstimate | null;
}

export interface RegisteredUser {
    name: string;
    taluk: string;
    district: string;
    hobli: string;
    state?: string;
    surveyNumber: string;
    phone_number?: string;
    land_area_acres?: number;
    land_area_guntas?: number;
    primary_crop?: string;
}

export interface LiveMarketRecord {
    market: string;
    commodity: string;
    variety: string;
    grade: string;
    min_price: number;
    max_price: number;
    modal_price: number;
    arrival_date: string;
}

export interface LiveMarketData {
    source: string;
    total: number;
    district: string;
    requested_district?: string;
    markets: Record<string, LiveMarketRecord[]>;
    commodities: string[];
    records: LiveMarketRecord[];
    message?: string;
}

export interface NeighbourFarmer {
    farmer_id: string;
    name: string;
    hobli: string;
    primary_crop: string;
    secondary_crop: string;
    land_acres: number;
    land_guntas: number;
    soil_type: string;
    latest_year: number;
    latest_yield: number;
    yield_unit: string;
    yield_per_acre: number;
    latest_profit: number;
    profit_per_acre: number;
    is_empty_land?: boolean;
    suggested_crops?: string[];
}

export interface CropSummary {
    crop: string;
    farmer_count: number;
    percentage: number;
    total_land_acres: number;
    avg_yield_per_acre: number;
    avg_profit_per_acre: number;
    yield_unit: string;
}

export interface NeighbourData {
    neighbours: NeighbourFarmer[];
    crop_summary: CropSummary[];
    total_farmers: number;
    scope: string;
    scope_type: string;
    available_hoblis: string[];
    insight: string;
    is_simulated?: boolean;
    data_source?: string;
}

export interface FarmerHistoryInfo {
    id: string;
    name: string;
    phone: string;
    taluk: string;
    district: string;
    hobli: string;
    acres: number;
    guntas: number;
    primary_crop: string;
    soil_type: string;
    ph: number;
}

export interface FarmerHistoryEntry {
    year: number;
    crop: string;
    yield: number;
    unit: string;
    price: number;
    revenue: number;
    cost: number;
    profit: number;
    profit_per_acre: number;
}

export interface FarmerHistoryData {
    found: boolean;
    info: FarmerHistoryInfo;
    history: FarmerHistoryEntry[];
    data_source?: string;
}

export const availableCrops = [
    'Rice', 'Banana', 'Arecanut', 'Pepper', 'Cashew', 'Rubber', 
    'Coconut', 'Coffee', 'Cardamom', 'Ginger', 'Jowar', 'Cotton', 
    'Maize', 'Bengal Gram', 'Red Gram', 'Wheat', 'Pomegranate', 
    'Ragi', 'Groundnut', 'Sugarcane', 'Tomato', 'Mango'
];

export const cropEmojis: Record<string, string> = {
    'Rice': '🌾', 'Banana': '🍌', 'Arecanut': '🌴',
    'Pepper': '🌶️', 'Cashew': '🥜', 'Rubber': '🌳',
    'Coconut': '🥥', 'Wheat': '🌾', 'Sugarcane': '🎋',
    'Cotton': '☁️', 'Coffee': '☕', 'Cardamom': '🌱',
    'Ginger': '🥔', 'Jowar': '🌾', 'Maize': '🌽',
    'Bengal Gram': '🥜', 'Red Gram': '🫘', 'Pomegranate': '🍎',
    'Ragi': '🌾', 'Groundnut': '🥜', 'Tomato': '🍅',
    'Mango': '🥭'
};
