import React, { useState, useEffect } from 'react';
import './App.css';
import { LandingPage } from './components/Landing/LandingPage';
import farmoraLogoMark from './assets/brand/agriveda-mark.png';
import blackPepperIcon from './assets/black-pepper.png';
import cashewIcon from './assets/cashew.png';
import cottonIcon from './assets/cotton.png';
import paddyIcon from './assets/paddy.png';
import pomegranateIcon from './assets/pomegranate.png';
import profileUserIcon from './assets/profile-user-icon.png';
import wheatIcon from './assets/wheat.png';
import {
    indiaStates,
    getDistrictsForState,
    getTaluksForDistrict,
    getHoblisForTaluk
} from './data/locations';
import {
    type Language,
    getCropName,
    t,
    getSoilName,
    toKannadaDigits,
    formatUnit,
    getDistrictName,
    getTalukName,
    getFarmerName
} from './data/translations';

interface CropPrice {
    crop: string;
    price: string;
    trend: 'up' | 'down' | 'stable';
}

interface WeatherData {
    temperature: number;
    humidity: number;
    rainfall: number;
    rain_today?: number;
    rain_current: number;
    description: string;
    location: string;
    source: string;
}

interface SoilData {
    ph: number;
    soil_type: string;
    temperature?: number;
    moisture?: number;
}

interface CropVariety {
    name: string;
    scientific_species?: string;
    price: number;
    price_display?: string;
    season: string;
    duration_days: number;
    maturity_period?: string;
    yield_per_acre: number;
    expected_yield?: string;
    characteristics?: string;
    soil_type?: string;
    soil_ph_range?: [number, number];
    min_temp?: number;
    max_temp?: number;
    rainfall_range?: [number, number];
    climate?: string;
    growing_months?: string;
    best_regions?: string[];
    image_url?: string;
    image_credit?: string;
    image_source?: string;
    suitability_score?: number;
    suitability_level?: string;
    suitability_color?: string;
    suitability_badge?: string;
    match_highlights?: string[];
}

interface CropSpeciesData {
    crop: string;
    unit: string;
    botanical_genus?: string;
    crop_image?: string;
    varieties_count: number;
    price_range?: { min: number; max: number; unit: string; display: string };
    varieties: CropVariety[];
}

interface ProfitEstimate {
    crop: string;
    variety?: string | null;
    variety_details?: CropVariety | null;
    available_varieties?: string[];
    land_acres: number;
    land_guntas: number;
    survey_number: string;
    yield_per_acre: number;
    yield_unit: string;
    estimated_total_yield: number;
    current_price_per_unit: number;
    price_display: string;
    estimated_revenue: number;
    estimated_input_cost: number;
    estimated_profit: number;
    profit_per_acre: number;
    trend: string;
    price_history_5yr: { year: number; avg_price: number }[];
}

interface FarmerCropHistoryRecord {
    id: number;
    year: number;
    crop_name: string;
    season: string;
    cultivated_area_acres: number;
    yield_quantity: number;
    yield_unit: string;
    soil_type: string;
    soil_ph: number;
    irrigation_type: string;
    profit: number | null;
}

interface CropHistoryDraft {
    year: string;
    crop_name: string;
    season: string;
    cultivated_area_acres: string;
    yield_quantity: string;
    yield_unit: string;
    soil_type: string;
    soil_ph: string;
    irrigation_type: string;
    profit: string;
}

function App() {
    const [isRegistered, setIsRegistered] = useState(false);
    const [showLanding, setShowLanding] = useState(true);
    const [lang, setLang] = useState<Language>('en');

    // Form States
    const [name, setName] = useState('');
    const [surveyNumber, setSurveyNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [stateLoc, setStateLoc] = useState('Karnataka');
    const [district, setDistrict] = useState('Uttara Kannada');
    const [taluk, setTaluk] = useState('Karwar');
    const [hobli, setHobli] = useState('Karwar Kasaba');
    const [landAcres, setLandAcres] = useState('');
    const [landGuntas, setLandGuntas] = useState('');
    const [registrationCrop, setRegistrationCrop] = useState('');

    const [taluksList, setTaluksList] = useState<string[]>(getTaluksForDistrict('Uttara Kannada'));
    const [hoblisList, setHoblisList] = useState<string[]>(getHoblisForTaluk('Karwar'));
    const [loadingRegister, setLoadingRegister] = useState(false);

    // Auth States
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [loginName, setLoginName] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [accessToken, setAccessToken] = useState('');

    // Dashboard States
    const [registeredUser, setRegisteredUser] = useState<{
        name: string,
        taluk: string,
        district: string,
        state?: string,
        hobli?: string,
        aadhaar_number?: string,
        survey_number: string,
        phone_number?: string,
        land_area_acres?: number,
        land_area_guntas?: number,
        primary_crop?: string,
        soil_type?: string,
        database?: string
    } | null>(null);

    // Profile Editing States (Direct MySQL Workbench Sync)
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editPhone, setEditPhone] = useState('');
    const [editSurvey, setEditSurvey] = useState('');
    const [editAcres, setEditAcres] = useState('');
    const [editGuntas, setEditGuntas] = useState('');
    const [editPrimaryCrop, setEditPrimaryCrop] = useState('');
    const [editSoilType, setEditSoilType] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const [recommendations, setRecommendations] = useState<any>(null);
    const [marketPrices, setMarketPrices] = useState<CropPrice[]>([]);

    // Weather & Soil States
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [soilData, setSoilData] = useState<SoilData | null>(null);
    const [loadingWeather, setLoadingWeather] = useState(false);

    // Crop Recommendation States
    const [showCropResults, setShowCropResults] = useState(false);
    const [loadingCropRec, setLoadingCropRec] = useState(false);

    // Market Rate States
    const [selectedCrop, setSelectedCrop] = useState('');
    const [selectedMarketResult, setSelectedMarketResult] = useState<CropPrice | null>(null);
    const [showMarketResult, setShowMarketResult] = useState(false);
    const [loadingMarket, setLoadingMarket] = useState(false);

    // Profit Calculator States
    const [showProfitCalc, setShowProfitCalc] = useState(false);
    const [profitEstimate, setProfitEstimate] = useState<ProfitEstimate | null>(null);
    const [loadingProfit, setLoadingProfit] = useState(false);
    const [calcSurveyNumber, setCalcSurveyNumber] = useState('');
    const [calcAcres, setCalcAcres] = useState('');
    const [calcGuntas, setCalcGuntas] = useState('');

    // Crop Species & Varieties States
    const [selectedVariety, setSelectedVariety] = useState<string>('');
    const [expandedSpeciesCrop, setExpandedSpeciesCrop] = useState<string | null>(null);
    const [speciesDataMap, setSpeciesDataMap] = useState<Record<string, CropSpeciesData>>({});
    const [loadingSpeciesCrop, setLoadingSpeciesCrop] = useState<string | null>(null);

    // Variety Showcase Modal States
    const [varietyModalCrop, setVarietyModalCrop] = useState<string | null>(null);
    const [varietyModalData, setVarietyModalData] = useState<CropSpeciesData | null>(null);
    const [loadingVarietyModal, setLoadingVarietyModal] = useState<boolean>(false);
    const [varietyFilterSeason, setVarietyFilterSeason] = useState<string>('all');
    const [varietySortBy, setVarietySortBy] = useState<string>('match');
    const [varietySearchQuery, setVarietySearchQuery] = useState<string>('');

    const openVarietyModal = async (cropName: string) => {
        if (!cropName) return;
        setVarietyModalCrop(cropName);
        setVarietyFilterSeason('all');
        setVarietySortBy('match');
        setVarietySearchQuery('');
        setLoadingVarietyModal(true);

        const currentTaluk = registeredUser?.taluk || 'Mangaluru';
        const currentDistrict = registeredUser?.district || '';
        const currentPh = soilData?.ph || recommendations?.soil_data?.ph || 6.0;
        const currentTemp = weatherData?.temperature || recommendations?.soil_data?.temp || 28.0;
        const currentRain = weatherData?.rainfall || recommendations?.soil_data?.rainfall || 2000;
        const currentSoil = soilData?.soil_type || recommendations?.soil_data?.soil_type || '';

        try {
            const params = new URLSearchParams();
            if (currentTaluk) params.append('taluk', currentTaluk);
            if (currentDistrict) params.append('district', currentDistrict);
            if (currentPh) params.append('ph', String(currentPh));
            if (currentTemp) params.append('temp', String(currentTemp));
            if (currentRain) params.append('rainfall', String(currentRain));
            if (currentSoil) params.append('soil_type', currentSoil);

            const res = await fetch(`http://localhost:8000/crop-varieties/${encodeURIComponent(cropName)}?${params.toString()}`);
            if (res.ok) {
                const data: CropSpeciesData = await res.json();
                setVarietyModalData(data);
                setSpeciesDataMap(prev => ({ ...prev, [cropName]: data }));
            }
        } catch (e) {
            console.error("Error fetching varieties for modal", e);
        } finally {
            setLoadingVarietyModal(false);
        }
    };

    const fetchCropSpecies = async (cropName: string) => {
        if (!cropName) return null;
        if (speciesDataMap[cropName]) return speciesDataMap[cropName];
        setLoadingSpeciesCrop(cropName);
        try {
            const currentTaluk = registeredUser?.taluk || 'Mangaluru';
            const currentPh = soilData?.ph || recommendations?.soil_data?.ph || '';
            const currentTemp = weatherData?.temperature || recommendations?.soil_data?.temp || '';
            const currentRain = weatherData?.rainfall || recommendations?.soil_data?.rainfall || '';
            const currentSoil = soilData?.soil_type || recommendations?.soil_data?.soil_type || '';

            const params = new URLSearchParams();
            if (currentTaluk) params.append('taluk', currentTaluk);
            if (currentPh) params.append('ph', String(currentPh));
            if (currentTemp) params.append('temp', String(currentTemp));
            if (currentRain) params.append('rainfall', String(currentRain));
            if (currentSoil) params.append('soil_type', currentSoil);

            const res = await fetch(`http://localhost:8000/crop-varieties/${encodeURIComponent(cropName)}?${params.toString()}`);
            if (res.ok) {
                const data: CropSpeciesData = await res.json();
                setSpeciesDataMap(prev => ({ ...prev, [cropName]: data }));
                return data;
            }
        } catch (err) {
            console.error("Error fetching crop species", err);
        } finally {
            setLoadingSpeciesCrop(null);
        }
        return null;
    };

    // Live Market Prices State (data.gov.in)
    interface LiveMarketRecord {
        market: string;
        commodity: string;
        variety: string;
        grade: string;
        min_price: number;
        max_price: number;
        modal_price: number;
        arrival_date: string;
    }
    interface LiveMarketData {
        source: string;
        total: number;
        district: string;
        requested_district?: string;
        markets: Record<string, LiveMarketRecord[]>;
        commodities: string[];
        records: LiveMarketRecord[];
        message?: string;
    }
    const [liveMarketData, setLiveMarketData] = useState<LiveMarketData | null>(null);
    const [loadingLiveMarket, setLoadingLiveMarket] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState('');

    // Farmer History States
    const [farmerHistory, setFarmerHistory] = useState<{ info: any, history: any[] } | null>(null);
    const [cropHistoryRecords, setCropHistoryRecords] = useState<FarmerCropHistoryRecord[]>([]);
    const [showCropHistoryForm, setShowCropHistoryForm] = useState(false);
    const [editingCropHistoryId, setEditingCropHistoryId] = useState<number | null>(null);
    const [cropHistoryDrafts, setCropHistoryDrafts] = useState<CropHistoryDraft[]>([]);
    const [savingCropHistory, setSavingCropHistory] = useState(false);
    const [cropHistoryError, setCropHistoryError] = useState('');

    // Neighbour Planting States
    interface VarietyBreakdown {
        variety: string;
        farmers_count: number;
        farmer_names: string[];
        avg_yield: number;
        avg_profit: number;
        market_price_display: string;
        growing_season: string;
        soil_type: string;
        soil_ph?: number;
    }
    interface NeighbourFarmer {
        farmer_id: string;
        name: string;
        hobli: string;
        primary_crop: string;
        secondary_crop: string;
        variety?: string;
        variety_scientific?: string;
        growing_season?: string;
        duration_days?: number;
        market_price?: number;
        market_price_display?: string;
        expected_yield?: string;
        land_acres: number;
        land_guntas: number;
        soil_type: string;
        soil_ph?: number;
        latest_year: number;
        latest_yield: number;
        yield_unit: string;
        yield_per_acre: number;
        latest_profit: number;
        profit_per_acre: number;
        is_real_data?: boolean;
        data_source?: string;
        data_source_label?: string;
    }
    interface CropSummary {
        crop: string;
        farmer_count: number;
        percentage: number;
        total_land_acres: number;
        avg_yield_per_acre: number;
        avg_profit_per_acre: number;
        yield_unit: string;
        botanical_genus?: string;
        varieties_count?: number;
        price_range?: { min: number; max: number; unit: string; display: string };
        top_varieties?: CropVariety[];
        all_varieties?: CropVariety[];
        available_varieties?: string[];
        primary_season?: string;
        soil_requirements?: string;
        soil_ph_range?: [number, number];
        varieties_breakdown?: VarietyBreakdown[];
    }
    interface NeighbourData {
        neighbours: NeighbourFarmer[];
        crop_summary: CropSummary[];
        total_farmers: number;
        scope: string;
        scope_type: string;
        available_hoblis: string[];
        insight: string;
        is_real_data?: boolean;
        data_badge?: string;
        data_source_label?: string;
    }
    const [_neighbourData, setNeighbourData] = useState<NeighbourData | null>(null);
    const [selectedNeighbourHobli, setSelectedNeighbourHobli] = useState('');
    const [gpsCoords] = useState<{lat: number, lon: number} | null>(null);

    interface BhoomiParcel {
        survey_number: string;
        owner_name: string;
        owner_name_kn: string;
        land_acres: number;
        land_guntas: number;
        land_type: string;
        land_type_kn: string;
        soil_type: string;
        soil_type_kn: string;
        crop_grown: string;
        crop_grown_kn: string;
        is_user: boolean;
        is_empty?: boolean;
        recommended_crops?: string[];
        suggested_work?: string;
        suggested_work_kn?: string;
        polygon: [number, number][];
    }

    interface BhoomiMapData {
        center: [number, number];
        parcels: BhoomiParcel[];
        taluk: string;
        hobli: string;
        district: string;
    }

    const [bhoomiMapData, setBhoomiMapData] = useState<BhoomiMapData | null>(null);
    const [loadingBhoomiMap, setLoadingBhoomiMap] = useState(false);

    const [activeTab, setActiveTab] = useState<'profile' | 'recommendation' | 'prices' | 'neighbours' | 'history'>('recommendation');
    const [showPassword, setShowPassword] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    const availableCrops = ['Rice', 'Banana', 'Arecanut', 'Pepper', 'Cashew', 'Rubber', 'Coconut', 'Coffee', 'Cardamom', 'Ginger', 'Jowar', 'Cotton', 'Maize', 'Bengal Gram', 'Red Gram', 'Wheat', 'Pomegranate', 'Ragi', 'Groundnut', 'Sugarcane', 'Tomato', 'Mango', 'Onion', 'Potato', 'Turmeric', 'Chilli', 'Sunflower'];

    // Cascading logic
    useEffect(() => {
        setDistrict('');
        setTaluk('');
        setHobli('');
    }, [stateLoc]);

    useEffect(() => {
        if (district) {
            const list = getTaluksForDistrict(district);
            setTaluksList(list);
            // When updating district, we only clear taluk IF it's not actually valid for the new district.
            // This allows the auto-fill logic to set both simultaneously without conflict.
            if (taluk && !list.includes(taluk)) {
                setTaluk('');
            }
        } else {
            setTaluksList([]);
        }
    }, [district]);

    useEffect(() => {
        if (taluk) {
            const list = getHoblisForTaluk(taluk);
            setHoblisList(list);
            // Only clear hobli if it's not valid for the new taluk
            if (hobli && !list.includes(hobli)) {
                setHobli('');
            }
        } else {
            setHoblisList([]);
        }
    }, [taluk]);

    const fetchWeather = async (location: string) => {
        setLoadingWeather(true);
        try {
            let locQuery = location;
            // If GPS is active and we are loading the dashboard farmer location, pass coordinates
            if (gpsCoords && location === (registeredUser?.taluk || '')) {
                locQuery = `${gpsCoords.lat},${gpsCoords.lon}`;
            }
            const res = await fetch(`http://localhost:8000/weather/${encodeURIComponent(locQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setWeatherData(data);
            }
        } catch (e) {
            console.error("Weather fetch failed", e);
        } finally {
            setLoadingWeather(false);
        }
    };

    const fetchSoilData = async (talukName?: string, districtName?: string) => {
        try {
            const query = new URLSearchParams();
            if (talukName) query.append("taluk", talukName);
            if (districtName) query.append("district", districtName);
            const res = await fetch(`http://localhost:8000/soil-data?${query.toString()}`);
            if (res.ok) setSoilData(await res.json());
        } catch (e) {
            console.error("Soil data fetch failed", e);
        }
    };

    const fetchMarketPrices = async () => {
        try {
            const res = await fetch('http://localhost:8000/market-prices');
            if (res.ok) setMarketPrices(await res.json());
        } catch (e) {
            console.error("Failed to fetch market prices", e);
        }
    };

    const fetchLiveMarketPrices = async (district: string) => {
        setLoadingLiveMarket(true);
        try {
            const url = district
                ? `http://localhost:8000/district-market-prices/${encodeURIComponent(district)}`
                : 'http://localhost:8000/market-prices-live';
            const res = await fetch(url);
            if (res.ok) setLiveMarketData(await res.json());
        } catch (e) {
            console.error("Failed to fetch live market prices", e);
        } finally {
            setLoadingLiveMarket(false);
        }
    };

    const fetchCropHistory = async (token: string) => {
        const response = await fetch('http://localhost:8000/farmer/crop-history', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Failed to load crop history');
        }
        const data = await response.json();
        const records: FarmerCropHistoryRecord[] = data.records || [];
        setCropHistoryRecords(records);
        return records;
    };

    const fetchFarmerHistory = async (name: string, phone: string) => {
        try {
            const res = await fetch(`http://localhost:8000/farmer-lookup?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.found) {
                    setFarmerHistory(data);
                    if (data.info?.survey_number) {
                        setCalcSurveyNumber(data.info.survey_number);
                    }
                    return data;
                } else {
                    setFarmerHistory(null);
                }
            }
        } catch (e) {
            console.error("Farmer history lookup failed", e);
        }
        return null;
    };

    const createCropHistoryDraft = (): CropHistoryDraft => ({
        year: String(new Date().getFullYear()),
        crop_name: '',
        season: 'Kharif',
        cultivated_area_acres: '1',
        yield_quantity: '',
        yield_unit: 'kg',
        soil_type: soilData?.soil_type || 'Laterite Soil',
        soil_ph: String(soilData?.ph || 6.2),
        irrigation_type: 'Rainfed',
        profit: ''
    });

    const openCropHistoryForm = (record?: FarmerCropHistoryRecord) => {
        setEditingCropHistoryId(record?.id ?? null);
        setCropHistoryDrafts(record ? [{
            year: String(record.year),
            crop_name: record.crop_name,
            season: record.season,
            cultivated_area_acres: String(record.cultivated_area_acres),
            yield_quantity: String(record.yield_quantity),
            yield_unit: record.yield_unit,
            soil_type: record.soil_type,
            soil_ph: String(record.soil_ph),
            irrigation_type: record.irrigation_type,
            profit: record.profit === null ? '' : String(record.profit)
        }] : [createCropHistoryDraft()]);
        setCropHistoryError('');
        setShowCropHistoryForm(true);
    };

    const handleCropHistoryDraftChange = (index: number, field: keyof CropHistoryDraft, value: string) => {
        setCropHistoryDrafts(current => current.map((draft, draftIndex) =>
            draftIndex === index ? { ...draft, [field]: value } : draft
        ));
    };

    const handleSaveCropHistory = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!accessToken) {
            setCropHistoryError(t('cropHistoryLoginRequired', lang));
            return;
        }

        setSavingCropHistory(true);
        setCropHistoryError('');
        try {
            const records = cropHistoryDrafts.map(draft => ({
                year: Number(draft.year),
                crop_name: draft.crop_name.trim(),
                season: draft.season,
                cultivated_area_acres: Number(draft.cultivated_area_acres),
                yield_quantity: Number(draft.yield_quantity),
                yield_unit: draft.yield_unit,
                soil_type: draft.soil_type.trim(),
                soil_ph: Number(draft.soil_ph),
                irrigation_type: draft.irrigation_type,
                profit: draft.profit.trim() === '' ? null : Number(draft.profit)
            }));
            const isEditing = editingCropHistoryId !== null;
            const response = await fetch(
                isEditing
                    ? `http://localhost:8000/farmer/crop-history/${editingCropHistoryId}`
                    : 'http://localhost:8000/farmer/crop-history',
                {
                    method: isEditing ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(isEditing ? records[0] : { records })
                }
            );
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || t('cropHistorySaveFailed', lang));
            }
            await fetchCropHistory(accessToken);
            setShowCropHistoryForm(false);
            setEditingCropHistoryId(null);
            setCropHistoryDrafts([]);
        } catch (error) {
            console.error('Crop history save failed', error);
            setCropHistoryError(error instanceof Error ? error.message : t('cropHistorySaveFailed', lang));
        } finally {
            setSavingCropHistory(false);
        }
    };

    const handleDeleteCropHistory = async (recordId: number) => {
        if (!accessToken || !window.confirm(t('confirmDeleteCropHistory', lang))) return;
        setCropHistoryError('');
        try {
            const response = await fetch(`http://localhost:8000/farmer/crop-history/${recordId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || t('cropHistoryDeleteFailed', lang));
            }
            await fetchCropHistory(accessToken);
        } catch (error) {
            console.error('Crop history delete failed', error);
            setCropHistoryError(error instanceof Error ? error.message : t('cropHistoryDeleteFailed', lang));
        }
    };

    const fetchBhoomiMapData = async (userTaluk: string, userHobli?: string, userCropOverride?: string, surveyOverride?: string) => {
        setLoadingBhoomiMap(true);
        try {
            const activeSurvey = (surveyOverride !== undefined ? surveyOverride : calcSurveyNumber) || registeredUser?.survey_number || farmerHistory?.info?.survey_number || '120';
            const params = new URLSearchParams({
                taluk: userTaluk,
                user_name: registeredUser?.name || 'You',
                user_acres: (registeredUser?.land_area_acres ?? 2).toString(),
                user_guntas: (registeredUser?.land_area_guntas ?? 0).toString(),
                user_crop: userCropOverride || farmerHistory?.info?.primary_crop || registeredUser?.primary_crop || 'Rice',
                survey_number: activeSurvey.trim()
            });
            if (userHobli) params.set('hobli', userHobli);
            if (gpsCoords) {
                params.set('lat', gpsCoords.lat.toString());
                params.set('lon', gpsCoords.lon.toString());
            }
            const res = await fetch(`http://localhost:8000/bhoomi/land-map?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setBhoomiMapData(data);
            }
        } catch (e) {
            console.error("Bhoomi map data fetch failed", e);
        } finally {
            setLoadingBhoomiMap(false);
        }
    };

    const fetchNeighbourData = async (userTaluk: string, hobli?: string, excludeName?: string, userCropOverride?: string) => {
        try {
            let url = `http://localhost:8000/neighbour-planting/${encodeURIComponent(userTaluk)}`;
            const params = new URLSearchParams();
            if (hobli) params.set('hobli', hobli);
            if (excludeName) params.set('exclude_name', excludeName);
            if (params.toString()) url += `?${params.toString()}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setNeighbourData(data);
                if (data.available_hoblis && data.available_hoblis.length > 0 && !selectedNeighbourHobli) {
                    setSelectedNeighbourHobli(data.available_hoblis[0]);
                }
            }
            // Sync Bhoomi map data
            await fetchBhoomiMapData(userTaluk, hobli, userCropOverride);
        } catch (e) {
            console.error("Neighbour data fetch failed", e);
        }
    };

    const startEditingProfile = () => {
        setEditPhone(registeredUser?.phone_number || farmerHistory?.info?.phone || '');
        setEditSurvey(registeredUser?.survey_number || farmerHistory?.info?.survey_number || '');
        setEditAcres((registeredUser?.land_area_acres ?? farmerHistory?.info?.acres ?? 0).toString());
        setEditGuntas((registeredUser?.land_area_guntas ?? farmerHistory?.info?.guntas ?? 0).toString());
        setEditPrimaryCrop(registeredUser?.primary_crop || farmerHistory?.info?.primary_crop || 'Rice');
        setEditSoilType(registeredUser?.soil_type || farmerHistory?.info?.soil_type || soilData?.soil_type || 'Laterite Soil');
        setIsEditingProfile(true);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const farmerName = registeredUser?.name || farmerHistory?.info?.name || '';
            const payload = {
                name: farmerName,
                phone_number: editPhone,
                survey_number: editSurvey,
                land_area_acres: parseFloat(editAcres) || 0,
                land_area_guntas: parseFloat(editGuntas) || 0,
                primary_crop: editPrimaryCrop,
                soil_type: editSoilType
            };
            const response = await fetch('http://localhost:8000/farmer/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const resData = await response.json();
                // Update local state
                setRegisteredUser(prev => prev ? {
                    ...prev,
                    phone_number: editPhone,
                    survey_number: editSurvey,
                    land_area_acres: parseFloat(editAcres) || 0,
                    land_area_guntas: parseFloat(editGuntas) || 0,
                    primary_crop: editPrimaryCrop,
                    soil_type: editSoilType,
                    database: resData?.database || "MySQL Workbench (farmer_portal)"
                } : null);

                setCalcSurveyNumber(editSurvey);
                // Re-fetch farmer history and cadastre map
                await fetchFarmerHistory(farmerName, editPhone);
                if (registeredUser?.taluk) {
                    await fetchBhoomiMapData(registeredUser.taluk, registeredUser.hobli, editPrimaryCrop, editSurvey);
                }
                setIsEditingProfile(false);
                alert(lang === 'kn'
                    ? "✅ ರೈತರ ವಿವರಗಳನ್ನು MySQL Workbench ನಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!"
                    : "✅ Farmer profile successfully updated and saved in MySQL Workbench!");
            } else {
                alert(lang === 'kn' ? "❌ ಪ್ರೊಫೈಲ್ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ." : "❌ Failed to update profile in MySQL Workbench.");
            }
        } catch (err) {
            console.error("Profile update error", err);
            alert(lang === 'kn' ? "❌ ಸರ್ವರ್ ದೋಷ." : "❌ Error updating profile in MySQL Workbench.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingRegister(true);
        try {
            const payload = {
                name, aadhaar_number: '', survey_number: surveyNumber, phone_number: phoneNumber,
                state: stateLoc, district: district || 'N/A',
                taluk: taluk || 'N/A', hobli: hobli || 'N/A',
                password: regPassword,
                primary_crop: registrationCrop,
                land_area_acres: parseFloat(landAcres) || 0,
                land_area_guntas: parseFloat(landGuntas) || 0
            };
            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const resData = await response.json();
                const dbSource = resData?.database || 'MySQL Workbench (farmer_portal)';
                alert(lang === 'kn' 
                    ? `✅ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ನಿಮ್ಮ ವಿವರಗಳನ್ನು ${dbSource} ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಆಗಿ.` 
                    : `✅ Registration successful! Your farmer info has been saved to ${dbSource}. Please login.`);
                setIsLoginMode(true);
                setLoginName(name);
                setLoginPassword('');
                setRegPassword('');
            } else {
                alert(lang === 'kn' ? "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ." : "Registration failed. Please check your inputs.");
            }
        } catch (e) {
            console.error("Registration error", e);
            alert(lang === 'kn' ? "ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ." : "Error connecting to server.");
        } finally {
            setLoadingRegister(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingLogin(true);
        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: loginName, password: loginPassword })
            });

            if (response.ok) {
                const data = await response.json();
                const user = data.user;
                setAccessToken(data.access_token || '');
                setRegisteredUser(user);
                setIsRegistered(true);
                if (user.survey_number) {
                    setCalcSurveyNumber(user.survey_number);
                }

                // Fetch necessary data for dashboard
                fetchWeather(user.taluk || user.district || 'Mangalore');
                fetchSoilData(user.taluk, user.district);
                fetchMarketPrices();
                setSelectedDistrict(user.district || '');
                fetchLiveMarketPrices(user.district || '');
                try {
                    await fetchCropHistory(data.access_token || '');
                    setCropHistoryError('');
                } catch (error) {
                    console.error('Crop history lookup failed', error);
                    setCropHistoryError(error instanceof Error ? error.message : 'Failed to load crop history');
                }
                const historyData = await fetchFarmerHistory(user.name, user.phone_number || '');
                const userCrop = historyData?.info?.primary_crop || 'Rice';
                fetchNeighbourData(user.taluk || 'Mangaluru', undefined, user.name, userCrop);
            } else {
                const err = await response.json();
                if (response.status === 404) {
                    alert(lang === 'kn' ? "❌ ಹೆಸರು ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ನೋಂದಾಯಿಸಿ ಅಥವಾ ಕಾಗುಣಿತ ಪರಿಶೀಲಿಸಿ." : "❌ Name not found. Please register first or check your spelling.");
                } else if (response.status === 401) {
                    alert(lang === 'kn' ? "❌ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ." : "❌ Password incorrect. Please try again.");
                } else {
                    alert(err.detail || (lang === 'kn' ? "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ." : "Login failed. Please try again later."));
                }
            }
        } catch (e) {
            console.error("Login error", e);
            alert(lang === 'kn' ? "ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ." : "Error connecting to server.");
        } finally {
            setLoadingLogin(false);
        }
    };

    const handleLogout = () => {
        if (accessToken) {
            fetch('http://localhost:8000/logout', {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` }
            }).catch(error => console.error('Logout request failed', error));
        }
        setAccessToken('');
        setCropHistoryRecords([]);
        setShowCropHistoryForm(false);
        setCropHistoryDrafts([]);
        setCropHistoryError('');
        setIsRegistered(false);
        setRegisteredUser(null);
        setLoginName('');
        setLoginPassword('');
        setShowLanding(true);
    };

    const handleCropRecommendation = async () => {
        setLoadingCropRec(true);
        setShowCropResults(false);
        try {
            const userTaluk = registeredUser?.taluk || 'Unknown';
            const ph = soilData?.ph || 6.2;
            const temp = weatherData?.temperature || 28;
            const rainfall = weatherData?.rainfall || 3500;
            const humidity = weatherData?.humidity || 85;

            const res = await fetch(
                `http://localhost:8000/recommendations/${encodeURIComponent(userTaluk)}?ph=${ph}&temp=${temp}&rainfall=${rainfall}&humidity=${humidity}`
            );
            if (res.ok) {
                const data = await res.json();
                data.soil_data.humidity = weatherData?.humidity;
                data.soil_data.weather_description = weatherData?.description;
                data.soil_data.weather_source = weatherData?.source;
                setRecommendations(data);
                setShowCropResults(true);
            }
        } catch (e) {
            alert("Could not connect to the server.");
        } finally {
            setLoadingCropRec(false);
        }
    };

    const handleMarketPrediction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingMarket(true);
        setShowMarketResult(false);
        try {
            const res = await fetch('http://localhost:8000/market-prices');
            if (res.ok) {
                const prices: CropPrice[] = await res.json();
                setMarketPrices(prices);
                const found = prices.find(p => p.crop === selectedCrop);
                setSelectedMarketResult(found || { crop: selectedCrop, price: 'N/A', trend: 'stable' });
                setShowMarketResult(true);
                // Also fetch all species/varieties and pricing for this particular crop
                if (selectedCrop) {
                    fetchCropSpecies(selectedCrop);
                }
            }
        } catch (e) {
            alert("Could not connect to the server.");
        } finally {
            setLoadingMarket(false);
        }
    };

    const handleProfitEstimate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingProfit(true);
        try {
            const acresVal = calcAcres || (registeredUser?.land_area_acres ?? 0).toString();
            const guntasVal = calcGuntas || (registeredUser?.land_area_guntas ?? 0).toString();
            const surveyVal = calcSurveyNumber || '';
            const cropVal = selectedMarketResult?.crop || selectedCrop || 'Rice';
            const params = new URLSearchParams({
                crop: cropVal,
                acres: acresVal,
                guntas: guntasVal,
                survey_number: surveyVal,
                ...(selectedVariety ? { variety: selectedVariety } : {})
            });
            const res = await fetch(`http://localhost:8000/profit-estimate?${params}`);
            if (res.ok) {
                setProfitEstimate(await res.json());
                setShowProfitCalc(true);
            }
        } catch (e) {
            alert("Could not connect to the server.");
        } finally {
            setLoadingProfit(false);
        }
    };

    const resetCropResults = () => {
        setShowCropResults(false);
        setRecommendations(null);
        setExpandedSpeciesCrop(null);
    };

    const resetMarketForm = () => {
        setShowMarketResult(false);
        setShowProfitCalc(false);
        setSelectedCrop('');
        setSelectedVariety('');
        setSelectedMarketResult(null);
        setProfitEstimate(null);
    };

    const cropEmojis: Record<string, string> = {
        'Banana': '🍌', 'Arecanut': '🌴', 'Sunflower': '🌻',
        'Rubber': '🌳',
        'Coconut': '🥥', 'Sugarcane': '🎋',
        'Cotton': '🌱', 'Coffee': '☕', 'Cardamom': '🌱',
        'Ginger': '🫚', 'Jowar': '🌾', 'Maize': '🌽',
        'Bengal Gram': '🫘', 'Red Gram': '🫘', 'Pomegranate': '🍎',
        'Ragi': '🌾', 'Groundnut': '🥜', 'Tomato': '🍅',
        'Mango': '🥭', 'Onion': '🧅', 'Potato': '🥔',
        'Turmeric': '🌿', 'Chilli': '🌶️'
    };

    const cropIcons: Record<string, string> = {
        Pepper: blackPepperIcon,
        Cashew: cashewIcon,
        Cotton: cottonIcon,
        Pomegranate: pomegranateIcon,
        Rice: paddyIcon,
        Wheat: wheatIcon
    };

    const getCropIcon = (crop: string, fallback: string): React.ReactNode =>
        cropIcons[crop]
            ? <img src={cropIcons[crop]} alt="" className="crop-image-icon" />
            : cropEmojis[crop] || fallback;

    const kd = (v: any) => toKannadaDigits(v, lang);
    const fu = (unit: string) => formatUnit(unit, lang);
    const dn = (district: string) => getDistrictName(district, lang);
    const tn = (taluk: string) => getTalukName(taluk, lang);
    const fn = (name?: string) => getFarmerName(name, lang);

    if (!isRegistered && showLanding) {
        return (
            <LandingPage
                onLogin={() => {
                    setIsLoginMode(true);
                    setShowLanding(false);
                }}
                onGetStarted={() => {
                    setIsLoginMode(false);
                    setShowLanding(false);
                }}
            />
        );
    }

    if (!isRegistered) {
        return (
            <div className="registration-container">
                <header className="reg-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', width: '100%', maxWidth: '420px', margin: '0 auto 0.75rem' }}>
                        <button
                            type="button"
                            className="back-to-landing-btn"
                            onClick={() => setShowLanding(true)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid #c7d2fe',
                                borderRadius: '8px',
                                padding: '0.35rem 0.75rem',
                                color: '#1b4332',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                            }}
                        >
                            ← {lang === 'kn' ? 'ಮುಖಪುಟ' : 'Back to Home'}
                        </button>
                        <div className="lang-switcher">
                            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>🇬🇧 English</button>
                            <button className={lang === 'kn' ? 'active' : ''} onClick={() => setLang('kn')}>🇮🇳 ಕನ್ನಡ</button>
                        </div>
                    </div>
                    <h1>
                        <img src={farmoraLogoMark} alt="Farmora" className="brand-mark" />
                        <span>{t('portalTitle', lang)}</span>
                    </h1>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <p className="reg-tagline">
                            <span className="reg-tagline-sparkle">✦</span>
                            <span>{t('portalSubtitle', lang)}</span>
                        </p>
                    </div>
                </header>

                <div className="registration-card glass">
                    <div className="auth-toggle">
                        <button
                            className={isLoginMode ? 'active' : ''}
                            onClick={() => setIsLoginMode(true)}
                        >
                            🔑 {t('login', lang)}
                        </button>
                        <button
                            className={!isLoginMode ? 'active' : ''}
                            onClick={() => setIsLoginMode(false)}
                        >
                            📝 {t('register', lang)}
                        </button>
                    </div>

                    {isLoginMode ? (
                        <div className="login-section">
                            <h2>{t('welcomeBack', lang)}</h2>
                            <p className="auth-subtitle">{t('loginSubtitle', lang)}</p>
                            <form onSubmit={handleLogin} className="input-form">
                                <div className="form-group">
                                    <label>{t('fullName', lang)}</label>
                                    <input
                                        type="text"
                                        placeholder={t('enterFullName', lang)}
                                        value={loginName}
                                        onChange={(e) => setLoginName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('password', lang)}</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showLoginPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                        >
                                            {showLoginPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="submit-btn" disabled={loadingLogin}>
                                    {loadingLogin ? <><span className="spinner"></span> {t('loggingIn', lang)}</> : `🔓 ${t('loginBtn', lang)}`}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="registration-section">
                            <form onSubmit={handleRegister} className="input-form">
                                <div className="form-group">
                                    <label>{t('fullName', lang)}</label>
                                    <input type="text" placeholder={t('enterFullName', lang)} value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>

                                <div className="form-group">
                                    <label>{t('phoneNumber', lang)}</label>
                                    <input type="tel" placeholder={lang === 'kn' ? '10 ಅಂಕಿಯ ಮೊಬೈಲ್' : '10-digit mobile'} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('state', lang)}</label>
                                        <select value={stateLoc} onChange={(e) => setStateLoc(e.target.value)} required>
                                            <option value="">{lang === 'kn' ? 'ರಾಜ್ಯ ಆಯ್ಕೆಮಾಡಿ' : 'Select State'}</option>
                                            {indiaStates.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{t('district', lang)}</label>
                                        <select value={district} onChange={(e) => setDistrict(e.target.value)} required disabled={!stateLoc}>
                                            <option value="">{t('selectDistrict', lang)}</option>
                                            {getDistrictsForState(stateLoc).map(d => <option key={d} value={d}>{dn(d)}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('taluk', lang)}</label>
                                        <select value={taluk} onChange={(e) => setTaluk(e.target.value)} required disabled={!district}>
                                            <option value="">{t('selectTaluk', lang)}</option>
                                            {taluksList.map(tk => <option key={tk} value={tk}>{tn(tk)}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{t('hobli', lang)}</label>
                                        <select value={hobli} onChange={(e) => setHobli(e.target.value)} required disabled={!taluk}>
                                            <option value="">{t('selectHobli', lang)}</option>
                                            {hoblisList.map(h => <option key={h} value={h}>{tn(h)}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('surveyNumber', lang)}</label>
                                        <input
                                            type="text"
                                            placeholder={lang === 'kn' ? 'ಉದಾ: 123/ಎ' : 'e.g. 123/A'}
                                            value={surveyNumber}
                                            onChange={(e) => setSurveyNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('setPassword', lang)}</label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder={lang === 'kn' ? 'ಬಲವಾದ ಪಾಸ್‌ವರ್ಡ್ ಆಯ್ಕೆಮಾಡಿ' : 'Choose a strong password'}
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="toggle-password"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? '👁️' : '👁️‍🗨️'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('landAcres', lang)}</label>
                                        <input type="number" step="0.1" placeholder={lang === 'kn' ? 'ಉದಾ: 5.5' : 'e.g. 5.5'} value={landAcres} onChange={(e) => setLandAcres(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('landGuntas', lang)}</label>
                                        <input type="number" step="1" placeholder={lang === 'kn' ? 'ಉದಾ: 100' : 'e.g. 100'} value={landGuntas} onChange={(e) => setLandGuntas(e.target.value)} required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="registration-crop">{t('currentCrop', lang)}</label>
                                    <input
                                        id="registration-crop"
                                        type="text"
                                        list="registration-crop-options"
                                        value={registrationCrop}
                                        onChange={(e) => setRegistrationCrop(e.target.value)}
                                        placeholder={lang === 'kn' ? 'ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನಮೂದಿಸಿ' : 'Select or type a crop'}
                                        autoComplete="off"
                                        required
                                    />
                                    <datalist id="registration-crop-options">
                                        {availableCrops.map(crop => (
                                            <option key={crop} value={crop} label={getCropName(crop, lang)} />
                                        ))}
                                    </datalist>
                                </div>

                                <button type="submit" className="submit-btn" disabled={loadingRegister}>
                                    {loadingRegister ? <><span className="spinner"></span> {t('registering', lang)}</> : `🌾 ${t('registerBtn', lang)}`}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="user-info">
                    <h2>{t('welcomeUser', lang)} {fn(registeredUser?.name) || t('farmer', lang)}</h2>
                </div>
                <div className="user-profile">
                    <div className="lang-switcher">
                        <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
                        <button className={lang === 'kn' ? 'active' : ''} onClick={() => setLang('kn')}>ಕನ್ನಡ</button>
                    </div>
                    <button
                        className={`header-profile-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                        title={lang === 'kn' ? 'ರೈತರ ವಿವರ ನೋಡಿ' : 'View Farmer Profile'}
                    >
                        <span>👨‍🌾</span>
                        <span className="user-badge">{fn(registeredUser?.name)}</span>
                    </button>
                    <button onClick={handleLogout} className="logout-btn">{t('logout', lang)}</button>
                </div>
            </header>

            <div className="dashboard-body">
                {/* Left Side Navigation Sidebar */}
                <aside className="dashboard-sidebar">
                    <nav className="sidebar-nav">
                        <button
                            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <img className="nav-icon nav-profile-avatar" src={profileUserIcon} alt="" />
                            <span className="nav-text">{t('tabProfile', lang)}</span>
                        </button>
                        <button
                            className={`sidebar-nav-item ${activeTab === 'recommendation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('recommendation')}
                        >
                            <span className="nav-icon">🌱</span>
                            <span className="nav-text">{t('tabCropRec', lang)}</span>
                        </button>
                        <button
                            className={`sidebar-nav-item ${activeTab === 'prices' ? 'active' : ''}`}
                            onClick={() => setActiveTab('prices')}
                        >
                            <span className="nav-icon">📈</span>
                            <span className="nav-text">{t('tabMarketPrices', lang)}</span>
                        </button>
                        <button
                            className={`sidebar-nav-item ${activeTab === 'neighbours' ? 'active' : ''}`}
                            onClick={() => setActiveTab('neighbours')}
                        >
                            <span className="nav-icon">🏘️</span>
                            <span className="nav-text">{t('tabNeighbours', lang)}</span>
                        </button>
                        {farmerHistory && (
                            <button
                                className={`sidebar-nav-item ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                            >
                                <span className="nav-icon">📊</span>
                                <span className="nav-text">{t('tabFarmAnalysis', lang)}</span>
                            </button>
                        )}
                    </nav>
                </aside>

                <main className="dashboard-content">


                {/* ===== FULL FARMER PROFILE SECTION ===== */}
                {activeTab === 'profile' && (
                    <div className="section-card profile-page-card">
                        <div className="profile-section-title-bar">
                            <div className="profile-title-left">
                                <span className="profile-title-avatar">👨‍🌾</span>
                                <div>
                                    <h2>{fn(registeredUser?.name || farmerHistory?.info?.name) || t('farmer', lang)} — {t('farmerProfileTitle', lang)}</h2>
                                    <p className="profile-title-sub">
                                        🏛️ {tn(registeredUser?.hobli || farmerHistory?.info?.hobli || 'Kasaba')}, {tn(registeredUser?.taluk || 'Taluk')}, {dn(registeredUser?.district || 'District')}, {dn(registeredUser?.state || 'Karnataka')}
                                    </p>
                                </div>
                            </div>
                            <div className="profile-title-right">
                                <span className="farmer-status-pill">✓ {lang === 'kn' ? 'ದೃಢೀಕೃತ ರೈತ ಖಾತೆ' : 'Verified Farmer Profile'}</span>
                                <button className="profile-edit-trigger-btn" onClick={startEditingProfile}>
                                    ✏️ {lang === 'kn' ? 'ಮಾಹಿತಿ ತಿದ್ದುಪಡಿ' : 'Edit Profile'}
                                </button>
                                <span className="profile-reg-id">ID: {kd(farmerHistory?.info?.id || 'FP-1001')}</span>
                            </div>
                        </div>

                        {/* Edit Profile Form / Modal */}
                        {isEditingProfile && (
                            <div className="profile-edit-card glass">
                                <div className="profile-edit-header">
                                    <div className="profile-edit-title">
                                        <span className="profile-edit-icon">✏️</span>
                                        <div>
                                            <h3>{lang === 'kn' ? 'ರೈತರ ವಿವರಗಳನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡಿ' : 'Edit Farmer Profile'}</h3>
                                            <p className="profile-edit-sub">
                                                {lang === 'kn' 
                                                    ? 'ನಿಮ್ಮ ಜಮೀನು ಮತ್ತು ಬೆಳೆಯ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ನವೀಕರಿಸಿ.' 
                                                    : 'Update your registered farm and contact details.'}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="profile-edit-close" onClick={() => setIsEditingProfile(false)}>✕</button>
                                </div>

                                <form onSubmit={handleSaveProfile} className="profile-edit-form">
                                    <div className="edit-form-grid">
                                        <div className="edit-field">
                                            <label>{t('phoneNumber', lang)}</label>
                                            <input
                                                type="tel"
                                                value={editPhone}
                                                onChange={e => setEditPhone(e.target.value)}
                                                placeholder="10-digit mobile"
                                                required
                                            />
                                        </div>

                                        <div className="edit-field">
                                            <label>{t('surveyNumber', lang)}</label>
                                            <input
                                                type="text"
                                                value={editSurvey}
                                                onChange={e => setEditSurvey(e.target.value)}
                                                placeholder="e.g. 108/A"
                                                required
                                            />
                                        </div>

                                        <div className="edit-field">
                                            <label>{t('acres', lang)}</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={editAcres}
                                                onChange={e => setEditAcres(e.target.value)}
                                                placeholder="Acres"
                                                required
                                            />
                                        </div>

                                        <div className="edit-field">
                                            <label>{t('guntas', lang)}</label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={editGuntas}
                                                onChange={e => setEditGuntas(e.target.value)}
                                                placeholder="Guntas"
                                                required
                                            />
                                        </div>

                                        <div className="edit-field">
                                            <label>{t('primaryCrop', lang)}</label>
                                            <select
                                                value={editPrimaryCrop}
                                                onChange={e => setEditPrimaryCrop(e.target.value)}
                                            >
                                                {availableCrops.map(c => (
                                                    <option key={c} value={c}>{getCropName(c, lang)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="edit-field">
                                            <label>{t('soilType', lang)}</label>
                                            <select
                                                value={editSoilType}
                                                onChange={e => setEditSoilType(e.target.value)}
                                            >
                                                <option value="Laterite Soil">{getSoilName('Laterite Soil', lang)}</option>
                                                <option value="Red Sandy Loam">{getSoilName('Red Sandy Loam', lang)}</option>
                                                <option value="Coastal Alluvium">{getSoilName('Coastal Alluvium', lang)}</option>
                                                <option value="Black Cotton Soil">{getSoilName('Black Cotton Soil', lang)}</option>
                                                <option value="Clay Loam">{getSoilName('Clay Loam', lang)}</option>
                                                <option value="Alluvial Soil">{getSoilName('Alluvial Soil', lang)}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="profile-edit-actions">
                                        <button
                                            type="button"
                                            className="edit-cancel-btn"
                                            onClick={() => setIsEditingProfile(false)}
                                            disabled={savingProfile}
                                        >
                                            {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                                        </button>
                                        <button
                                            type="submit"
                                            className="edit-save-btn"
                                            disabled={savingProfile}
                                        >
                                            {savingProfile 
                                                ? <><span className="spinner"></span> {lang === 'kn' ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving...'}</> 
                                                : `💾 ${lang === 'kn' ? 'ಉಳಿಸಿ' : 'Save Changes'}`}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Profile Info Cards Tri-Grid */}
                        <div className="profile-tri-grid">
                            {/* Card 1: Personal Information */}
                            <div className="profile-info-box glass">
                                <div className="profile-box-header">
                                    <img className="box-header-icon profile-user-icon" src={profileUserIcon} alt="" />
                                    <h4>{t('personalInfo', lang)}</h4>
                                </div>
                                <div className="profile-kv-list">
                                    <div className="profile-kv-row">
                                        <span className="profile-k">{t('fullName', lang)}</span>
                                        <span className="profile-v font-bold">{fn(registeredUser?.name || farmerHistory?.info?.name) || t('farmer', lang)}</span>
                                    </div>
                                    <div className="profile-kv-row">
                                        <span className="profile-k">{t('phoneNumber', lang)}</span>
                                        <span className="profile-v">{registeredUser?.phone_number ? kd(registeredUser.phone_number) : (farmerHistory?.info?.phone ? kd(farmerHistory.info.phone) : t('notProvided', lang))}</span>
                                    </div>
                                    <div className="profile-kv-row">
                                        <span className="profile-k">{t('surveyNumber', lang)}</span>
                                        <span className="profile-v chip-highlight">{kd(registeredUser?.survey_number || farmerHistory?.info?.survey_number || '108/A')}</span>
                                    </div>
                                    <div className="profile-kv-row">
                                        <span className="profile-k">{t('state', lang)}</span>
                                        <span className="profile-v">{dn(registeredUser?.state || 'Karnataka')}</span>
                                    </div>
                                    <div className="profile-kv-row">
                                        <span className="profile-k">{t('district', lang)}</span>
                                        <span className="profile-v">{dn(registeredUser?.district || farmerHistory?.info?.district || 'Dakshina Kannada')}</span>
                                    </div>
                                    <div className="profile-kv-row">
                                        <span className="profile-k">{t('taluk', lang)}</span>
                                        <span className="profile-v">{tn(registeredUser?.taluk || farmerHistory?.info?.taluk || 'Mangaluru')}</span>
                                    </div>
                                    <div className="profile-kv-row">
                                        <span className="profile-k">{t('hobli', lang)}</span>
                                        <span className="profile-v">{tn(registeredUser?.hobli || farmerHistory?.info?.hobli || 'Kasaba')}</span>
                                    </div>
                                    <div className="profile-kv-row total-land-row">
                                        <span className="profile-k">{t('totalLandArea', lang)}</span>
                                        <span className="profile-v land-val">
                                            {kd(registeredUser?.land_area_acres ?? farmerHistory?.info?.acres ?? 0)} {t('acres', lang)}, {kd(registeredUser?.land_area_guntas ?? farmerHistory?.info?.guntas ?? 0)} {t('guntas', lang)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Previous Crop Grown */}
                            <div className="profile-info-box glass">
                                <div className="profile-box-header">
                                    <span className="box-header-icon">🌱</span>
                                    <h4>{t('previousCropsTitle', lang)}</h4>
                                    {isRegistered && (
                                        <button
                                            type="button"
                                            className="crop-history-add-btn"
                                            onClick={() => openCropHistoryForm()}
                                        >
                                            {t('addCropHistory', lang)}
                                        </button>
                                    )}
                                </div>
                                {farmerHistory?.info?.previous_crops?.length ? (
                                    <div className="chips-row">
                                        {farmerHistory.info.previous_crops.map((crop: string) => (
                                            <span key={crop} className="yield-mini-chip">
                                                {getCropIcon(crop, '🌿')} {getCropName(crop, lang)}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    cropHistoryRecords.length === 0 && (
                                        <p className="spotlight-sec">{t('noPreviousCrops', lang)}</p>
                                    )
                                )}

                                {cropHistoryError && (
                                    <p className="crop-history-error" role="alert">{cropHistoryError}</p>
                                )}

                                {cropHistoryRecords.length > 0 && (
                                    <div className="crop-history-preview">
                                        {cropHistoryRecords.slice(0, 3).map(record => (
                                            <article key={record.id} className="crop-history-record">
                                                <div className="crop-history-record-main">
                                                    <strong>{kd(record.year)} · {getCropName(record.crop_name, lang)}</strong>
                                                    <span>{record.season} · {kd(record.cultivated_area_acres)} {t('acres', lang)} · {kd(record.yield_quantity)} {record.yield_unit}</span>
                                                    <span>{getSoilName(record.soil_type, lang)} · pH {kd(record.soil_ph)} · {record.irrigation_type}</span>
                                                    {record.profit !== null && (
                                                        <span>₹{kd(record.profit.toLocaleString('en-IN'))} {t('cropHistoryProfit', lang).split(' (')[0]}</span>
                                                    )}
                                                </div>
                                                {isRegistered && (
                                                    <div className="crop-history-record-actions">
                                                        <button type="button" onClick={() => openCropHistoryForm(record)}>{t('cropHistoryEdit', lang)}</button>
                                                        <button type="button" onClick={() => handleDeleteCropHistory(record.id)}>{t('cropHistoryDelete', lang)}</button>
                                                    </div>
                                                )}
                                            </article>
                                        ))}
                                        <button
                                            type="button"
                                            className="crop-history-view-btn"
                                            onClick={() => setActiveTab('history')}
                                        >
                                            {t('viewFullHistory', lang)}
                                            {cropHistoryRecords.length > 3 && ` (${kd(cropHistoryRecords.length)})`}
                                        </button>
                                    </div>
                                )}

                                <div className="profile-soil-specs">
                                    <div className="soil-spec-item">
                                        <span className="soil-spec-icon">🏔️</span>
                                        <div>
                                            <span className="spec-lbl">{t('soilType', lang)}</span>
                                            <span className="spec-txt">{getSoilName(soilData?.soil_type || farmerHistory?.info?.soil_type || 'Laterite Soil', lang)}</span>
                                        </div>
                                    </div>
                                    <div className="soil-spec-item">
                                        <span className="soil-spec-icon">🧪</span>
                                        <div>
                                            <span className="spec-lbl">{t('avgPH', lang)}</span>
                                            <span className="spec-txt">{kd(farmerHistory?.info?.ph || soilData?.ph || '6.2')}</span>
                                        </div>
                                    </div>
                                    <div className="soil-spec-item">
                                        <span className="soil-spec-icon">⚖️</span>
                                        <div>
                                            <span className="spec-lbl">{t('estYield', lang)}</span>
                                            <span className="spec-txt">
                                                {farmerHistory?.history && farmerHistory.history.length > 0 
                                                    ? `${kd(farmerHistory.history[farmerHistory.history.length - 1].yield)} ${fu(farmerHistory.history[farmerHistory.history.length - 1].unit || 'kg')}` 
                                                    : `${kd('24.5')} ${fu('Quintals')}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {farmerHistory?.history && farmerHistory.history.length > 0 && (
                                    <div className="history-yield-strip">
                                        <span className="strip-title">📅 {t('fiveYearCultivationYields', lang)}:</span>
                                        <div className="chips-row">
                                            {farmerHistory.history.map(item => (
                                                <span key={item.year} className="yield-mini-chip">
                                                    <strong>{kd(item.year)}:</strong> {kd(item.yield)} {fu(item.unit)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card 3: Financial Estimations */}
                            <div className="profile-info-box glass">
                                <div className="profile-box-header">
                                    <span className="box-header-icon">📈</span>
                                    <h4>{t('estimationsTitle', lang)}</h4>
                                </div>
                                {(() => {
                                    const latest = farmerHistory?.history && farmerHistory.history.length > 0 
                                        ? farmerHistory.history[farmerHistory.history.length - 1] 
                                        : null;
                                    const rev = latest?.revenue || 832472;
                                    const cost = latest?.input_cost || 372378;
                                    const profit = latest?.profit || 460094;
                                    const ppa = latest?.profit_per_acre || 41080;
                                    const margin = rev > 0 ? Math.round((profit / rev) * 100) : 55;

                                    return (
                                        <>
                                            <div className="profile-finance-cards">
                                                <div className="finance-card rev">
                                                    <span className="finance-title">{t('estRevenue', lang)}</span>
                                                    <span className="finance-amount">₹{kd(rev.toLocaleString('en-IN'))}</span>
                                                    <span className="finance-footnote">{t('grossAnnualRevenue', lang)}</span>
                                                </div>
                                                <div className="finance-card cost">
                                                    <span className="finance-title">{t('estInputCost', lang)}</span>
                                                    <span className="finance-amount">₹{kd(cost.toLocaleString('en-IN'))}</span>
                                                    <span className="finance-footnote">{t('farmOperationalCost', lang)}</span>
                                                </div>
                                                <div className="finance-card profit">
                                                    <span className="finance-title">{t('estNetProfit', lang)}</span>
                                                    <span className="finance-amount">₹{kd(profit.toLocaleString('en-IN'))}</span>
                                                    <span className="finance-footnote">{t('estimatedNetReturns', lang)}</span>
                                                </div>
                                                <div className="finance-card ppa">
                                                    <span className="finance-title">{t('estProfitPerAcre', lang)}</span>
                                                    <span className="finance-amount">₹{kd(ppa.toLocaleString('en-IN'))}</span>
                                                    <span className="finance-footnote">{lang === 'kn' ? `ಲಾಭದ ಪ್ರಮಾಣ: ~${kd(margin)}%` : `Margin: ~${margin}% ROI`}</span>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== CROP RECOMMENDATION ===== */}
                {activeTab === 'recommendation' && (
                    <div className="section-card">
                        {!showCropResults ? (
                            <>
                                <h3>{t('cropRecTitle', lang)}</h3>

                                {/* Currently Growing Crop Section */}
                                <div className="current-crop-section" style={{
                                    background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(6, 182, 212, 0.06))',
                                    border: '1px solid rgba(167, 139, 250, 0.15)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '1.25rem 1.5rem',
                                    marginBottom: '1rem',
                                    animation: 'fadeIn 0.5s ease-out'
                                }}>
                                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                                        {t('currentlyGrowing', lang)}
                                    </h4>
                                    {farmerHistory?.info?.primary_crop ? (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem 1.25rem',
                                            background: 'rgba(52, 211, 153, 0.08)',
                                            border: '1.5px solid rgba(52, 211, 153, 0.20)',
                                            borderRadius: 'var(--radius-md)',
                                        }}>
                                            <span style={{ fontSize: '2.5rem' }}>{getCropIcon(farmerHistory.info.primary_crop, '🌿')}</span>
                                            <div>
                                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                                                    {t('activeCrop', lang)}
                                                </span>
                                                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)', margin: 0 }}>
                                                    {getCropName(farmerHistory.info.primary_crop, lang)}
                                                </p>
                                                {farmerHistory.info.secondary_crop && farmerHistory.info.secondary_crop !== 'None' && (
                                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                        + {getCropName(farmerHistory.info.secondary_crop, lang)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '1rem 1.25rem',
                                            background: 'rgba(248, 113, 113, 0.06)',
                                            border: '1.5px dashed rgba(248, 113, 113, 0.20)',
                                            borderRadius: 'var(--radius-md)',
                                        }}>
                                            <span style={{ fontSize: '2rem' }}>🚫</span>
                                            <div>
                                                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger)', margin: 0 }}>
                                                    {t('noCropsGrowing', lang)}
                                                </p>
                                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                                    {lang === 'kn' ? 'ಕೆಳಗೆ ಎಐ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ' : 'Get AI recommendations below to find the best crop for your land'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="weather-card">
                                    <div className="weather-header">
                                        <h4>{t('liveWeather', lang)} — {tn(weatherData?.location || registeredUser?.taluk || '')}</h4>
                                        {weatherData && (weatherData.source.includes('Open-Meteo') || weatherData.source === 'OpenWeatherMap API') && <span className="live-badge">● {t('openMeteoLive', lang)}</span>}
                                        {weatherData?.source === 'fallback' && <span className="fallback-badge">{t('regionalDefaults', lang)}</span>}
                                        <button className="refresh-weather-btn" onClick={() => fetchWeather(registeredUser?.taluk || 'Mangalore')} disabled={loadingWeather}>
                                            {loadingWeather ? '⏳' : '🔄'} {t('refresh', lang)}
                                        </button>
                                    </div>
                                    {loadingWeather ? (
                                        <div className="weather-loading"><span className="spinner"></span> {t('climateSoilLoading', lang)}</div>
                                    ) : weatherData ? (
                                        <div className="weather-grid-detailed">
                                            <div className="parameter-card">
                                                <div className="parameter-icon">🌡️</div>
                                                <div className="parameter-info">
                                                    <span className="parameter-label">{t('temperature', lang)}</span>
                                                    <span className="parameter-value">{kd(weatherData.temperature)}°C</span>
                                                    <span className="parameter-source">{weatherData.source}</span>
                                                </div>
                                            </div>
                                            <div className="parameter-card">
                                                <div className="parameter-icon">💧</div>
                                                <div className="parameter-info">
                                                    <span className="parameter-label">{t('humidity', lang)}</span>
                                                    <span className="parameter-value">{kd(weatherData.humidity)}%</span>
                                                    <span className="parameter-source">{weatherData.source}</span>
                                                </div>
                                            </div>
                                            <div className="parameter-card">
                                                <div className="parameter-icon">🌧️</div>
                                                <div className="parameter-info">
                                                    <span className="parameter-label">{t('rainAnnual', lang)}</span>
                                                    <span className="parameter-value">{kd(weatherData.rainfall)} {fu('mm')}</span>
                                                    <span className="parameter-source">{t('annualAverage', lang)}</span>
                                                </div>
                                            </div>
                                            {weatherData.rain_today !== undefined && (
                                                <div className="parameter-card">
                                                    <div className="parameter-icon">☔</div>
                                                    <div className="parameter-info">
                                                        <span className="parameter-label">{t('rainToday', lang)}</span>
                                                        <span className="parameter-value">{kd(weatherData.rain_today)} {fu('mm')}</span>
                                                        <span className="parameter-source">{t('forecast', lang)}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {weatherData.rain_current !== undefined && (
                                                <div className="parameter-card">
                                                    <div className="parameter-icon">🌦️</div>
                                                    <div className="parameter-info">
                                                        <span className="parameter-label">{t('rainCurrent', lang)}</span>
                                                        <span className="parameter-value">{kd(weatherData.rain_current)} {fu('mm/h')}</span>
                                                        <span className="parameter-source">{t('liveHour', lang)}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {soilData && (
                                                <>
                                                    <div className="parameter-card">
                                                        <div className="parameter-icon">🧪</div>
                                                        <div className="parameter-info">
                                                            <span className="parameter-label">{t('avgPH', lang)}</span>
                                                            <span className="parameter-value">{kd(soilData.ph)} pH</span>
                                                            <span className="parameter-source">{t('rtcRecord', lang)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="parameter-card">
                                                        <div className="parameter-icon">🏔️</div>
                                                        <div className="parameter-info">
                                                            <span className="parameter-label">{t('soilType', lang)}</span>
                                                            <span className="parameter-value" style={{ fontSize: '0.9rem' }}>
                                                                {getSoilName(soilData.soil_type, lang)}
                                                            </span>
                                                            <span className="parameter-source">{t('rtcRecord', lang)}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {soilData?.temperature !== undefined && (
                                                <div className="parameter-card">
                                                    <div className="parameter-icon">🌡️</div>
                                                    <div className="parameter-info">
                                                        <span className="parameter-label">{t('soilTemp', lang)}</span>
                                                        <span className="parameter-value">{kd(soilData.temperature)}°C</span>
                                                        <span className="parameter-source">{t('openMeteo07', lang)}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {soilData?.moisture !== undefined && (
                                                <div className="parameter-card">
                                                    <div className="parameter-icon">💦</div>
                                                    <div className="parameter-info">
                                                        <span className="parameter-label">{t('soilMoisture', lang)}</span>
                                                        <span className="parameter-value">{kd(soilData.moisture)}%</span>
                                                        <span className="parameter-source">{t('openMeteoVolumetric', lang)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                {/* Soil Card */}
                                <div className="soil-card" style={{ display: 'none' }}>
                                    <h4>{t('soilDataTitle', lang)}</h4>
                                    <div className="soil-details">
                                        <div className="soil-item">
                                            <span className="soil-label">{t('soilType', lang)}</span>
                                            <span className="soil-value">{getSoilName(soilData?.soil_type || 'Laterite', lang)}</span>
                                        </div>
                                        <div className="soil-item">
                                            <span className="soil-label">{t('avgPH', lang)}</span>
                                            <span className="soil-value">{soilData?.ph || '6.2'}</span>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleCropRecommendation} className="submit-btn" disabled={loadingCropRec || loadingWeather}>
                                    {loadingCropRec ? <><span className="spinner"></span> {t('analyzing', lang)}</> : t('getCropRecBtn', lang)}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="result-header">
                                    <h3>{t('recommendedCropsTitle', lang)}</h3>
                                    <button className="back-btn" onClick={resetCropResults}>{t('backBtn', lang)}</button>
                                </div>
                                {recommendations?.soil_data?.weather_source === 'OpenWeatherMap API' && (
                                    <p className="weather-source-note">📡 {lang === 'kn' ? 'ಲೈವ್ ಹವಾಮಾನ ಮಾಹಿತಿ' : 'Weather data sourced live from OpenWeatherMap for'} {dn(weatherData?.location || '')}</p>
                                )}
                                <div className="crop-grid">
                                    {recommendations?.recommended_crops.map((item: any, index: number) => {
                                        const cropName = typeof item === 'string' ? item : item.crop;
                                        const cropPrice = typeof item === 'string' ? t('checkMarket', lang) : (item.price_range || item.price);
                                        const trend = typeof item === 'string' ? 'stable' : item.trend;
                                        const varietiesList = item.varieties || [];
                                        const isExpanded = expandedSpeciesCrop === cropName;

                                        return (
                                            <div key={cropName} className={`crop-card ${isExpanded ? 'crop-card-expanded' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                                                <div className="crop-card-header">
                                                    <span className="crop-icon">{getCropIcon(cropName, '🌿')}</span>
                                                    <span className={`trend ${trend}`}>
                                                        {trend === 'up' ? t('trendRising', lang) : trend === 'down' ? t('trendFalling', lang) : t('trendStable', lang)}
                                                    </span>
                                                </div>
                                                <h4>{getCropName(cropName, lang)}</h4>
                                                {item.botanical_genus && (
                                                    <span className="crop-genus-tag">{item.botanical_genus}</span>
                                                )}
                                                <p className="crop-price">{cropPrice === 'Check Market' ? t('checkMarket', lang) : kd(cropPrice)}</p>
                                                
                                                {/* Best Variety Recommendation Box */}
                                                {item.best_variety && (
                                                    <div className="card-best-variety-badge" onClick={() => openVarietyModal(cropName)} title={t('clickToViewCultivar', lang)}>
                                                        <div className="best-var-text">
                                                            <span className="best-var-label">{t('bestForYourLand', lang)}</span>
                                                            <strong>{item.best_variety.name} • {kd(item.best_variety.suitability_score)}% {t('match', lang)}</strong>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Top Varieties Preview Chips */}
                                                {item.top_varieties && item.top_varieties.length > 0 && (
                                                    <div className="top-varieties-strip">
                                                        <span className="strip-title">{t('topVarietiesLabel', lang)}:</span>
                                                        <div className="strip-chips">
                                                            {item.top_varieties.map((tv: CropVariety) => (
                                                                <span key={tv.name} className="mini-variety-pill" onClick={() => openVarietyModal(cropName)}>
                                                                    {tv.name} <small>{kd(tv.suitability_score)}%</small>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {varietiesList.length > 0 && (
                                                    <div className="card-species-actions">
                                                        <div className="species-actions-buttons">
                                                            <button 
                                                                type="button" 
                                                                className="species-toggle-btn"
                                                                onClick={() => setExpandedSpeciesCrop(isExpanded ? null : cropName)}
                                                            >
                                                                {isExpanded ? t('hideSpecies', lang) : `${t('viewSpecies', lang)} (${kd(varietiesList.length)})`}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="species-modal-open-btn"
                                                                onClick={() => openVarietyModal(cropName)}
                                                            >
                                                                {t('exploreVarietiesBtn', lang)}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Expandable Species & Varieties Drawer */}
                                                {isExpanded && varietiesList.length > 0 && (
                                                    <div className="card-species-drawer">
                                                        <div className="drawer-header-row">
                                                            <div>
                                                                <h6>{t('cropSpeciesTitle', lang)}</h6>
                                                                <span className="drawer-crop-subtitle">{varietiesList.length} {lang === 'kn' ? 'ದೃಢೀಕರಿಸಿದ ತಳಿಗಳು' : 'verified cultivars for this zone'}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="drawer-showcase-btn"
                                                                onClick={() => openVarietyModal(cropName)}
                                                            >
                                                                {t('exploreVarietiesBtn', lang)}
                                                            </button>
                                                        </div>
                                                        <div className="drawer-species-list">
                                                            {varietiesList.map((v: CropVariety) => (
                                                                <div key={v.name} className="drawer-variety-card">
                                                                    {/* Variety Image Thumbnail & Header */}
                                                                    <div className="drawer-variety-top">
                                                                        <div className="drawer-thumb-wrap">
                                                                            <img
                                                                                src={v.image_url || item.crop_image}
                                                                                alt={`${getCropName(cropName, lang)} - ${v.name}`}
                                                                                className="drawer-variety-img"
                                                                                onError={(event) => {
                                                                                    event.currentTarget.style.display = 'none';
                                                                                }}
                                                                            />
                                                                            {v.image_credit && v.image_source && (
                                                                                <a
                                                                                    className="variety-image-credit"
                                                                                    href={v.image_source}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    aria-label={`Photo credit: ${v.image_credit}`}
                                                                                    title={v.image_credit}
                                                                                >
                                                                                    {v.image_credit}
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                        <div className="drawer-variety-info-head">
                                                                            <div className="drawer-name-row">
                                                                                <strong className="drawer-var-name">{v.name}</strong>
                                                                                <span className="drawer-var-price">{v.price_display || `₹${v.price}/${item.unit || 'q'}`}</span>
                                                                            </div>
                                                                            {v.scientific_species && (
                                                                                <span className="drawer-sci-species">{v.scientific_species}</span>
                                                                            )}
                                                                            {v.suitability_score !== undefined && (
                                                                                <div className="drawer-suitability-line">
                                                                                    <span className="suitability-chip">
                                                                                        {v.suitability_score}% {t('match', lang)}
                                                                                    </span>
                                                                                    <div className="suitability-progress-track">
                                                                                        <div className="suitability-progress-bar" style={{ width: `${v.suitability_score}%` }}></div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {/* Match highlights */}
                                                                    {v.match_highlights && v.match_highlights.length > 0 && (
                                                                        <div className="drawer-match-reasons">
                                                                            {v.match_highlights.slice(0, 3).map((r, rIdx) => (
                                                                                <span key={rIdx} className="drawer-reason-chip">{r}</span>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Agronomic Specifications Grid */}
                                                                    <div className="drawer-specs-grid">
                                                                        <div className="drawer-spec-cell">
                                                                            <span className="cell-label">{t('soilAndPH', lang)}:</span>
                                                                            <span className="cell-value">{v.soil_type || 'Loamy'} {v.soil_ph_range ? `(pH ${v.soil_ph_range[0]}-${v.soil_ph_range[1]})` : ''}</span>
                                                                        </div>
                                                                        <div className="drawer-spec-cell">
                                                                            <span className="cell-label">{t('climate', lang)}:</span>
                                                                            <span className="cell-value">{v.min_temp}°C - {v.max_temp}°C | {v.rainfall_range?.[0]}-{v.rainfall_range?.[1]}mm</span>
                                                                        </div>
                                                                        <div className="drawer-spec-cell">
                                                                            <span className="cell-label">{t('season', lang)}:</span>
                                                                            <span className="cell-value">{v.growing_months || v.season}</span>
                                                                        </div>
                                                                        <div className="drawer-spec-cell">
                                                                            <span className="cell-label">{t('maturity', lang)}:</span>
                                                                            <span className="cell-value">{v.maturity_period || `${v.duration_days} ${t('days', lang)}`}</span>
                                                                        </div>
                                                                        <div className="drawer-spec-cell">
                                                                            <span className="cell-label">{t('yield', lang)}:</span>
                                                                            <span className="cell-value highlight-cell">{v.expected_yield || `${v.yield_per_acre} ${item.unit || 'q'}/acre`}</span>
                                                                        </div>
                                                                    </div>

                                                                    {v.characteristics && (
                                                                        <p className="drawer-var-desc">{v.characteristics}</p>
                                                                    )}

                                                                    <div className="drawer-card-actions">
                                                                        <button
                                                                            type="button"
                                                                            className="drawer-calc-action-btn"
                                                                            onClick={() => {
                                                                                setSelectedCrop(cropName);
                                                                                setSelectedVariety(v.name);
                                                                                setActiveTab('prices');
                                                                                setShowMarketResult(true);
                                                                                setSelectedMarketResult({ crop: cropName, price: v.price_display || `₹${v.price}`, trend: 'stable' });
                                                                                fetchCropSpecies(cropName);
                                                                                setTimeout(() => {
                                                                                    const el = document.getElementById('profit-estimator-box');
                                                                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                                                }, 200);
                                                                            }}
                                                                        >
                                                                            {t('selectVarietyForProfit', lang)}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="drawer-detail-action-btn"
                                                                            onClick={() => openVarietyModal(cropName)}
                                                                        >
                                                                            {t('exploreVarietiesBtn', lang)}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ===== MARKET RATE PREDICTION ===== */}
                {activeTab === 'prices' && (
                    <div className="section-card">
                        {!showMarketResult ? (
                            <>
                                <h3>{t('marketRatesTitle', lang)}</h3>
                                <p className="section-description">{t('marketRatesDesc', lang)}</p>

                                {/* District Selector */}
                                <div className="district-selector">
                                    <label htmlFor="district-select">{t('selectKarnatakaDistrict', lang)}</label>
                                    <div className="district-select-row">
                                        <select
                                            id="district-select"
                                            value={selectedDistrict}
                                            onChange={(e) => {
                                                setSelectedDistrict(e.target.value);
                                                fetchLiveMarketPrices(e.target.value);
                                            }}
                                        >
                                            <option value="">{t('allKarnataka', lang)}</option>
                                            {getDistrictsForState(registeredUser?.state || 'Karnataka').map(d => (
                                                <option key={d} value={d}>{dn(d)}</option>
                                            ))}
                                        </select>
                                        {selectedDistrict === registeredUser?.district && (
                                            <span className="your-district-badge">{t('yourDistrict', lang)}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Live Market Prices Table */}
                                {loadingLiveMarket && (
                                    <div className="weather-loading"><span className="spinner"></span> {t('fetchingLiveMarket', lang)}</div>
                                )}

                                {!loadingLiveMarket && liveMarketData && liveMarketData.records.length > 0 && (
                                    <div className="live-market-section">
                                        <div className="live-market-header">
                                            <h4>🏪 {t('liveAPMCTable', lang)} — {dn(liveMarketData.requested_district || '') || t('allKarnataka', lang)}</h4>
                                            <div className="live-market-meta">
                                                <span className="live-badge">● {t('liveBadge', lang)}</span>
                                                <span className="data-source-badge">{t('dataSourceGov', lang)}</span>
                                                <span className="record-count">{kd(liveMarketData.total)} {t('commoditiesCount', lang)}</span>
                                            </div>
                                        </div>
                                        <div className="live-table-wrapper">
                                            <table className="live-market-table">
                                                <thead>
                                                    <tr>
                                                        <th>{t('apmcMarket', lang)}</th>
                                                        <th>{t('commodity', lang)}</th>
                                                        <th>{t('variety', lang)}</th>
                                                        <th className="price-th">{t('minPrice', lang)}</th>
                                                        <th className="price-th">{t('maxPrice', lang)}</th>
                                                        <th className="price-th modal-th">{t('modalPrice', lang)}</th>
                                                        <th>{t('date', lang)}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {liveMarketData.records.map((rec, idx) => (
                                                        <tr key={`${rec.market}-${rec.commodity}-${idx}`} className="live-row">
                                                            <td className="market-name-cell">{tn(rec.market)}</td>
                                                            <td className="commodity-cell">{getCropName(rec.commodity, lang)}</td>
                                                            <td className="variety-cell">{rec.variety}</td>
                                                            <td className="price-cell min">₹{kd(Number(rec.min_price).toLocaleString('en-IN'))}</td>
                                                            <td className="price-cell max">₹{kd(Number(rec.max_price).toLocaleString('en-IN'))}</td>
                                                            <td className="price-cell modal">₹{kd(Number(rec.modal_price).toLocaleString('en-IN'))}</td>
                                                            <td className="date-cell">{kd(rec.arrival_date)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {!loadingLiveMarket && liveMarketData && liveMarketData.records.length === 0 && (
                                    <div className="no-data-card">
                                        <span className="no-data-icon">📭</span>
                                        <h4>{t('noMarketDataToday', lang)}</h4>
                                        <p>{t('noMarketDataDesc', lang)}</p>
                                    </div>
                                )}

                                {/* Crop Selection */}
                                <h4 className="select-crop-title">{t('selectCropDetailed', lang)}</h4>
                                <form onSubmit={handleMarketPrediction} className="input-form">
                                    <div className="crop-select-grid">
                                        {availableCrops.map(crop => (
                                            <div key={crop} className={`crop-select-card ${selectedCrop === crop ? 'selected' : ''}`} onClick={() => setSelectedCrop(crop)}>
                                                <span className="crop-select-icon">{getCropIcon(crop, '🌿')}</span>
                                                <span className="crop-select-name">{getCropName(crop, lang)}</span>
                                                {selectedCrop === crop && <span className="check-mark">✓</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <button type="submit" className="submit-btn" disabled={!selectedCrop || loadingMarket}>
                                        {loadingMarket ? <><span className="spinner"></span> {t('calculating', lang)}</> : t('getMarketRateBtn', lang)}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="result-header">
                                    <h3>💰 {t('marketRatesTitle', lang)}</h3>
                                    <button className="back-btn" onClick={resetMarketForm}>{t('selectAnotherCrop', lang)}</button>
                                </div>

                                {selectedMarketResult && (
                                    <div className="market-result-card">
                                        <div className="market-result-main">
                                            <div className="market-crop-name">
                                                <span className="market-crop-emoji">{getCropIcon(selectedMarketResult.crop, '🌿')}</span>
                                                <h2>{getCropName(selectedMarketResult.crop, lang)}</h2>
                                            </div>
                                            <div className="market-price-display">
                                                <span className="market-price-label">{t('currentMarketRate', lang)}</span>
                                                <span className="market-price-value">{kd(selectedMarketResult.price)}</span>
                                                <span className={`market-trend ${selectedMarketResult.trend}`}>
                                                    {selectedMarketResult.trend === 'up' ? `📈 ${t('priceTrendingUp', lang)}`
                                                        : selectedMarketResult.trend === 'down' ? `📉 ${t('priceTrendingDown', lang)}`
                                                            : `📊 ${t('priceStable', lang)}`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="market-advice">
                                            {selectedMarketResult.trend === 'up' && (
                                                <p className="advice-text up">✅ <strong>{t('goodTimeToSellNotice', lang)}</strong></p>
                                            )}
                                            {selectedMarketResult.trend === 'down' && (
                                                <p className="advice-text down">⚠️ <strong>{t('considerHoldingNotice', lang)}</strong></p>
                                            )}
                                            {selectedMarketResult.trend === 'stable' && (
                                                <p className="advice-text stable">ℹ️ <strong>{t('marketStableNotice', lang)}</strong></p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Species & Varieties Live Catalog for Selected Crop */}
                                {selectedMarketResult && (
                                    <div className="crop-species-section" id="crop-species-catalog">
                                        <div className="species-section-header">
                                            <div>
                                                <h4>{getCropName(selectedMarketResult.crop, lang)} — {t('cropSpeciesTitle', lang)}</h4>
                                                <p className="species-section-subtitle">
                                                    {speciesDataMap[selectedMarketResult.crop]?.botanical_genus && (
                                                        <span><strong>{t('botanicalGenus', lang)}:</strong> <em>{speciesDataMap[selectedMarketResult.crop]?.botanical_genus}</em> • </span>
                                                    )}
                                                    <span>{kd(speciesDataMap[selectedMarketResult.crop]?.varieties_count || 0)} {t('varietiesAvailable', lang)}</span>
                                                    {speciesDataMap[selectedMarketResult.crop]?.price_range && (
                                                        <span> • {t('priceRangeLabel', lang)}: <strong className="range-highlight">{kd(speciesDataMap[selectedMarketResult.crop]?.price_range?.display)}</strong></span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {loadingSpeciesCrop === selectedMarketResult.crop ? (
                                            <div className="weather-loading"><span className="spinner"></span> {t('loadingSpecies', lang)}</div>
                                        ) : (
                                            <div className="species-grid">
                                                {(speciesDataMap[selectedMarketResult.crop]?.varieties || []).map((v, vIdx) => {
                                                    const isSelectedVar = selectedVariety === v.name;
                                                    return (
                                                        <div key={v.name} className={`species-card ${isSelectedVar ? 'selected-species-card' : ''}`}>
                                                            {/* Variety Photo */}
                                                            <div className="species-card-img-wrap">
                                                                <img
                                                                    src={v.image_url || speciesDataMap[selectedMarketResult.crop]?.crop_image || ''}
                                                                    alt={`${getCropName(selectedMarketResult.crop, lang)} - ${v.name}`}
                                                                    className="species-thumb-img"
                                                                    onError={(event) => {
                                                                        event.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                                {v.image_credit && v.image_source && (
                                                                    <a
                                                                        className="variety-image-credit"
                                                                        href={v.image_source}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        aria-label={`Photo credit: ${v.image_credit}`}
                                                                        title={v.image_credit}
                                                                    >
                                                                        {v.image_credit}
                                                                    </a>
                                                                )}
                                                                {v.suitability_score !== undefined && (
                                                                    <span className="species-card-match-pill">
                                                                        {v.suitability_score}% {t('match', lang)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="species-card-top">
                                                                <div className="species-name-group">
                                                                    <span className="species-index-pill">#{vIdx + 1}</span>
                                                                    <h5 className="species-title">{v.name}</h5>
                                                                </div>
                                                                <span className="species-price-badge">
                                                                    {v.price_display || `₹${v.price.toLocaleString('en-IN')}/${speciesDataMap[selectedMarketResult.crop]?.unit || 'quintal'}`}
                                                                </span>
                                                            </div>

                                                            {v.scientific_species && (
                                                                <span className="species-scientific-name">{v.scientific_species}</span>
                                                            )}

                                                            {/* Agronomic Quick Specs */}
                                                            <div className="species-agri-specs">
                                                                <div className="spec-mini-tag"><strong>{t('soilAndPH', lang)}:</strong> {v.soil_type ? v.soil_type.split(',')[0] : 'Alluvial/Loam'} {v.soil_ph_range ? `(pH ${v.soil_ph_range[0]}-${v.soil_ph_range[1]})` : ''}</div>
                                                                <div className="spec-mini-tag"><strong>{t('climate', lang)}:</strong> {v.min_temp}°C - {v.max_temp}°C | {v.rainfall_range?.[0]}-{v.rainfall_range?.[1]}mm</div>
                                                                <div className="spec-mini-tag"><strong>{t('maturity', lang)}:</strong> {v.maturity_period || `${v.duration_days} ${t('days', lang)}`}</div>
                                                                <div className="spec-mini-tag"><strong>{t('yield', lang)}:</strong> {v.expected_yield || `${v.yield_per_acre} ${speciesDataMap[selectedMarketResult.crop]?.unit || 'q'}/acre`}</div>
                                                            </div>

                                                            {v.characteristics && (
                                                                <p className="species-characteristics">{v.characteristics}</p>
                                                            )}

                                                            <div className="species-card-actions-row">
                                                                <button 
                                                                    type="button" 
                                                                    className={`select-variety-btn ${isSelectedVar ? 'active-variety-btn' : ''}`}
                                                                    onClick={() => {
                                                                        setSelectedVariety(isSelectedVar ? '' : v.name);
                                                                        const formEl = document.getElementById('profit-estimator-box');
                                                                        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                                                                    }}
                                                                >
                                                                    {isSelectedVar ? t('selected', lang) : t('selectVarietyForProfit', lang)}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="species-guide-btn"
                                                                    onClick={() => openVarietyModal(selectedMarketResult.crop)}
                                                                >
                                                                    {t('exploreVarietiesBtn', lang)}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Profit Calculator */}
                                <div className="profit-calculator" id="profit-estimator-box">
                                    <h4>{t('profitCalcTitle', lang)}</h4>
                                    <p className="profit-desc">{t('profitCalcDesc', lang)}</p>
                                    <form onSubmit={handleProfitEstimate} className="profit-form">
                                        <div className="form-group">
                                            <label>{t('surveyNumber', lang)}</label>
                                            <input type="text" value={calcSurveyNumber} onChange={(e) => setCalcSurveyNumber(e.target.value)} placeholder={registeredUser?.survey_number || t('profitSurveyPlaceholder', lang)} className="form-input" />
                                        </div>

                                        {/* Variety / Species Selector */}
                                        <div className="form-group">
                                            <label>{t('varietySelectorLabel', lang)}</label>
                                            <select
                                                value={selectedVariety}
                                                onChange={(e) => setSelectedVariety(e.target.value)}
                                                className="form-input variety-dropdown"
                                            >
                                                <option value="">-- {t('defaultVarietyOption', lang)} ({getCropName(selectedMarketResult?.crop || selectedCrop, lang)}) --</option>
                                                {(speciesDataMap[selectedMarketResult?.crop || selectedCrop]?.varieties || []).map((v) => (
                                                    <option key={v.name} value={v.name}>
                                                        {v.name} — {v.price_display || `₹${v.price}/${speciesDataMap[selectedMarketResult?.crop || selectedCrop]?.unit}`} ({v.duration_days} {t('days', lang)}, {v.yield_per_acre} {speciesDataMap[selectedMarketResult?.crop || selectedCrop]?.unit}/acre)
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedVariety && (
                                                <div className="variety-selection-notice">
                                                    🎯 {t('profitEstimationBanner', lang)} <strong>{selectedVariety}</strong>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>{t('acres', lang)}</label>
                                                <input type="number" value={calcAcres} onChange={(e) => setCalcAcres(e.target.value)} placeholder={kd(registeredUser?.land_area_acres ?? 0)} className="form-input" />
                                            </div>
                                            <div className="form-group">
                                                <label>{t('guntas', lang)}</label>
                                                <input type="number" value={calcGuntas} onChange={(e) => setCalcGuntas(e.target.value)} placeholder={kd(registeredUser?.land_area_guntas ?? 0)} className="form-input" />
                                            </div>
                                        </div>
                                        <button type="submit" className="profit-btn" disabled={loadingProfit}>
                                            {loadingProfit ? <><span className="spinner"></span> {t('calculating', lang)}</> : `📊 ${t('calculateProfitBtn', lang)}`}
                                        </button>
                                    </form>
                                </div>

                                {/* Profit Results */}
                                {showProfitCalc && profitEstimate && (
                                    <div className="profit-result">
                                        <h4>💹 {t('profitCalcTitle', lang)} — {getCropName(profitEstimate.crop, lang)}</h4>

                                        {profitEstimate.variety && (
                                            <div className="variety-result-banner">
                                                <div className="variety-banner-left">
                                                    <span className="variety-banner-icon">🌱</span>
                                                    <div>
                                                        <span className="variety-banner-tag">{t('varietyDetailsBadge', lang)}:</span>
                                                        <h5 className="variety-banner-title">{profitEstimate.variety}</h5>
                                                        {profitEstimate.variety_details?.scientific_species && (
                                                            <span className="variety-banner-sci">{profitEstimate.variety_details.scientific_species}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="variety-banner-right">
                                                    <span className="variety-banner-price-tag">{kd(profitEstimate.price_display)}</span>
                                                    <span className="variety-banner-sub">{t('yield', lang)}: {kd(profitEstimate.yield_per_acre)} {fu(profitEstimate.yield_unit)}/{t('perAcreUnit', lang)}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="profit-grid">
                                            <div className="profit-card yield">
                                                <span className="profit-card-icon">📦</span>
                                                <span className="profit-card-label">{t('estYield', lang)}</span>
                                                <span className="profit-card-value">{kd(profitEstimate.estimated_total_yield)} {fu(profitEstimate.yield_unit)}</span>
                                                <span className="profit-card-sub">{kd(profitEstimate.yield_per_acre)}/{fu(profitEstimate.yield_unit)} {t('perAcreUnit', lang)}</span>
                                            </div>
                                            <div className="profit-card revenue">
                                                <span className="profit-card-icon">💰</span>
                                                <span className="profit-card-label">{t('estRevenue', lang)}</span>
                                                <span className="profit-card-value">₹{kd(profitEstimate.estimated_revenue.toLocaleString('en-IN'))}</span>
                                                <span className="profit-card-sub">@ {kd(profitEstimate.price_display)}</span>
                                            </div>
                                            <div className="profit-card cost">
                                                <span className="profit-card-icon">📋</span>
                                                <span className="profit-card-label">{t('estInputCost', lang)}</span>
                                                <span className="profit-card-value">₹{kd(profitEstimate.estimated_input_cost.toLocaleString('en-IN'))}</span>
                                                <span className="profit-card-sub">{t('ofRevenueSub', lang)}</span>
                                            </div>
                                            <div className="profit-card profit">
                                                <span className="profit-card-icon">✨</span>
                                                <span className="profit-card-label">{t('estNetProfit', lang)}</span>
                                                <span className="profit-card-value highlight">₹{kd(profitEstimate.estimated_profit.toLocaleString('en-IN'))}</span>
                                                <span className="profit-card-sub">₹{kd(profitEstimate.profit_per_acre.toLocaleString('en-IN'))}/{t('perAcreUnit', lang)}</span>
                                            </div>
                                        </div>

                                        {/* 5-Year Price Trend */}
                                        {profitEstimate.price_history_5yr.length > 0 && (
                                            <div className="price-history">
                                                <h4>{t('fiveYearPriceTrend', lang)} — {getCropName(profitEstimate.crop, lang)}</h4>
                                                <div className="history-bars">
                                                    {profitEstimate.price_history_5yr.map((entry, idx) => {
                                                        const maxPrice = Math.max(...profitEstimate.price_history_5yr.map(e => e.avg_price));
                                                        const heightPct = (entry.avg_price / maxPrice) * 100;
                                                        return (
                                                            <div key={entry.year} className="history-bar-group" style={{ animationDelay: `${idx * 0.1}s` }}>
                                                                <div className="history-bar-wrapper">
                                                                    <div className="history-bar" style={{ height: `${heightPct}%` }}></div>
                                                                </div>
                                                                <span className="history-price">₹{kd(Math.round(entry.avg_price).toLocaleString('en-IN'))}</span>
                                                                <span className="history-year">{kd(entry.year)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* All Market Rates */}
                                <div className="other-prices-section">
                                    <h4>{t('allMarketRates', lang)}</h4>
                                    <div className="price-list">
                                        {marketPrices.map((item: any) => (
                                            <div key={item.crop} className={`price-item ${item.crop === selectedMarketResult?.crop ? 'highlighted' : ''}`}>
                                                <span className="crop-name">{getCropName(item.crop, lang)}</span>
                                                <div className="price-value">
                                                    {item.price}
                                                    <span className={`trend ${item.trend}`}>
                                                        {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '•'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ===== FARMERS AROUND MY LAND ===== */}
                {activeTab === 'neighbours' && (
                    <div className="section-card neighbours-section">
                        <div className="neighbours-header">
                            <div>
                                <h3>{t('farmersAroundTitle', lang)}</h3>
                            </div>
                            <div className="around-land-search-bar">
                                <input
                                    type="text"
                                    value={calcSurveyNumber}
                                    onChange={(e) => setCalcSurveyNumber(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            fetchBhoomiMapData(registeredUser?.taluk || 'Mangaluru', selectedNeighbourHobli || undefined, undefined, calcSurveyNumber);
                                        }
                                    }}
                                    placeholder={t('searchPlotPlaceholder', lang)}
                                    className="around-land-input"
                                />
                                <button
                                    onClick={() => fetchBhoomiMapData(registeredUser?.taluk || 'Mangaluru', selectedNeighbourHobli || undefined, undefined, calcSurveyNumber)}
                                    className="around-land-search-btn"
                                    disabled={loadingBhoomiMap}
                                >
                                    {loadingBhoomiMap ? `⏳ ...` : `🔍 ${t('findAdjacentPlots', lang)}`}
                                </button>
                            </div>
                        </div>

                        {loadingBhoomiMap && (
                            <div className="weather-loading"><span className="spinner"></span> {lang === 'kn' ? 'ಜಮೀನಿನ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Loading adjacent landholders and crop details...'}</div>
                        )}

                        {/* Grid of Farmers Around My Land */}
                        {!loadingBhoomiMap && bhoomiMapData && bhoomiMapData.parcels && (
                            <div className="farmers-around-grid">
                                {(() => {
                                    const seenFarmerNames = new Set<string>();
                                    const seenFirstNames = new Set<string>();
                                    return bhoomiMapData.parcels
                                        .filter(p => !p.is_user)
                                        .filter(p => {
                                            const fullName = (p.owner_name || '').trim().toLowerCase();
                                            const firstName = fullName.split(' ')[0];
                                            if (!fullName || seenFarmerNames.has(fullName) || seenFirstNames.has(firstName)) {
                                                return false;
                                            }
                                            seenFarmerNames.add(fullName);
                                            seenFirstNames.add(firstName);
                                            return true;
                                        })
                                        .sort((a, b) => Number(a.is_empty) - Number(b.is_empty))
                                        .map((p, idx) => (
                                        <div
                                            key={p.survey_number}
                                            className={`around-farmer-card ${p.is_empty ? 'card-empty' : 'card-cultivating'}`}
                                            style={{ animationDelay: `${idx * 0.05}s` }}
                                        >
                                            <div className="afc-header">
                                                <div className="afc-farmer-identity">
                                                    <div className={`afc-avatar ${p.is_empty ? 'avatar-empty' : 'avatar-cultivating'}`}>
                                                        {p.owner_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="afc-name">{lang === 'kn' ? (p.owner_name_kn || fn(p.owner_name)) : p.owner_name}</h4>
                                                        <span className="afc-survey-badge">
                                                            {t('plotNumber', lang)}: <strong>{p.survey_number}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`afc-status-pill ${p.is_empty ? 'pill-empty' : 'pill-cultivating'}`}>
                                                    {p.is_empty ? `⚠️ ${t('statusEmptyLand', lang)}` : `🌱 ${t('statusActivelyGrowing', lang)}`}
                                                </span>
                                            </div>

                                            {/* Land Extent and Soil Type */}
                                            <div className="afc-land-specs">
                                                <div className="afc-spec-item">
                                                    <span className="spec-label">{t('areaLabel', lang)}</span>
                                                    <span className="spec-val">{p.land_acres} {t('acres', lang)} {p.land_guntas} {t('guntas', lang)}</span>
                                                </div>
                                                <div className="afc-spec-item">
                                                    <span className="spec-label">{t('soilTypeLabel', lang)}</span>
                                                    <span className="spec-val">{lang === 'kn' ? p.soil_type_kn : p.soil_type}</span>
                                                </div>
                                                <div className="afc-spec-item">
                                                    <span className="spec-label">{t('landClassLabel', lang)}</span>
                                                    <span className="spec-val">{lang === 'kn' ? p.land_type_kn : p.land_type}</span>
                                                </div>
                                            </div>

                                            {/* If Actively Cultivating */}
                                            {!p.is_empty && (
                                                <div className="afc-growing-box">
                                                    <div className="growing-header">
                                                        <span className="growing-label">{t('whatGrowing', lang)}:</span>
                                                    </div>
                                                    <div className="growing-crop-display">
                                                        <span className="crop-big-emoji">{getCropIcon(p.crop_grown, '🌿')}</span>
                                                        <div>
                                                            <span className="crop-big-name">{getCropName(p.crop_grown, lang)}</span>
                                                            <span className="crop-sub-type">{lang === 'kn' ? p.land_type_kn : p.land_type} • {lang === 'kn' ? p.soil_type_kn : p.soil_type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* If Left Land Empty: Suggest Crop */}
                                            {p.is_empty && (
                                                <div className="afc-empty-suggestion-box">
                                                    <div className="empty-warning-bar">
                                                        <span>⚠️</span>
                                                        <span>{lang === 'kn' ? 'ಈ ಜಮೀನಿನಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಬೆಳೆ ಬೆಳೆದಿಲ್ಲ (ಖಾಲಿ ಜಮೀನು).' : 'This land was left empty / fallow.'}</span>
                                                    </div>

                                                    <div className="suggested-crops-section">
                                                        <div className="sc-header">
                                                            <span>💡</span>
                                                            <strong>{t('suggestedCropForEmpty', lang)}:</strong>
                                                        </div>
                                                        <div className="sc-chips-list">
                                                            {p.recommended_crops && p.recommended_crops.length > 0 ? (
                                                                p.recommended_crops.map(c => (
                                                                    <span key={c} className="sc-crop-chip">
                                                                        <span>{getCropIcon(c, '🌿')}</span>
                                                                        <strong>{getCropName(c, lang)}</strong>
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="sc-crop-chip">
                                                                    <span>🌾</span>
                                                                    <strong>{getCropName('Rice', lang)}</strong>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Work / Revitalization guidance */}
                                                    {(p.suggested_work || p.suggested_work_kn) && (
                                                        <div className="empty-work-guidance">
                                                            <div className="ewg-title">🛠️ {t('suggestedWorkForEmpty', lang)}:</div>
                                                            <p className="ewg-text">{lang === 'kn' ? p.suggested_work_kn : p.suggested_work}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ));
                                })()}
                            </div>
                        )}

                        {!loadingBhoomiMap && (!bhoomiMapData || !bhoomiMapData.parcels || bhoomiMapData.parcels.length === 0) && (
                            <div className="no-data-card">
                                <span className="no-data-icon">🏘️</span>
                                <h4>{t('noAdjacentFound', lang)}</h4>
                                <p>Please enter your survey number above to discover adjacent farmers.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== MY FARM ANALYSIS ===== */}
                {activeTab === 'history' && farmerHistory && (
                    <div className="section-card history-section">
                        <div className="history-header">
                            <h3>{t('farmHistoryTitle', lang)}</h3>
                            <div className="farmer-id-badge">{t('farmerID', lang)} {kd(farmerHistory.info.id)}</div>
                        </div>
                        <p className="section-description">{t('analyzingPerformance', lang)}</p>

                        <div className="farm-stat-cards">
                            <div className="stat-card">
                                <span className="stat-icon">🗺️</span>
                                <div className="stat-info">
                                    <span className="stat-value">{kd(registeredUser?.land_area_acres ?? farmerHistory.info.acres)} {t('acres', lang)}</span>
                                    {(registeredUser?.land_area_guntas ?? farmerHistory.info.guntas) !== undefined && (
                                        <span className="stat-sub">{kd(registeredUser?.land_area_guntas ?? farmerHistory.info.guntas)} {t('guntas', lang)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon">{getCropIcon(farmerHistory.info.primary_crop, '🌱')}</span>
                                <div className="stat-info">
                                    <span className="stat-label">{t('primaryCrop', lang)}</span>
                                    <span className="stat-value">{getCropName(farmerHistory.info.primary_crop, lang)}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon">🏔️</span>
                                <div className="stat-info">
                                    <span className="stat-label">{t('soilType', lang)}</span>
                                    <span className="stat-value">{getSoilName(farmerHistory.info.soil_type, lang)}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon">🧪</span>
                                <div className="stat-info">
                                    <span className="stat-label">{t('avgPH', lang)}</span>
                                    <span className="stat-value">{kd(farmerHistory.info.ph)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="history-charts-grid">
                            <div className="chart-container">
                                <h4>{t('annualYieldTrend', lang)} ({fu(farmerHistory.history[0]?.unit)})</h4>
                                <div className="history-bars personal-bars">
                                    {farmerHistory.history.map((entry, idx) => {
                                        const maxVal = Math.max(...farmerHistory.history.map(e => e.yield));
                                        const heightPct = entry.yield > 0 ? (entry.yield / maxVal) * 100 : 0;
                                        return (
                                            <div key={entry.year} className="history-bar-group" style={{ animationDelay: `${idx * 0.1}s` }}>
                                                <div className="history-bar-wrapper">
                                                    <div className="history-bar yield-bar" style={{ height: `${heightPct}%` }}></div>
                                                </div>
                                                <span className="history-price">{kd(entry.yield.toFixed(1))}</span>
                                                <span className="history-year">{kd(entry.year)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="chart-container">
                                <h4>{t('annualProfitTrend', lang)} ({t('inr', lang)})</h4>
                                <div className="history-bars personal-bars">
                                    {farmerHistory.history.map((entry, idx) => {
                                        const maxVal = Math.max(...farmerHistory.history.map(e => e.profit));
                                        const heightPct = entry.profit > 0 ? (entry.profit / maxVal) * 100 : 0;
                                        return (
                                            <div key={entry.year} className="history-bar-group" style={{ animationDelay: `${idx * 0.1}s` }}>
                                                <div className="history-bar-wrapper">
                                                    <div className="history-bar profit-bar" style={{ height: `${heightPct}%` }}></div>
                                                </div>
                                                <span className="history-price">₹{kd((entry.profit / 1000).toFixed(0))}{lang === 'kn' ? 'ಸಾ' : 'k'}</span>
                                                <span className="history-year">{kd(entry.year)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="performance-summary">
                            <p>🌟 <strong>{t('performanceNote', lang)}</strong> {t('performanceNoteDesc', lang)} <strong>{
                                kd(farmerHistory.history.reduce((prev, current) => (prev.yield > current.yield) ? prev : current).year)
                            }</strong> {t('withTotalProfit', lang)} <strong>₹{
                                kd(farmerHistory.history.reduce((prev, current) => (prev.profit > current.profit) ? prev : current).profit.toLocaleString('en-IN'))
                            }</strong>.</p>
                        </div>
                    </div>
                )}

                {/* =====================================================
                    FARMER CROP HISTORY FORM
                    ===================================================== */}
                {showCropHistoryForm && (
                    <div className="crop-history-modal-backdrop" onClick={() => setShowCropHistoryForm(false)}>
                        <section
                            className="crop-history-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="crop-history-modal-title"
                            onClick={event => event.stopPropagation()}
                        >
                            <header className="crop-history-modal-header">
                                <div>
                                    <h2 id="crop-history-modal-title">
                                        {editingCropHistoryId ? t('cropHistoryUpdate', lang) : t('cropHistoryTitle', lang)}
                                    </h2>
                                    <p>{t('cropHistoryModalHint', lang)}</p>
                                </div>
                                <button
                                    type="button"
                                    className="profile-edit-close"
                                    onClick={() => setShowCropHistoryForm(false)}
                                    aria-label={t('cropHistoryCancel', lang)}
                                >
                                    ✕
                                </button>
                            </header>

                            <form onSubmit={handleSaveCropHistory}>
                                <div className="crop-history-drafts">
                                    {cropHistoryDrafts.map((draft, index) => (
                                        <fieldset className="crop-history-draft" key={index}>
                                            <legend>{t('cropHistoryCropName', lang)} {cropHistoryDrafts.length > 1 ? `#${index + 1}` : ''}</legend>
                                            <div className="crop-history-form-grid">
                                                <div className="edit-field">
                                                    <label htmlFor={`crop-history-year-${index}`}>{t('cropHistoryYear', lang)}</label>
                                                    <input
                                                        id={`crop-history-year-${index}`}
                                                        type="number"
                                                        min="1900"
                                                        max={new Date().getFullYear()}
                                                        value={draft.year}
                                                        onChange={event => handleCropHistoryDraftChange(index, 'year', event.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="edit-field">
                                                    <label htmlFor={`crop-history-name-${index}`}>{t('cropHistoryCropName', lang)}</label>
                                                    <input
                                                        id={`crop-history-name-${index}`}
                                                        type="text"
                                                        list="crop-history-crop-options"
                                                        maxLength={100}
                                                        value={draft.crop_name}
                                                        onChange={event => handleCropHistoryDraftChange(index, 'crop_name', event.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="edit-field">
                                                    <label htmlFor={`crop-history-season-${index}`}>{t('cropHistorySeason', lang)}</label>
                                                    <select
                                                        id={`crop-history-season-${index}`}
                                                        value={draft.season}
                                                        onChange={event => handleCropHistoryDraftChange(index, 'season', event.target.value)}
                                                        required
                                                    >
                                                        <option value="Kharif">{t('cropHistoryKharif', lang)}</option>
                                                        <option value="Rabi">{t('cropHistoryRabi', lang)}</option>
                                                        <option value="Summer">{t('cropHistorySummer', lang)}</option>
                                                        <option value="Year-round">{t('cropHistoryYearRound', lang)}</option>
                                                        <option value="Other">{t('cropHistoryOther', lang)}</option>
                                                    </select>
                                                </div>
                                                <div className="edit-field">
                                                    <label htmlFor={`crop-history-area-${index}`}>{t('cropHistoryArea', lang)}</label>
                                                    <input
                                                        id={`crop-history-area-${index}`}
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={draft.cultivated_area_acres}
                                                        onChange={event => handleCropHistoryDraftChange(index, 'cultivated_area_acres', event.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="edit-field">
                                                    <label htmlFor={`crop-history-yield-${index}`}>{t('cropHistoryYield', lang)}</label>
                                                    <input
                                                        id={`crop-history-yield-${index}`}
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        value={draft.yield_quantity}
                                                        onChange={event => handleCropHistoryDraftChange(index, 'yield_quantity', event.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="edit-field">
                                                    <label htmlFor={`crop-history-unit-${index}`}>{t('cropHistoryYieldUnit', lang)}</label>
                                                    <select
                                                        id={`crop-history-unit-${index}`}
                                                        value={draft.yield_unit}
                                                        onChange={event => handleCropHistoryDraftChange(index, 'yield_unit', event.target.value)}
                                                        required
                                                    >
                                                        <option value="kg">kg</option>
                                                        <option value="quintals">Quintals</option>
                                                        <option value="tonnes">Tonnes</option>
                                                    </select>
                                                </div>
                                                <div className="edit-field">
                                                    <label htmlFor={`crop-history-soil-${index}`}>{t('cropHistorySoilType', lang)}</label>
                                                    <input
                                                        id={`crop-history-soil-${index}`}
                                                        type="text"
                                                        maxLength={100}
                                                        value={draft.soil_type}
                                                        onChange={event => handleCropHistoryDraftChange(index, 'soil_type', event.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="edit-field">
                                                    <label htmlFor={`crop-history-ph-${index}`}>{t('cropHistorySoilPH', lang)}</label>
                                                    <input
                                                        id={`crop-history-ph-${index}`}
                                                        type="number"
                                                        min="0"
                                                        max="14"
                                                        step="0.1"
                                                        value={draft.soil_ph}
                                                        onChange={event => handleCropHistoryDraftChange(index, 'soil_ph', event.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="edit-field">
                                                    <label htmlFor={`crop-history-irrigation-${index}`}>{t('cropHistoryIrrigation', lang)}</label>
                                                    <select
                                                        id={`crop-history-irrigation-${index}`}
                                                        value={draft.irrigation_type}
                                                        onChange={event => handleCropHistoryDraftChange(index, 'irrigation_type', event.target.value)}
                                                        required
                                                    >
                                                        <option value="Rainfed">{t('cropHistoryRainfed', lang)}</option>
                                                        <option value="Drip">{t('cropHistoryDrip', lang)}</option>
                                                        <option value="Sprinkler">{t('cropHistorySprinkler', lang)}</option>
                                                        <option value="Canal">{t('cropHistoryCanal', lang)}</option>
                                                        <option value="Borewell">{t('cropHistoryBorewell', lang)}</option>
                                                        <option value="Other">{t('cropHistoryOther', lang)}</option>
                                                    </select>
                                                </div>
                                                <div className="edit-field">
                                                    <label htmlFor={`crop-history-profit-${index}`}>{t('cropHistoryProfit', lang)}</label>
                                                    <input
                                                        id={`crop-history-profit-${index}`}
                                                        type="number"
                                                        step="any"
                                                        value={draft.profit}
                                                        onChange={event => handleCropHistoryDraftChange(index, 'profit', event.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </fieldset>
                                    ))}
                                </div>

                                <datalist id="crop-history-crop-options">
                                    {availableCrops.map(crop => <option key={crop} value={crop} />)}
                                </datalist>

                                {cropHistoryError && <p className="crop-history-error" role="alert">{cropHistoryError}</p>}

                                <div className="crop-history-modal-actions">
                                    {!editingCropHistoryId && cropHistoryDrafts.length < 25 && (
                                        <button
                                            type="button"
                                            className="crop-history-view-btn"
                                            onClick={() => setCropHistoryDrafts(current => [...current, createCropHistoryDraft()])}
                                        >
                                            {t('addAnotherCrop', lang)}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="edit-cancel-btn"
                                        onClick={() => setShowCropHistoryForm(false)}
                                        disabled={savingCropHistory}
                                    >
                                        {t('cropHistoryCancel', lang)}
                                    </button>
                                    <button type="submit" className="edit-save-btn" disabled={savingCropHistory}>
                                        {savingCropHistory ? t('cropHistorySaving', lang) : t(editingCropHistoryId ? 'cropHistoryUpdate' : 'cropHistorySave', lang)}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}

                {/* =====================================================
                    VARIETY SHOWCASE & AGRONOMIC DETAIL MODAL
                    ===================================================== */}
                {varietyModalCrop && (
                    <div className="variety-modal-backdrop" onClick={() => setVarietyModalCrop(null)}>
                        <div className="variety-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="variety-modal-header">
                                <div className="modal-header-info">
                                    <div>
                                        <h3>{getCropName(varietyModalCrop, lang)} — {t('modalTitle', lang)}</h3>
                                        <p className="modal-crop-subtitle">
                                            {varietyModalData?.botanical_genus && (
                                                <span><strong>{t('botanicalName', lang)}:</strong> <em>{varietyModalData.botanical_genus}</em> • </span>
                                            )}
                                            <span><strong>{varietyModalData?.varieties_count || 0}</strong> {t('varietiesAvailable', lang)}</span>
                                            {varietyModalData?.price_range && (
                                                <span> • {t('priceRangeLabel', lang)}: <strong>{varietyModalData.price_range.display}</strong></span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <button className="modal-close-btn" onClick={() => setVarietyModalCrop(null)} title={t('closeModal', lang)}>✕</button>
                            </div>

                            {/* Modal Controls Toolbar */}
                            <div className="variety-modal-toolbar">
                                <div className="modal-search-box">
                                    <input
                                        type="text"
                                        placeholder={t('searchVarietyPlaceholder', lang)}
                                        value={varietySearchQuery}
                                        onChange={(e) => setVarietySearchQuery(e.target.value)}
                                    />
                                    {varietySearchQuery && (
                                        <button className="clear-search-btn" onClick={() => setVarietySearchQuery('')}>✕</button>
                                    )}
                                </div>

                                <div className="modal-filter-pills">
                                    <button
                                        className={`filter-pill ${varietyFilterSeason === 'all' ? 'active' : ''}`}
                                        onClick={() => setVarietyFilterSeason('all')}
                                    >
                                        {t('filterAllSeason', lang)}
                                    </button>
                                    <button
                                        className={`filter-pill ${varietyFilterSeason === 'Kharif' ? 'active' : ''}`}
                                        onClick={() => setVarietyFilterSeason('Kharif')}
                                    >
                                        {t('filterKharif', lang)}
                                    </button>
                                    <button
                                        className={`filter-pill ${varietyFilterSeason === 'Rabi' ? 'active' : ''}`}
                                        onClick={() => setVarietyFilterSeason('Rabi')}
                                    >
                                        {t('filterRabi', lang)}
                                    </button>
                                    <button
                                        className={`filter-pill ${varietyFilterSeason === 'Summer' ? 'active' : ''}`}
                                        onClick={() => setVarietyFilterSeason('Summer')}
                                    >
                                        {t('filterSummer', lang)}
                                    </button>
                                </div>

                                <div className="modal-sort-box">
                                    <label>{t('sort', lang)}</label>
                                    <select value={varietySortBy} onChange={(e) => setVarietySortBy(e.target.value)}>
                                        <option value="match">{t('sortByMatch', lang)}</option>
                                        <option value="yield">{t('sortByYield', lang)}</option>
                                        <option value="price">{t('sortByPrice', lang)}</option>
                                        <option value="duration">{t('sortByDuration', lang)}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Body with Varieties Grid */}
                            <div className="variety-modal-body">
                                {loadingVarietyModal ? (
                                    <div className="variety-modal-loading">
                                        <span className="spinner"></span>
                                        <p>{t('loadingCultivars', lang)}</p>
                                    </div>
                                ) : (
                                    (() => {
                                        let vars = (varietyModalData?.varieties || []).slice();

                                        // Helper: determine if a variety's season matches a given filter
                                        const matchesSeason = (varSeason: string, filter: string): boolean => {
                                            const s = (varSeason || '').toLowerCase();
                                            const f = filter.toLowerCase();

                                            // Perennial / Year-round crops grow in all seasons
                                            if (s.includes('perennial') || s.includes('year-round') || s.includes('annual')) {
                                                return true;
                                            }

                                            // Direct match (handles "Kharif", "Rabi", "Kharif/Rabi", "Rabi/Summer")
                                            if (s.includes(f)) return true;

                                            // Map month-based seasons to Kharif / Rabi / Summer
                                            // Kharif: Jun-Nov (monsoon crops)
                                            // Rabi: Oct-Mar (winter crops)
                                            // Summer: Feb-Jun (summer crops)
                                            const monthMap: Record<string, string[]> = {
                                                'jan': ['rabi'],
                                                'feb': ['rabi', 'summer'],
                                                'mar': ['rabi', 'summer'],
                                                'apr': ['summer'],
                                                'may': ['summer', 'kharif'],
                                                'jun': ['kharif', 'summer'],
                                                'jul': ['kharif'],
                                                'aug': ['kharif'],
                                                'sep': ['kharif'],
                                                'oct': ['kharif', 'rabi'],
                                                'nov': ['kharif', 'rabi'],
                                                'dec': ['rabi']
                                            };

                                            // Parse month-based format like "Jun-Aug", "Apr-Jul", "Feb-May"
                                            const monthPattern = s.match(/^([a-z]{3})\s*[-–]\s*([a-z]{3})$/);
                                            if (monthPattern) {
                                                const startMonth = monthPattern[1];
                                                const endMonth = monthPattern[2];
                                                const startSeasons = monthMap[startMonth] || [];
                                                const endSeasons = monthMap[endMonth] || [];
                                                const allSeasons = [...new Set([...startSeasons, ...endSeasons])];
                                                return allSeasons.includes(f);
                                            }

                                            return false;
                                        };

                                        // Search filter
                                        if (varietySearchQuery.trim()) {
                                            const q = varietySearchQuery.toLowerCase();
                                            vars = vars.filter(v => 
                                                v.name.toLowerCase().includes(q) ||
                                                (v.characteristics && v.characteristics.toLowerCase().includes(q)) ||
                                                (v.soil_type && v.soil_type.toLowerCase().includes(q)) ||
                                                (v.scientific_species && v.scientific_species.toLowerCase().includes(q)) ||
                                                (v.season && v.season.toLowerCase().includes(q)) ||
                                                (v.climate && v.climate.toLowerCase().includes(q)) ||
                                                (v.growing_months && v.growing_months.toLowerCase().includes(q)) ||
                                                (v.best_regions && v.best_regions.some(r => r.toLowerCase().includes(q)))
                                            );
                                        }

                                        // Season filter
                                        if (varietyFilterSeason !== 'all') {
                                            vars = vars.filter(v => matchesSeason(v.season, varietyFilterSeason));
                                        }

                                        // Sorting
                                        if (varietySortBy === 'yield') {
                                            vars.sort((a, b) => (b.yield_per_acre || 0) - (a.yield_per_acre || 0));
                                        } else if (varietySortBy === 'price') {
                                            vars.sort((a, b) => (b.price || 0) - (a.price || 0));
                                        } else if (varietySortBy === 'duration') {
                                            vars.sort((a, b) => (a.duration_days || 999) - (b.duration_days || 999));
                                        } else {
                                            // Best Match: sort by real suitability score
                                            vars.sort((a, b) => (b.suitability_score || 0) - (a.suitability_score || 0));
                                        }

                                        if (vars.length === 0) {
                                            return (
                                                <div className="no-varieties-found">
                                                    <p>No varieties match the selected filters. Select "All Seasons" or clear your search.</p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="modal-varieties-grid">
                                                {vars.map((v, idx) => {
                                                    const isSelectedVar = selectedVariety === v.name;
                                                    const matchScore = v.suitability_score || 0;

                                                    return (
                                                        <div key={v.name} className={`modal-variety-card ${isSelectedVar ? 'selected-card' : ''}`}>
                                                            {/* Top Banner Image with Overlay */}
                                                            <div className="modal-var-image-wrap">
                                                                <div className="modal-var-image-fallback" aria-hidden="true">
                                                                    <span>{getCropIcon(varietyModalData?.crop || varietyModalCrop || '', '🌱')}</span>
                                                                    <strong>{getCropName(varietyModalData?.crop || varietyModalCrop || '', lang)}</strong>
                                                                </div>
                                                                {varietyModalData?.crop_image && (
                                                                    <img
                                                                        src={v.image_url || varietyModalData.crop_image}
                                                                        alt={`${getCropName(varietyModalData.crop, lang)} - ${v.name}`}
                                                                        className="modal-var-img"
                                                                        onError={(event) => {
                                                                            event.currentTarget.style.display = 'none';
                                                                        }}
                                                                    />
                                                                )}
                                                                {v.image_credit && v.image_source && (
                                                                    <a
                                                                        className="variety-image-credit"
                                                                        href={v.image_source}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        aria-label={`Photo credit: ${v.image_credit}`}
                                                                        title={v.image_credit}
                                                                    >
                                                                        {v.image_credit}
                                                                    </a>
                                                                )}
                                                                <div className="modal-var-img-overlay">
                                                                    <span className="var-rank-badge">#{idx + 1}</span>
                                                                    <span className="var-suitability-tag">
                                                                        {matchScore}% match
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Variety Info Content */}
                                                            <div className="modal-var-content">
                                                                <div className="modal-var-header-row">
                                                                    <div>
                                                                        <h4 className="modal-var-title">{v.name}</h4>
                                                                        {v.scientific_species && (
                                                                            <span className="modal-var-sci">{v.scientific_species}</span>
                                                                        )}
                                                                    </div>
                                                                    <span className="modal-var-price-badge">
                                                                        {v.price_display || `₹${v.price}/${varietyModalData?.unit || 'quintal'}`}
                                                                    </span>
                                                                </div>

                                                                {/* Match Highlights Pills */}
                                                                {v.match_highlights && v.match_highlights.length > 0 && (
                                                                    <div className="modal-var-match-reasons">
                                                                        {v.match_highlights.map((reason, rIdx) => (
                                                                            <span key={rIdx} className="match-reason-chip">{reason}</span>
                                                                        ))}
                                                                    </div>
                                                                )}





                                                                {/* Action Button */}
                                                                <button
                                                                    type="button"
                                                                    className={`modal-select-btn ${isSelectedVar ? 'selected' : ''}`}
                                                                    onClick={() => {
                                                                        setSelectedCrop(varietyModalCrop);
                                                                        setSelectedVariety(isSelectedVar ? '' : v.name);
                                                                        setVarietyModalCrop(null);
                                                                        setActiveTab('prices');
                                                                        setShowMarketResult(true);
                                                                        setSelectedMarketResult({
                                                                            crop: varietyModalCrop,
                                                                            price: v.price_display || `₹${v.price}`,
                                                                            trend: 'stable'
                                                                        });
                                                                        fetchCropSpecies(varietyModalCrop);
                                                                        setTimeout(() => {
                                                                            const el = document.getElementById('profit-estimator-box');
                                                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                                        }, 200);
                                                                    }}
                                                                >
                                                                    {isSelectedVar ? t('selectedForEstimator', lang) : t('selectVarietyForProfit', lang)}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            </div>
        </div>
    );
}

export default App;
