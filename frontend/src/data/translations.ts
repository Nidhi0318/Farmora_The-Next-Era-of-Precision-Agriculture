// Translations for Farmer Portal (English & Kannada)

export type Language = 'en' | 'kn';

export const cropTranslations: Record<string, { en: string; kn: string; emoji: string }> = {
    'Rice': { en: 'Rice (Paddy)', kn: 'ಅಕ್ಕಿ (ಭತ್ತ)', emoji: '🌾' },
    'Banana': { en: 'Banana', kn: 'ಬಾಳೆಹಣ್ಣು', emoji: '🍌' },
    'Arecanut': { en: 'Arecanut (Betel Nut)', kn: 'ಅಡಿಕೆ', emoji: '🌴' },
    'Pepper': { en: 'Black Pepper', kn: 'ಕಾಳುಮೆಣಸು', emoji: '🌶️' },
    'Cashew': { en: 'Cashew Nut', kn: 'ಗೋಡಂಬಿ', emoji: '🥜' },
    'Rubber': { en: 'Rubber', kn: 'ರಬ್ಬರ್', emoji: '🌳' },
    'Coconut': { en: 'Coconut', kn: 'ತೆಂಗಿನಕಾಯಿ', emoji: '🥥' },
    'Wheat': { en: 'Wheat', kn: 'ಗೋಧಿ', emoji: '🌾' },
    'Sugarcane': { en: 'Sugarcane', kn: 'ಕಬ್ಬು', emoji: '🎋' },
    'Cotton': { en: 'Cotton', kn: 'ಹತ್ತಿ', emoji: '🌱' },
    'Coffee': { en: 'Coffee', kn: 'ಕಾಫಿ', emoji: '☕' },
    'Cardamom': { en: 'Cardamom', kn: 'ಏಲಕ್ಕಿ', emoji: '🌱' },
    'Ginger': { en: 'Ginger', kn: 'ಶುಂಠಿ', emoji: '🫚' },
    'Jowar': { en: 'Jowar (Sorghum)', kn: 'ಜೋಳ', emoji: '🌾' },
    'Maize': { en: 'Maize (Corn)', kn: 'ಮೆಕ್ಕೆಜೋಳ', emoji: '🌽' },
    'Bengal Gram': { en: 'Bengal Gram (Chana)', kn: 'ಕಡಲೆ', emoji: '🫘' },
    'Red Gram': { en: 'Red Gram (Tur Dal)', kn: 'ತೊಗರಿ', emoji: '🫘' },
    'Pomegranate': { en: 'Pomegranate', kn: 'ದಾಳಿಂಬೆ', emoji: '🍎' },
    'Ragi': { en: 'Ragi (Finger Millet)', kn: 'ರಾಗಿ', emoji: '🌾' },
    'Groundnut': { en: 'Groundnut (Peanut)', kn: 'ಶೇಂಗಾ (ನೆಲಗಡಲೆ)', emoji: '🥜' },
    'Tomato': { en: 'Tomato', kn: 'ಟೊಮೆಟೊ', emoji: '🍅' },
    'Mango': { en: 'Mango', kn: 'ಮಾವಿನಹಣ್ಣು', emoji: '🥭' },
    'Onion': { en: 'Onion', kn: 'ಈರುಳ್ಳಿ', emoji: '🧅' },
    'Potato': { en: 'Potato', kn: 'ಆಲೂಗಡ್ಡೆ', emoji: '🥔' },
    'Turmeric': { en: 'Turmeric', kn: 'ಅರಿಶಿನ', emoji: '🌿' },
    'Chilli': { en: 'Chilli', kn: 'ಮೆಣಸಿನಕಾಯಿ', emoji: '🌶️' },
    'Sunflower': { en: 'Sunflower', kn: 'ಸೂರ್ಯಕಾಂತಿ', emoji: '🌻' }
};

export const soilTranslations: Record<string, { en: string; kn: string }> = {
    'Laterite': { en: 'Laterite Soil', kn: 'ಲ್ಯಾಟರೈಟ್ (ಕೆಂಪು ಜೇಡಿ ಮಣ್ಣು)' },
    'Red Sandy': { en: 'Red Sandy Soil', kn: 'ಕೆಂಪು ಉಸುಕು ಮಣ್ಣು' },
    'Red Loam': { en: 'Red Loamy Soil', kn: 'ಕೆಂಪು ಲೋಮ್ ಮಣ್ಣು' },
    'Black Cotton': { en: 'Black Cotton Soil', kn: 'ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು' },
    'Dark Hilly': { en: 'Dark Hilly Soil', kn: 'ಮಲೆನಾಡು ಗಿರಿಕಂದರದ ಕಪ್ಪು ಮಣ್ಣು' },
    'Deep Black': { en: 'Deep Black Soil', kn: 'ಆಳವಾದ ಕಪ್ಪು ಮಣ್ಣು' },
    'Alluvial': { en: 'Alluvial Soil', kn: 'ಎರಡುಪಟ್ಟು ಫಲವತ್ತಾದ ಹೂಳಿನ ಮಣ್ಣು' }
};

export const weatherTranslations: Record<string, { en: string; kn: string }> = {
    'clear sky': { en: 'Clear Sky', kn: 'ನಿರ್ಮಲ ಆಕಾಶ' },
    'few clouds': { en: 'Few Clouds', kn: 'ಸ್ವಲ್ಪ ಮೋಡ ಕವಿದ ಆಕಾಶ' },
    'scattered clouds': { en: 'Scattered Clouds', kn: 'ಚದುರಿದ ಮೋಡಗಳು' },
    'broken clouds': { en: 'Broken Clouds', kn: 'ದಟ್ಟ ಮೋಡಗಳು' },
    'overcast clouds': { en: 'Overcast Clouds', kn: 'ಮೋಡ ಮುಸುಕಿದ ವಾತಾವರಣ' },
    'shower rain': { en: 'Shower Rain', kn: 'ಸಣ್ಣ ಮಳೆ' },
    'rain': { en: 'Rainy', kn: 'ಮಳೆಯ ವಾತಾವರಣ' },
    'thunderstorm': { en: 'Thunderstorm', kn: 'ಸಿಡಿಲು ಸಹಿತ ಮಳೆ' },
    'light rain': { en: 'Light Rain', kn: 'ಹಗುರ ಮಳೆ' },
    'moderate rain': { en: 'Moderate Rain', kn: 'ಸಾಧಾರಣ ಮಳೆ' },
    'heavy rain': { en: 'Heavy Rain', kn: 'ಭಾರೀ ಮಳೆ' },
    'partly cloudy': { en: 'Partly Cloudy', kn: 'ಸ್ವಲ್ಪ ಮೋಡ ಕವಿದ ಆಕಾಶ' },
    'mostly cloudy': { en: 'Mostly Cloudy', kn: 'ಮೋಡ ಕವಿದ ಆಕಾಶ' },
    'foggy': { en: 'Foggy', kn: 'ಮಂಜು ಮುಸುಕಿದ ವಾತಾವರಣ' },
    'light drizzle': { en: 'Light Drizzle', kn: 'ತುಂತುರು ಮಳೆ' },
    'moderate drizzle': { en: 'Moderate Drizzle', kn: 'ಸಾಧಾರಣ ತುಂತುರು ಮಳೆ' },
    'dense drizzle': { en: 'Dense Drizzle', kn: 'ದಟ್ಟ ತುಂತುರು ಮಳೆ' },
    'light rain showers': { en: 'Light Rain Showers', kn: 'ಹಗುರ ಮಳೆ ಹನಿಗಳು' },
    'moderate rain showers': { en: 'Moderate Rain Showers', kn: 'ಸಾಧಾರಣ ಮಳೆ ಹನಿಗಳು' },
    'violent rain showers': { en: 'Violent Rain Showers', kn: 'ಭಾರೀ ಮಳೆ ಸುರಿಮಳೆ' },
    'thunderstorm with hail': { en: 'Thunderstorm with Hail', kn: 'ಆಲಿಕಲ್ಲು ಸಹಿತ ಸಿಡಿಲು ಮಳೆ' },
    'thunderstorm with heavy hail': { en: 'Thunderstorm with Heavy Hail', kn: 'ಭಾರೀ ಆಲಿಕಲ್ಲು ಸಹಿತ ಸಿಡಿಲು ಮಳೆ' },
    'overcast': { en: 'Overcast', kn: 'ಮೋಡ ಮುಸುಕಿದ ವಾತಾವರಣ' },
    'mist': { en: 'Mist', kn: 'ಮಂಜು' }
};

export const uiTranslations: Record<string, { en: string; kn: string }> = {
    // Header & Brand
    portalTitle: { en: 'Farmora', kn: 'ಫಾರ್ಮೊರಾ' },
    portalSubtitle: { en: 'The Next Era of Precision Agriculture', kn: 'ನಿಖರ ಕೃಷಿಯ ಮುಂದಿನ ಯುಗ' },
    welcomeUser: { en: 'Welcome,', kn: 'ಸ್ವಾಗತ,' },
    surveyNo: { en: 'Survey No:', kn: 'ಸರ್ವೇ ಸಂಖ್ಯೆ:' },
    aadhaarNo: { en: 'Aadhaar:', kn: 'ಆಧಾರ್:' },
    registeredLand: { en: 'Registered Land:', kn: 'ನೋಂದಾಯಿತ ಜಮೀನು:' },
    acres: { en: 'Acres', kn: 'ಎಕರೆ' },
    guntas: { en: 'Guntas', kn: 'ಗುಂಟೆ' },
    useGPS: { en: 'Use GPS Location', kn: 'ಜಿಪಿಎಸ್ ಸ್ಥಳ ಬಳಸಿ' },
    tracking: { en: 'Tracking...', kn: 'ಹುಡುಕಲಾಗುತ್ತಿದೆ...' },
    logout: { en: 'Logout', kn: 'ನಿರ್ಗಮನ (Logout)' },
    
    // Auth Tabs & Titles
    login: { en: 'Login', kn: 'ಲಾಗಿನ್' },
    register: { en: 'Register', kn: 'ನೋಂದಣಿ' },
    welcomeBack: { en: 'Welcome Back', kn: 'ಮರಳಿ ಸ್ವಾಗತ' },
    loginSubtitle: { en: 'Enter your details to access your farm dashboard', kn: 'ನಿಮ್ಮ ಹೊಲದ ಮಾಹಿತಿಗೆ ಲಾಗಿನ್ ಆಗಿ' },
    fullName: { en: 'Full Name', kn: 'ಪೂರ್ಣ ಹೆಸರು' },
    enterFullName: { en: 'Enter your full name', kn: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ನಮೂದಿಸಿ' },
    password: { en: 'Password', kn: 'ಪಾಸ್‌ವರ್ಡ್' },
    loggingIn: { en: 'Logging in...', kn: 'ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...' },
    loginBtn: { en: 'Login to Dashboard', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಲಾಗಿನ್ ಆಗಿ' },
    
    // Registration Form
    joinCommunity: { en: '', kn: '' },
    registerSubtitle: { en: 'AI-powered crop recommendations & market insights for your land', kn: 'ನಿಮ್ಮ ಜಮೀನಿಗೆ ಎಐ ಬೆಳೆ ಶಿಫಾರಸು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ' },
    surveyNumber: { en: 'Survey Number', kn: 'ಸರ್ವೇ ಸಂಖ್ಯೆ' },
    aadhaarNumber: { en: 'Aadhaar Number', kn: 'ಆಧಾರ್ ಸಂಖ್ಯೆ' },
    phoneNumber: { en: 'Phone Number', kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' },
    autoDetectGPS: { en: 'Auto-Detect Location (GPS)', kn: 'ಜಿಪಿಎಸ್ ಮೂಲಕ ಸ್ವಯಂಚಾಲಿತ ಸ್ಥಳ ಪತ್ತೆ' },
    detectingLoc: { en: 'Detecting location...', kn: 'ಸ್ಥಳ ಪತ್ತೆಮಾಡಲಾಗುತ್ತಿದೆ...' },
    state: { en: 'State', kn: 'ರಾಜ್ಯ' },
    district: { en: 'District', kn: 'ಜಿಲ್ಲೆ' },
    taluk: { en: 'Taluk', kn: 'ತಾಲೂಕು' },
    hobli: { en: 'Hobli', kn: 'ಹೋಬಳಿ' },
    selectDistrict: { en: 'Select District', kn: 'ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ' },
    selectTaluk: { en: 'Select Taluk', kn: 'ತಾಲೂಕನ್ನು ಆಯ್ಕೆ ಮಾಡಿ' },
    selectHobli: { en: 'Select Hobli', kn: 'ಹೋಬಳಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ' },
    setPassword: { en: 'Set Password', kn: 'ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಸಿ' },
    landAcres: { en: 'Land Area (Acres)', kn: 'ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)' },
    landGuntas: { en: 'Land Area (Guntas)', kn: 'ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಗುಂಟೆ)' },
    currentCrop: { en: 'Crop Currently Grown', kn: 'ಪ್ರಸ್ತುತ ಬೆಳೆದಿರುವ ಬೆಳೆ' },
    registering: { en: 'Registering...', kn: 'ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...' },
    registerBtn: { en: 'Register & Continue', kn: 'ನೋಂದಾಯಿಸಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ' },

    // Tabs
    tabProfile: { en: 'Farmer Profile', kn: 'ರೈತರ ವಿವರ' },
    tabCropRec: { en: 'Crop Recommendation', kn: 'ಬೆಳೆ ಶಿಫಾರಸು' },
    tabMarketPrices: { en: 'Market Rates', kn: 'ಮಾರುಕಟ್ಟೆ ದರಗಳು' },
    tabNeighbours: { en: 'Neighbours', kn: 'ನೆರೆಹೊರೆಯವರು' },
    tabFarmAnalysis: { en: 'Farm Performance', kn: 'ಹೊಲದ ಸಾಧನೆ' },

    // Profile Bar & Details
    farmerProfileTitle: { en: 'Farmer Profile & Personal Information', kn: 'ರೈತರ ವಿವರ ಮತ್ತು ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ' },
    profileBarTitle: { en: 'Farmer Profile Overview', kn: 'ರೈತರ ವಿವರ ಸಾರಾಂಶ' },
    personalInfo: { en: 'Personal Information', kn: 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ' },
    previousCropsTitle: { en: 'Previous Crops Grown', kn: 'ಹಿಂದೆ ಬೆಳೆದ ಬೆಳೆಗಳು' },
    noPreviousCrops: { en: 'No previous crop records available.', kn: 'ಹಿಂದಿನ ಬೆಳೆಗಳ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ.' },
    addCropHistory: { en: '+ Add Crop History', kn: '+ ಬೆಳೆ ಇತಿಹಾಸ ಸೇರಿಸಿ' },
    addAnotherCrop: { en: '+ Add Another Crop', kn: '+ ಮತ್ತೊಂದು ಬೆಳೆ ಸೇರಿಸಿ' },
    viewFullHistory: { en: 'View Full History', kn: 'ಪೂರ್ಣ ಇತಿಹಾಸ ವೀಕ್ಷಿಸಿ' },
    hideFullHistory: { en: 'Hide Full History', kn: 'ಪೂರ್ಣ ಇತಿಹಾಸ ಮರೆಮಾಡಿ' },
    cropHistoryEmpty: { en: 'No crop history added yet.', kn: 'ಇನ್ನೂ ಬೆಳೆ ಇತಿಹಾಸವನ್ನು ಸೇರಿಸಿಲ್ಲ.' },
    cropHistoryLoginRequired: { en: 'Please log in again to manage crop history.', kn: 'ಬೆಳೆ ಇತಿಹಾಸ ನಿರ್ವಹಿಸಲು ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.' },
    cropHistorySaveFailed: { en: 'Could not save crop history.', kn: 'ಬೆಳೆ ಇತಿಹಾಸವನ್ನು ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.' },
    cropHistoryDeleteFailed: { en: 'Could not delete crop history.', kn: 'ಬೆಳೆ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.' },
    confirmDeleteCropHistory: { en: 'Delete this crop history record?', kn: 'ಈ ಬೆಳೆ ಇತಿಹಾಸ ದಾಖಲೆಯನ್ನು ಅಳಿಸಬೇಕೇ?' },
    cropHistoryTitle: { en: 'Crop History', kn: 'ಬೆಳೆ ಇತಿಹಾಸ' },
    cropHistoryModalHint: { en: 'Record crops from any year. Add multiple entries, including more than one crop in the same year.', kn: 'ಯಾವುದೇ ವರ್ಷದ ಬೆಳೆಗಳನ್ನು ದಾಖಲಿಸಿ. ಒಂದೇ ವರ್ಷದಲ್ಲಿ ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು ಬೆಳೆಗಳನ್ನು ಸೇರಿಸಬಹುದು.' },
    cropHistoryYear: { en: 'Year', kn: 'ವರ್ಷ' },
    cropHistoryCropName: { en: 'Crop Name', kn: 'ಬೆಳೆಯ ಹೆಸರು' },
    cropHistorySeason: { en: 'Season', kn: 'ಋತುಮಾನ' },
    cropHistoryArea: { en: 'Cultivated Area (acres)', kn: 'ಬೆಳೆದ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)' },
    cropHistoryYield: { en: 'Yield', kn: 'ಇಳುವರಿ' },
    cropHistoryYieldUnit: { en: 'Yield Unit', kn: 'ಇಳುವರಿ ಘಟಕ' },
    cropHistorySoilType: { en: 'Soil Type', kn: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ' },
    cropHistorySoilPH: { en: 'Soil pH', kn: 'ಮಣ್ಣಿನ ಪಿಹೆಚ್' },
    cropHistoryIrrigation: { en: 'Irrigation Type', kn: 'ನೀರಾವರಿ ಪ್ರಕಾರ' },
    cropHistoryProfit: { en: 'Profit (optional, ₹)', kn: 'ಲಾಭ (ಐಚ್ಛಿಕ, ₹)' },
    cropHistoryKharif: { en: 'Kharif', kn: 'ಖಾರಿಫ್' },
    cropHistoryRabi: { en: 'Rabi', kn: 'ರಬಿ' },
    cropHistorySummer: { en: 'Summer', kn: 'ಬೇಸಿಗೆ' },
    cropHistoryYearRound: { en: 'Year-round', kn: 'ವರ್ಷಪೂರ್ತಿ' },
    cropHistoryOther: { en: 'Other', kn: 'ಇತರೆ' },
    cropHistoryRainfed: { en: 'Rainfed', kn: 'ಮಳೆ ಆಧಾರಿತ' },
    cropHistoryDrip: { en: 'Drip', kn: 'ಹನಿ ನೀರಾವರಿ' },
    cropHistorySprinkler: { en: 'Sprinkler', kn: 'ಸಿಂಪಡಣೆ ನೀರಾವರಿ' },
    cropHistoryCanal: { en: 'Canal', kn: 'ಕಾಲುವೆ' },
    cropHistoryBorewell: { en: 'Borewell', kn: 'ಬೋರ್‌ವೆಲ್' },
    cropHistoryEdit: { en: 'Edit', kn: 'ತಿದ್ದು' },
    cropHistoryDelete: { en: 'Delete', kn: 'ಅಳಿಸಿ' },
    cropHistorySave: { en: 'Save Crop History', kn: 'ಬೆಳೆ ಇತಿಹಾಸ ಉಳಿಸಿ' },
    cropHistoryUpdate: { en: 'Update Crop History', kn: 'ಬೆಳೆ ಇತಿಹಾಸ ನವೀಕರಿಸಿ' },
    cropHistorySaving: { en: 'Saving...', kn: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' },
    cropHistoryCancel: { en: 'Cancel', kn: 'ರದ್ದುಮಾಡಿ' },
    estimationsTitle: { en: 'Farm Financial Estimations', kn: 'ಹೊಲದ ಅಂದಾಜು ಆದಾಯ ಮತ್ತು ವೆಚ್ಚ' },
    estProfitPerAcre: { en: 'Profit per Acre', kn: 'ಪ್ರತಿ ಎಕರೆಗೆ ಲಾಭ' },
    primaryCropGrown: { en: 'Primary Crop Grown', kn: 'ಪ್ರಮುಖ ಬೆಳೆದ ಬೆಳೆ' },
    secondaryCropGrown: { en: 'Secondary Crop Grown', kn: 'ಉಪ ಬೆಳೆ' },

    // Crop Recommendation Section
    currentlyGrowing: { en: 'Currently Growing on Your Land', kn: 'ನಿಮ್ಮ ಜಮೀನಿನಲ್ಲಿ ಪ್ರಸ್ತುತ ಬೆಳೆಯುತ್ತಿರುವ ಬೆಳೆ' },
    noCropsGrowing: { en: 'No crops are currently growing on your land', kn: 'ನಿಮ್ಮ ಜಮೀನಿನಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಬೆಳೆ ಬೆಳೆಯುತ್ತಿಲ್ಲ' },
    activeCrop: { en: 'Active Crop', kn: 'ಪ್ರಸ್ತುತ ಬೆಳೆ' },
    aiRecommended: { en: 'AI Recommended Crops', kn: 'ಎಐ ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು' },
    cropRecTitle: { en: 'Crop Recommendation for Your Land', kn: 'ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸೂಕ್ತವಾದ ಬೆಳೆ ಶಿಫಾರಸು' },
    liveWeather: { en: 'Live Weather & Climate', kn: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಮಾಹಿತಿ' },
    refresh: { en: 'Refresh', kn: 'ನವೀಕರಿಸಿ' },
    temperature: { en: 'Temperature', kn: 'ತಾಪಮಾನ' },
    humidity: { en: 'Humidity', kn: 'ತೇವಾಂಶ' },
    rainfall: { en: 'Est. Rainfall', kn: 'ಅಂದಾಜು ಮಳೆ' },
    condition: { en: 'Condition', kn: 'ವಾತಾವರಣ' },
    soilDataTitle: { en: 'Soil Data — Karnataka Land Dataset', kn: 'ಮಣ್ಣಿನ ಗುಣಲಕ್ಷಣಗಳು — ಕರ್ನಾಟಕ ಜಮೀನು ಮಾಹಿತಿ' },
    soilType: { en: 'Soil Type', kn: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ' },
    avgPH: { en: 'Average pH', kn: 'ಸರಾಸರಿ ಪಿಹೆಚ್ (pH)' },
    analyzing: { en: 'Analyzing soil & climate...', kn: 'ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' },
    getCropRecBtn: { en: 'Get Crop Recommendations for My Land', kn: 'ನನ್ನ ಜಮೀನಿಗೆ ಬೆಳೆ ಶಿಫಾರಸು ಪಡೆಯಿರಿ' },
    recommendedCropsTitle: { en: 'Recommended Crops for Your Region & Land', kn: 'ನಿಮ್ಮ ಪ್ರಾಂತ್ಯ ಮತ್ತು ಜಮೀನಿಗೆ ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳು' },
    backBtn: { en: '← Back', kn: '← ಹಿಂತಿರುಗಿ' },
    checkMarket: { en: 'Check Market', kn: 'ಮಾರುಕಟ್ಟೆ ನೋಡಿ' },
    trendRising: { en: '↑ Rising', kn: '↑ ಏರಿಕೆಯಲ್ಲಿದೆ' },
    trendFalling: { en: '↓ Falling', kn: '↓ ಇಳಿಕೆಯಲ್ಲಿದೆ' },
    trendStable: { en: '• Stable', kn: '• ಸ್ಥಿರವಾಗಿದೆ' },

    // Market Rates Section
    marketRatesTitle: { en: 'Karnataka APMC Market Rates', kn: 'ಕರ್ನಾಟಕ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ದರಗಳು' },
    marketRatesDesc: { en: 'View live APMC market prices from data.gov.in for Karnataka districts', kn: 'ಕರ್ನಾಟಕದ ಪ್ರತಿಯೊಂದು ಜಿಲ್ಲೆಯ ದಿನನಿತ್ಯದ ಮಾರುಕಟ್ಟೆ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' },
    selectKarnatakaDistrict: { en: 'Select Karnataka District', kn: 'ಕರ್ನಾಟಕದ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' },
    allKarnataka: { en: 'All Karnataka', kn: 'ಎಲ್ಲಾ ಕರ್ನಾಟಕ' },
    yourDistrict: { en: 'Your District', kn: 'ನಿಮ್ಮ ಜಿಲ್ಲೆ' },
    liveAPMCTable: { en: 'Live APMC Prices', kn: 'ನೇರ ಮಾರುಕಟ್ಟೆ ದರಗಳು' },
    apmcMarket: { en: 'Market (APMC)', kn: 'ಮಾರುಕಟ್ಟೆ (APMC)' },
    commodity: { en: 'Commodity', kn: 'ಬೆಳೆ / ಪದಾರ್ಥ' },
    variety: { en: 'Variety', kn: 'ತಳಿ' },
    minPrice: { en: 'Min Price', kn: 'ಕನಿಷ್ಠ ದರ' },
    maxPrice: { en: 'Max Price', kn: 'ಗರಿಷ್ಠ ದರ' },
    modalPrice: { en: 'Modal Price', kn: 'ಸರಾಸರಿ ದರ' },
    date: { en: 'Date', kn: 'ದಿನಾಂಕ' },
    fetchingLiveMarket: { en: 'Fetching live market prices...', kn: 'ನೇರ ಮಾರುಕಟ್ಟೆ ದರಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...' },
    selectCropDetailed: { en: 'Select a Crop for Profit Prediction', kn: 'ಲಾಭದ ಅಂದಾಜಿಗಾಗಿ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' },
    getMarketRateBtn: { en: 'Get Market Rate Prediction', kn: 'ಮಾರುಕಟ್ಟೆ ದರ ಅಂದಾಜು ಪಡೆಯಿರಿ' },
    goodTimeToSell: { en: 'Good time to sell! Market price is trending upward.', kn: 'ಮಾರಾಟ ಮಾಡಲು ಸೂಕ್ತ ಸಮಯ! ಮಾರುಕಟ್ಟೆ ದರ ಹೆಚ್ಚಾಗುತ್ತಿದೆ.' },
    considerHolding: { en: 'Consider holding. Market price is declining.', kn: 'ಕಾಯುವುದು ಉತ್ತಮ. ಮಾರುಕಟ್ಟೆ ದರ ಇಳಿಕೆಯಾಗುತ್ತಿದೆ.' },
    marketStable: { en: 'Market is stable. You can sell at your convenience.', kn: 'ಮಾರುಕಟ್ಟೆ ಸ್ಥಿರವಾಗಿದೆ. ನಿಮ್ಮ ಅನುಕೂಲಕ್ಕೆ ತಕ್ಕಂತೆ ಮಾರಾಟ ಮಾಡಬಹುದು.' },
    
    // Profit Calculator & Land Estimator
    profitCalcTitle: { en: 'Land Profit Estimator', kn: 'ಜಮೀನಿನ ಲಾಭದ ಲೆಕ್ಕಾಚಾರ' },
    profitCalcDesc: { en: 'Enter your Survey Number and Land Details to estimate yield & net profit', kn: 'ಇಳುವರಿ ಮತ್ತು ನಿವ್ವಳ ಲಾಭದ ಅಂದಾಜಿಗಾಗಿ ನಿಮ್ಮ ಸರ್ವೇ ಸಂಖ್ಯೆ ಮತ್ತು ಜಮೀನಿನ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ' },
    enterSurveyNumber: { en: 'Enter Survey Number (e.g. 123/A)', kn: 'ಸರ್ವೇ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (ಉದಾ: 123/ಎ)' },
    calculateProfitBtn: { en: 'Calculate Estimated Profit', kn: 'ಅಂದಾಜು ಲಾಭವನ್ನು ಲೆಕ್ಕಹಾಕಿ' },
    calculating: { en: 'Calculating...', kn: 'ಲೆಕ್ಕಾಚಾರ ಮಾಡಲಾಗುತ್ತಿದೆ...' },
    estYield: { en: 'Est. Total Yield', kn: 'ಅಂದಾಜು ಒಟ್ಟು ಇಳುವರಿ' },
    estRevenue: { en: 'Est. Total Revenue', kn: 'ಅಂದಾಜು ಒಟ್ಟು ಆದಾಯ' },
    estInputCost: { en: 'Est. Input Cost', kn: 'ಅಂದಾಜು ವೆಚ್ಚ (~40%)' },
    estNetProfit: { en: 'Est. Net Profit', kn: 'ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ' },
    fiveYearPriceTrend: { en: '5-Year Price History', kn: '5 ವರ್ಷಗಳ ದರ ಇತಿಹಾಸ' },
    perAcre: { en: 'per acre', kn: 'ಎಕರೆಗೆ' },

    // Neighbours Section
    farmersAroundTitle: { en: 'Farmers Around My Land', kn: 'ನನ್ನ ಜಮೀನಿನ ಸುತ್ತಮುತ್ತಲಿನ ರೈತರು' },
    farmersAroundDesc: { en: 'Adjacent farmers surrounding your land and what they are currently growing', kn: 'ನಿಮ್ಮ ಜಮೀನಿನ ಸುತ್ತಮುತ್ತಲಿನ ರೈತರು ಮತ್ತು ಅವರು ಪ್ರಸ್ತುತ ಬೆಳೆಯುತ್ತಿರುವ ಬೆಳೆಗಳು' },
    plotNumber: { en: 'Survey / Plot No.', kn: 'ಸರ್ವೆ / ಪ್ಲಾಟ್ ಸಂಖ್ಯೆ' },
    statusActivelyGrowing: { en: 'Actively Cultivating', kn: 'ಕೃಷಿ ಮಾಡಲಾಗುತ್ತಿದೆ' },
    statusEmptyLand: { en: 'Land Left Empty (Fallow)', kn: 'ಖಾಲಿ / ಬೀಳು ಬಿಟ್ಟ ಜಮೀನು' },
    whatGrowing: { en: 'What They Are Growing', kn: 'ಬೆಳೆಯುತ್ತಿರುವ ಬೆಳೆ' },
    suggestedCropForEmpty: { en: 'Suggested Crop to Cultivate', kn: 'ಬೆಳೆಯಲು ಶಿಫಾರಸು ಮಾಡಲಾದ ಬೆಳೆ' },
    suggestedWorkForEmpty: { en: 'Soil Preparation & Advice', kn: 'ಮಣ್ಣಿನ ಸುಧಾರಣೆ ಮತ್ತು ಸಲಹೆ' },
    searchPlotPlaceholder: { en: 'Enter Survey No. (e.g. 100/A)', kn: 'ಸರ್ವೆ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (ಉದಾ: 100/A)' },
    findAdjacentPlots: { en: 'Search Around Plot', kn: 'ಸುತ್ತಲಿನ ಜಮೀನು ಹುಡುಕಿ' },
    yourLandBadge: { en: 'Your Land', kn: 'ನಿಮ್ಮ ಜಮೀನು' },
    allPlots: { en: 'All Adjacent Plots', kn: 'ಎಲ್ಲಾ ಸುತ್ತಮುತ್ತಲಿನ ಜಮೀನುಗಳು' },
    cultivatingOnly: { en: 'Actively Cultivated', kn: 'ಬೆಳೆಸಿದ ಜಮೀನುಗಳು' },
    emptyOnly: { en: 'Empty Land (Fallow)', kn: 'ಖಾಲಿ / ಬೀಳು ಜಮೀನು' },
    noAdjacentFound: { en: 'No adjacent plot data found for this location.', kn: 'ಈ ಸ್ಥಳಕ್ಕೆ ಯಾವುದೇ ಸುತ್ತಮುತ್ತಲಿನ ಜಮೀನುಗಳ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.' },
    neighboursTitle: { en: 'Farmers Around My Land', kn: 'ನನ್ನ ಜಮೀನಿನ ಸುತ್ತಮುತ್ತಲಿನ ರೈತರು' },
    neighboursDesc: { en: 'Farmers surrounding your land and what they are growing', kn: 'ನಿಮ್ಮ ಜಮೀನಿನ ಸುತ್ತಲಿನ ರೈತರು ಮತ್ತು ಅವರು ಬೆಳೆಯುತ್ತಿರುವ ಬೆಳೆಗಳು' },
    sameTaluk: { en: 'Same Taluk', kn: 'ಅದೇ ತಾಲೂಕು' },
    sameHobli: { en: 'Same Hobli', kn: 'ಅದೇ ಹೋಬಳಿ' },
    cropDemandDist: { en: 'Crop Distribution & Competition', kn: 'ಬೆಳೆಗಳ ಹಂಚಿಕೆ ಮತ್ತು ಸ್ಪರ್ಧೆ' },
    farmers: { en: 'farmers', kn: 'ರೈತರು' },
    yieldAcre: { en: 'Yield/Acre', kn: 'ಇಳುವರಿ/ಎಕರೆ' },
    profitAcre: { en: 'Profit/Acre', kn: 'ಲಾಭ/ಎಕರೆ' },
    individualNeighbours: { en: 'Individual Neighbour Details', kn: 'ಪ್ರತ್ಯೇಕ ನೆರೆಹೊರೆಯ ರೈತರ ವಿವರಗಳು' },
    neighbourDetailsSub: { en: 'Latest year planting and performance data from nearby farmers', kn: 'ಸಮೀಪದ ರೈತರ ಇತ್ತೀಚಿನ ಕೃಷಿ ಇಳುವರಿ ಮತ್ತು ಲಾಭದ ಮಾಹಿತಿ' },
    compareWithRecommendations: { en: 'Compare with Your Recommended Varieties', kn: 'ನಿಮ್ಮ ಶಿಫಾರಸು ಮಾಡಿದ ತಳಿಗಳೊಂದಿಗೆ ಹೋಲಿಕೆ' },
    compareRecommendationsSub: { en: 'Compare varieties recommended for your soil and climate with what neighbouring farmers achieved', kn: 'ನಿಮ್ಮ ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಲಾದ ಬೆಳೆ ತಳಿಗಳನ್ನು ಸಮೀಪದ ರೈತರ ಸಾಧನೆಯೊಂದಿಗೆ ಹೋಲಿಕೆ ಮಾಡಿ' },
    recommendedForYou: { en: 'Recommended for You', kn: 'ನಿಮಗೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ' },
    varietiesPlanted: { en: 'Varieties Planted', kn: 'ಬೆಳೆದ ತಳಿಗಳು' },
    neighbourYield: { en: 'Neighbour Avg Yield', kn: 'ನೆರೆಹೊರೆಯವರ ಸರಾಸರಿ ಇಳುವರಿ' },
    marketPrice: { en: 'Market Price', kn: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ' },
    soilConditions: { en: 'Soil Conditions', kn: 'ಮಣ್ಣಿನ ಸ್ಥಿತಿ' },
    verifiedFarmerData: { en: 'Verified Local Farmer Records', kn: 'ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ಸ್ಥಳೀಯ ರೈತರ ದಾಖಲೆ' },
    demoSimulationData: { en: 'Demo Data (Agro-Climatic Baseline)', kn: 'ಡೆಮೊ ಮಾಹಿತಿ (ಕೃಷಿ ಹವಾಮಾನ ಮಾದರಿ)' },
    viewInNeighbours: { en: 'Compare in Neighbours Tab', kn: 'ನೆರೆಹೊರೆಯವರ ಪುಟದಲ್ಲಿ ಹೋಲಿಸಿ' },
    exploreVarieties: { en: 'Explore Varieties', kn: 'ತಳಿಗಳನ್ನು ನೋಡಿ' },
    farmersGrowing: { en: 'farmers growing this', kn: 'ರೈತರು ಬೆಳೆಯುತ್ತಿದ್ದಾರೆ' },
    recommendedVariety: { en: 'Recommended Variety', kn: 'ಶಿಫಾರಸು ಮಾಡಿದ ತಳಿ' },
    adoptionLevel: { en: 'Adoption Level', kn: 'ಬೆಳೆಯುತ್ತಿರುವ ಪ್ರಮಾಣ' },
    nicheOpportunity: { en: 'High Opportunity (Low local competition)', kn: 'ಉತ್ತಮ ಅವಕಾಶ (ಕಡಿಮೆ ಸ್ಥಳೀಯ ಸ್ಪರ್ಧೆ)' },
    highCompetition: { en: 'High Competition (Commonly grown)', kn: 'ಹೆಚ್ಚು ಬೆಳೆಯುತ್ತಿರುವ ಬೆಳೆ (ಹೆಚ್ಚು ಸ್ಪರ್ಧೆ)' },
    balancedAdoption: { en: 'Balanced Local Demand', kn: 'ಸಮತೋಲಿತ ಸ್ಥಳೀಯ ಬೇಡಿಕೆ' },

    // My Farm History
    farmHistoryTitle: { en: 'My Farm Performance History', kn: 'ನನ್ನ ಹೊಲದ ಸಾಪ್ತಾಹಿಕ/ವಾರ್ಷಿಕ ಪ್ರಗತಿ' },
    farmerID: { en: 'Farmer ID:', kn: 'ರೈತ ಐಡಿ:' },
    primaryCrop: { en: 'Primary Crop', kn: 'ಮುಖ್ಯ ಬೆಳೆ' },
    annualYieldTrend: { en: 'Annual Yield Trend', kn: 'ವಾರ್ಷಿಕ ಇಳುವರಿ ಪ್ರವೃತ್ತಿ' },
    annualProfitTrend: { en: 'Annual Net Profit Trend', kn: 'ವಾರ್ಷಿಕ ನಿವ್ವಳ ಲಾಭ' },
    performanceNote: { en: 'Performance Note:', kn: 'ಪ್ರಗತಿಯ ವಿವರಣೆ:' },

    // Weather/Soil Details
    soilMoisture: { en: 'Soil Moisture', kn: 'ಮಣ್ಣಿನ ತೇವಾಂಶ' },
    soilTemp: { en: 'Soil Temp', kn: 'ಮಣ್ಣಿನ ತಾಪಮಾನ' },
    rainToday: { en: 'Rain Today', kn: 'ಇಂದಿನ ಮಳೆ' },
    rainCurrent: { en: 'Current Rain', kn: 'ಪ್ರಸ್ತುತ ಮಳೆ' },
    rainAnnual: { en: 'Avg. Annual Rainfall', kn: 'ಸರಾಸರಿ ವಾರ್ಷಿಕ ಮಳೆ' },

    // Bhoomi Map
    bhoomiMapTitle: { en: 'Bhoomi RTC Land Boundary Map', kn: 'ಭೂಮಿ ಆರ್.ಟಿ.ಸಿ ಜಮೀನು ನಕ್ಷೆ' },
    bhoomiMapDesc: { en: 'Interactive cadastral map from Karnataka Bhoomi Portal showing survey boundaries of your farm and neighboring plots.', kn: 'ಕರ್ನಾಟಕ ಭೂಮಿ ಪೋರ್ಟಲ್‌ನಿಂದ ನಿಮ್ಮ ಮತ್ತು ನೆರೆಹೊರೆಯ ಜಮೀನಿನ ಗಡಿ ಮತ್ತು ಆರ್.ಟಿ.ಸಿ ವಿವರಗಳನ್ನು ತೋರಿಸುವ ಸಂವಾದಾತ್ಮಕ ನಕ್ಷೆ.' },
    bhoomiRtcTitle: { en: 'BHOOMI LAND RTC RECORD', kn: 'ಭೂಮಿ ಜಮೀನು ಆರ್.ಟಿ.ಸಿ ದಾಖಲೆ' },
    bhoomiGovt: { en: 'Government of Karnataka', kn: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ' },
    ownerNameLabel: { en: 'Land Owner Name', kn: 'ಭೂಮಾಲೀಕರ ಹೆಸರು' },
    landClassLabel: { en: 'Land Classification', kn: 'ಜಮೀನು ವರ್ಗೀಕರಣ' },
    cropGrownLabel: { en: 'Active Crop Grown', kn: 'ಬೆಳೆಸಿದ ಬೆಳೆ' },
    soilTypeLabel: { en: 'Soil Type', kn: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ' },
    areaLabel: { en: 'Land Extent', kn: 'ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ' },
    userLandHighlight: { en: 'Your Land (Center)', kn: 'ನಿಮ್ಮ ಜಮೀನು (ಕೇಂದ್ರ)' },
    clickLandParcel: { en: 'Click on any land parcel to view its official Bhoomi RTC land record.', kn: 'ಅಧಿಕೃತ ಭೂಮಿ ಆರ್.ಟಿ.ಸಿ ದಾಖಲೆಯನ್ನು ನೋಡಲು ಯಾವುದೇ ಜಮೀನಿನ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ.' },
    villageLabel: { en: 'Village', kn: 'ಗ್ರಾಮ' },
    surveyNoLabel: { en: 'Survey No', kn: 'ಸರ್ವೇ ಸಂಖ್ಯೆ' },
    hissaNoLabel: { en: 'Hissa/Partition No', kn: 'ಹಿಸ್ಸಾ ಸಂಖ್ಯೆ' },
    fallowStatus: { en: 'Uncultivated / Fallow Land', kn: 'ಖಾಲಿ / ಬೀಳು ಜಮೀನು' },
    statusLabel: { en: 'Land Status', kn: 'ಸ್ಥಿತಿ' },
    recommendedCropsLabel: { en: 'Suggested Crops', kn: 'ಸೂಚಿಸಲಾದ ಬೆಳೆಗಳು' },
    suggestedWorkLabel: { en: 'Suggested Work', kn: 'ಸೂಚಿಸಲಾದ ಕೆಲಸಗಳು' },
    fallowLegend: { en: 'Fallow / Empty Land', kn: 'ಬೀಳು ಜಮೀನು' },

    // Crop Species & Varieties
    cropSpeciesTitle: { en: 'Recommended Varieties', kn: 'ಶಿಫಾರಸು ಮಾಡಿದ ತಳಿಗಳು' },
    cropSpeciesSubtitle: { en: 'Authentic cultivars adapted to local soil, climate, and rainfall conditions.', kn: 'ಸ್ಥಳೀಯ ಮಣ್ಣು, ಹವಾಮಾನ ಮತ್ತು ಮಳೆಯ ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುವ ಅಧಿಕೃತ ತಳಿಗಳು.' },
    viewSpecies: { en: 'View Varieties', kn: 'ತಳಿಗಳನ್ನು ನೋಡಿ' },
    hideSpecies: { en: 'Hide Varieties', kn: 'ತಳಿಗಳನ್ನು ಮರೆಮಾಡಿ' },
    varietyCultivar: { en: 'Variety', kn: 'ತಳಿ' },
    scientificName: { en: 'Botanical Name', kn: 'ಸಸ್ಯಶಾಸ್ತ್ರೀಯ ಹೆಸರು' },
    pricePerUnit: { en: 'Market Rate', kn: 'ಮಾರುಕಟ್ಟೆ ದರ' },
    duration: { en: 'Duration', kn: 'ಬೆಳೆಯುವ ಅವಧಿ' },
    days: { en: 'days', kn: 'ದಿನಗಳು' },
    expectedYield: { en: 'Expected Yield', kn: 'ನಿರೀಕ್ಷಿತ ಇಳುವರಿ' },
    season: { en: 'Season', kn: 'ಋತುಮಾನ' },
    characteristics: { en: 'Agronomic Notes', kn: 'ಕೃಷಿ ಮಾಹಿತಿ' },
    selectVarietyForProfit: { en: 'Use in Profit Estimator', kn: 'ಲಾಭದ ಅಂದಾಜಿನಲ್ಲಿ ಬಳಸಿ' },
    varietySelectorLabel: { en: 'Select Crop Variety', kn: 'ಬೆಳೆ ತಳಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' },
    defaultVarietyOption: { en: 'Standard Regional Variety', kn: 'ಸಾಮಾನ್ಯ ಪ್ರಾದೇಶಿಕ ತಳಿ' },
    varietyDetailsBadge: { en: 'Selected Variety', kn: 'ಆಯ್ಕೆಮಾಡಿದ ತಳಿ' },
    priceRangeLabel: { en: 'Rate Range', kn: 'ದರ ಶ್ರೇಣಿ' },
    varietiesAvailable: { en: 'verified varieties', kn: 'ದೃಢೀಕರಿಸಿದ ತಳಿಗಳು' },
    soilRequirements: { en: 'Soil Type & pH', kn: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ ಮತ್ತು ಪಿ.ಎಚ್' },
    climateRequirements: { en: 'Temperature & Rainfall', kn: 'ತಾಪಮಾನ ಮತ್ತು ಮಳೆ' },
    growingSeason: { en: 'Recommended Season', kn: 'ಸೂಕ್ತ ಋತುಮಾನ' },
    maturityPeriod: { en: 'Days to Maturity', kn: 'ಕಟಾವಿಗೆ ಬೇಕಾಗುವ ದಿನಗಳು' },
    expectedYieldLabel: { en: 'Expected Yield', kn: 'ನಿರೀಕ್ಷಿತ ಇಳುವರಿ' },
    suitabilityMatch: { en: 'Condition Match', kn: 'ಹೊಂದಾಣಿಕೆ ಪ್ರಮಾಣ' },
    highlyRecommended: { en: 'Recommended Cultivar', kn: 'ಶಿಫಾರಸು ಮಾಡಿದ ತಳಿ' },
    suitableBadge: { en: 'Suitable', kn: 'ಸೂಕ್ತವಾಗಿದೆ' },
    moderateBadge: { en: 'Moderate', kn: 'ಮಧ್ಯಮ' },
    bestForYourLand: { en: 'Top Recommended Variety', kn: 'ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ತಳಿ' },
    topVarietiesLabel: { en: 'Recommended Cultivars', kn: 'ಶಿಫಾರಸು ಮಾಡಿದ ತಳಿಗಳು' },
    exploreVarietiesBtn: { en: 'All Varieties', kn: 'ಎಲ್ಲಾ ತಳಿಗಳು' },
    filterAllSeason: { en: 'All Seasons', kn: 'ಎಲ್ಲಾ ಋತುಗಳು' },
    filterKharif: { en: 'Kharif', kn: 'ಖಾರೀಫ್' },
    filterRabi: { en: 'Rabi', kn: 'ರಬಿ' },
    filterSummer: { en: 'Summer', kn: 'ಬೇಸಿಗೆ' },
    sortByMatch: { en: 'Best Match', kn: 'ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ' },
    sortByYield: { en: 'Highest Yield', kn: 'ಗರಿಷ್ಠ ಇಳುವರಿ' },
    sortByPrice: { en: 'Market Rate', kn: 'ಮಾರುಕಟ್ಟೆ ದರ' },
    sortByDuration: { en: 'Maturity (Shortest)', kn: 'ಕಡಿಮೆ ಅವಧಿ' },
    closeModal: { en: 'Close', kn: 'ಮುಚ್ಚಿ' },
    bestRegionsLabel: { en: 'Adapted Districts', kn: 'ಹೊಂದಿಕೊಳ್ಳುವ ಜಿಲ್ಲೆಗಳು' },
    matchReasonsLabel: { en: 'Agronomic Fit', kn: 'ಕೃಷಿ ಸೂಕ್ತತೆ' },
    modalTitle: { en: 'Crop Varieties & Cultivars', kn: 'ಬೆಳೆ ತಳಿಗಳು ಮತ್ತು ಪ್ರಭೇದಗಳು' },

    // Additional Kannada Full-Model Localization Keys
    priceTrendingUp: { en: 'Price Trending Up', kn: 'ಬೆಲೆ ಹೆಚ್ಚುತ್ತಿದೆ' },
    priceTrendingDown: { en: 'Price Trending Down', kn: 'ಬೆಲೆ ಇಳಿಕೆಯಾಗುತ್ತಿದೆ' },
    priceStable: { en: 'Price Stable', kn: 'ದರ ಸ್ಥಿರವಾಗಿದೆ' },
    currentMarketRate: { en: 'Current Market Rate', kn: 'ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ದರ' },
    selectAnotherCrop: { en: '← Select Another Crop', kn: '← ಮತ್ತೊಂದು ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' },
    commoditiesCount: { en: 'commodities', kn: 'ವಸ್ತುಗಳು / ಬೆಳೆಗಳು' },
    noMarketDataToday: { en: 'No Market Data Available Today', kn: 'ಇಂದು ಮಾರುಕಟ್ಟೆ ದರಗಳು ಲಭ್ಯವಿಲ್ಲ' },
    noMarketDataDesc: { en: 'No APMC price data was reported for this district today. Try selecting a different district or check back tomorrow.', kn: 'ಈ ಜಿಲ್ಲೆಗೆ ಇಂದು ಯಾವುದೇ ಎಪಿಎಂಸಿ ದರಗಳು ವರದಿಯಾಗಿಲ್ಲ. ಬೇರೆ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನಾಳೆ ಪರಿಶೀಲಿಸಿ.' },
    selectedForEstimator: { en: 'Selected for Estimator', kn: 'ಅಂದಾಜಿಗೆ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ' },
    selected: { en: 'Selected', kn: 'ಆಯ್ಕೆಯಾಗಿದೆ' },
    allMarketRates: { en: 'All Market Rates', kn: 'ಎಲ್ಲಾ ಮಾರುಕಟ್ಟೆ ದರಗಳು' },
    rateRange: { en: 'Rate Range', kn: 'ದರ ಶ್ರೇಣಿ' },
    botanicalGenus: { en: 'Botanical Genus', kn: 'ಸಸ್ಯ ಕುಲ (Genus)' },
    botanicalName: { en: 'Botanical Name', kn: 'ಸಸ್ಯಶಾಸ್ತ್ರೀಯ ಹೆಸರು' },
    agronomicNote: { en: 'Agronomic Note', kn: 'ಕೃಷಿ ಮಾಹಿತಿ' },
    searchVarietyPlaceholder: { en: 'Search by variety name, traits, or soil...', kn: 'ತಳಿ ಹೆಸರು, ಲಕ್ಷಣ ಅಥವಾ ಮಣ್ಣಿನ ಪ್ರಕಾರದಿಂದ ಹುಡುಕಿ...' },
    loadingCultivars: { en: 'Loading cultivars and agronomic data...', kn: 'ತಳಿಗಳು ಮತ್ತು ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' },
    noVarietiesMatch: { en: 'No varieties match the selected filters. Select "All Seasons" or clear your search.', kn: 'ಆಯ್ಕೆಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ತಳಿಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ. "ಎಲ್ಲಾ ಋತುಗಳು" ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಹುಡುಕಾಟವನ್ನು ತೆರವುಗೊಳಿಸಿ.' },
    loadingSpecies: { en: 'Loading species varieties & prices...', kn: 'ತಳಿ ಪ್ರಭೇದಗಳು ಮತ್ತು ದರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' },
    sort: { en: 'Sort:', kn: 'ವಿಂಗಡಿಸಿ:' },
    profitEstimationBanner: { en: 'Profit estimate will use specific cultivar rate:', kn: 'ಲಾಭದ ಅಂದಾಜಿಗೆ ಈ ತಳಿಯ ದರವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ:' },
    perAcreUnit: { en: 'per acre', kn: 'ಎಕರೆಗೆ' },
    ofRevenueSub: { en: '~40% of revenue', kn: 'ಆದಾಯದ ~40% ರಷ್ಟು' },
    annualAverage: { en: 'Annual Average', kn: 'ವಾರ್ಷಿಕ ಸರಾಸರಿ' },
    forecast: { en: 'Forecast', kn: 'ಮುನ್ಸೂಚನೆ' },
    liveHour: { en: 'Live hour', kn: 'ಪ್ರಸ್ತುತ ಗಂಟೆ' },
    rtcRecord: { en: 'RTC Record', kn: 'ಆರ್.ಟಿ.ಸಿ ದಾಖಲೆ' },
    climateSoilLoading: { en: 'Fetching climate & soil parameters...', kn: 'ಹವಾಮಾನ ಮತ್ತು ಮಣ್ಣಿನ ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ...' },
    regionalDefaults: { en: 'Regional Defaults', kn: 'ಪ್ರಾದೇಶಿಕ ಗುಣಲಕ್ಷಣಗಳು' },
    verifiedFarmerProfile: { en: 'Verified Farmer Profile', kn: 'ದೃಢೀಕೃತ ರೈತ ಖಾತೆ' },
    totalLandArea: { en: 'Total Land Area', kn: 'ಒಟ್ಟು ಜಮೀನು ವಿಸ್ತೀರ್ಣ' },
    fiveYearCultivationYields: { en: '5-Year Cultivation Yields', kn: 'ಕಳೆದ 5 ವರ್ಷಗಳ ಇಳುವರಿ' },
    grossAnnualRevenue: { en: 'Gross Annual Harvest Revenue', kn: 'ವಾರ್ಷಿಕ ಒಟ್ಟು ವಹಿವಾಟು' },
    farmOperationalCost: { en: 'Est. Farm Operational Input Cost', kn: 'ಅಂದಾಜು ಕೃಷಿ ಉತ್ಪಾದನಾ ವೆಚ್ಚ' },
    estimatedNetReturns: { en: 'Estimated Net Farm Returns', kn: 'ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ' },
    performanceNoteDesc: { en: 'Your yield was highest in', kn: 'ನಿಮ್ಮ ಗರಿಷ್ಠ ಇಳುವರಿ ದಾಖಲಾದ ವರ್ಷ' },
    withTotalProfit: { en: 'with a total profit of', kn: 'ಒಟ್ಟು ಗಳಿಸಿದ ಲಾಭ' },
    analyzingPerformance: { en: 'Analyzing your performance data from 2021 to 2025.', kn: '2021 ರಿಂದ 2025 ರವರೆಗಿನ ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಗತಿ ವಿಶ್ಲೇಷಣೆ.' },
    adjacentPlots: { en: 'Adjacent Plots', kn: 'ಸುತ್ತಮುತ್ತಲಿನ ಜಮೀನುಗಳು' },
    cultivating: { en: 'Cultivating', kn: 'ಕೃಷಿ ಮಾಡುತ್ತಿರುವವರು' },
    leftLandEmpty: { en: 'Left Land Empty', kn: 'ಖಾಲಿ / ಬೀಳು ಜಮೀನು' },
    loadingAdjacent: { en: 'Loading adjacent landholders and crop details...', kn: 'ಸುತ್ತಮುತ್ತಲಿನ ರೈತರು ಮತ್ತು ಬೆಳೆ ವಿವರಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...' },
    emptyFallowNotice: { en: 'This land was left empty / fallow.', kn: 'ಈ ಜಮೀನಿನಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಬೆಳೆ ಬೆಳೆದಿಲ್ಲ (ಖಾಲಿ / ಬೀಳು ಜಮೀನು).' },
    soilAndPH: { en: 'Soil & pH', kn: 'ಮಣ್ಣು ಮತ್ತು ಪಿಹೆಚ್' },
    climate: { en: 'Climate', kn: 'ಹವಾಮಾನ' },
    maturity: { en: 'Maturity', kn: 'ಅವಧಿ' },
    yield: { en: 'Yield', kn: 'ಇಳುವರಿ' },
    optimalPH: { en: 'Optimal pH', kn: 'ಸೂಕ್ತ ಪಿಹೆಚ್' },
    match: { en: 'match', kn: 'ಹೊಂದಾಣಿಕೆ' },
    viewProfile: { en: 'View Farmer Profile', kn: 'ರೈತರ ವಿವರ ನೋಡಿ' },
    selectState: { en: 'Select State', kn: 'ರಾಜ್ಯ ಆಯ್ಕೆಮಾಡಿ' },
    mobilePlaceholder: { en: '10-digit mobile', kn: '10 ಅಂಕಿಯ ಮೊಬೈಲ್' },
    surveyPlaceholder: { en: 'e.g. 123/A', kn: 'ಉದಾ: 123/ಎ' },
    passwordPlaceholder: { en: 'Choose a strong password', kn: 'ಬಲವಾದ ಪಾಸ್‌ವರ್ಡ್ ಆಯ್ಕೆಮಾಡಿ' },
    acresPlaceholder: { en: 'e.g. 5.5', kn: 'ಉದಾ: 5.5' },
    guntasPlaceholder: { en: 'e.g. 100', kn: 'ಉದಾ: 100' },
    profitSurveyPlaceholder: { en: 'e.g. 120/3', kn: 'ಉದಾ: 120/3' },
    goodTimeToSellNotice: { en: 'Good time to sell! The market price is trending upward.', kn: 'ಮಾರಾಟ ಮಾಡಲು ಉತ್ತಮ ಸಮಯ! ಮಾರುಕಟ್ಟೆ ದರ ಏರಿಕೆಯಾಗುತ್ತಿದೆ.' },
    considerHoldingNotice: { en: 'Consider holding. The market price is declining.', kn: 'ದಾಸ್ತಾನು ಕಾಯ್ದಿರಿಸುವುದು ಉತ್ತಮ. ಮಾರುಕಟ್ಟೆ ದರ ಇಳಿಕೆಯಾಗುತ್ತಿದೆ.' },
    marketStableNotice: { en: 'Market is stable. You can sell at your convenience.', kn: 'ಮಾರುಕಟ್ಟೆ ಸ್ಥಿರವಾಗಿದೆ. ನಿಮ್ಮ ಅನುಕೂಲಕ್ಕೆ ತಕ್ಕಂತೆ ಮಾರಾಟ ಮಾಡಬಹುದು.' },
    noAdjacentFoundDesc: { en: 'Please enter your survey number above to discover adjacent farmers.', kn: 'ಸುತ್ತಮುತ್ತಲಿನ ರೈತರನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ಮೇಲೆ ನಿಮ್ಮ ಸರ್ವೇ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.' },
    notProvided: { en: 'Not Provided', kn: 'ನೀಡಲಾಗಿಲ್ಲ' },
    farmer: { en: 'Farmer', kn: 'ರೈತರು' },
    inr: { en: 'INR', kn: 'ರೂಪಾಯಿ' },
    average: { en: 'Avg', kn: 'ಸರಾಸರಿ' },
    clickToViewCultivar: { en: 'Click to view cultivar details', kn: 'ತಳಿ ವಿವರಗಳನ್ನು ನೋಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ' },
    dataSourceGov: { en: 'Source: data.gov.in', kn: 'ಮೂಲ: data.gov.in' },
    karnataka: { en: 'Karnataka', kn: 'ಕರ್ನಾಟಕ' },
    liveBadge: { en: 'LIVE', kn: 'ಲೈವ್' },
    openMeteoLive: { en: 'LIVE (Open-Meteo)', kn: 'ನೇರ ಹವಾಮಾನ (ಓಪನ್-ಮೆಟಿಯೋ)' },
    openMeteo07: { en: 'Open-Meteo 0-7cm', kn: 'ಓಪನ್-ಮೆಟಿಯೋ ೦-೭ಸೆಂ.ಮೀ' },
    openMeteoVolumetric: { en: 'Open-Meteo Volumetric', kn: 'ಓಪನ್-ಮೆಟಿಯೋ ತೇವಾಂಶ ಮಾಪನ' }
};

export const toKannadaDigits = (val: any, lang: Language): string => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (lang !== 'kn') return str;
    const kannadaDigits = ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'];
    return str.replace(/[0-9]/g, (d) => kannadaDigits[parseInt(d, 10)]);
};

export const formatUnit = (unit: string, lang: Language): string => {
    if (!unit) return '';
    if (lang !== 'kn') return unit;
    const u = unit.toLowerCase().trim();
    if (u === 'kg' || u === 'kgs') return 'ಕಿಲೋಗ್ರಾಂ';
    if (u === 'quintal' || u === 'quintals' || u === 'q') return 'ಕ್ವಿಂಟಾಲ್';
    if (u === 'tonne' || u === 'tonnes' || u === 't') return 'ಟನ್';
    if (u === 'acre' || u === 'acres') return 'ಎಕರೆ';
    if (u === 'guntha' || u === 'guntas') return 'ಗುಂಟೆ';
    if (u === 'mm') return 'ಮಿ.ಮೀ';
    if (u === 'mm/h') return 'ಮಿ.ಮೀ/ಗಂಟೆ';
    if (u === 'inr') return 'ರೂಪಾಯಿ';
    return unit;
};

export const districtTranslations: Record<string, string> = {
    "Bagalkot": "ಬಾಗಲಕೋಟೆ", "Ballari": "ಬಳ್ಳಾರಿ", "Belagavi": "ಬೆಳಗಾವಿ",
    "Bengaluru Rural": "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ", "Bengaluru Urban": "ಬೆಂಗಳೂರು ನಗರ",
    "Bidar": "ಬೀದರ್", "Chamarajanagar": "ಚಾಮರಾಜನಗರ", "Chikkaballapur": "ಚಿಕ್ಕಬಳ್ಳಾಪುರ",
    "Chikkamagaluru": "ಚಿಕ್ಕಮಗಳೂರು", "Chitradurga": "ಚಿತ್ರದುರ್ಗ",
    "Dakshina Kannada": "ದಕ್ಷಿಣ ಕನ್ನಡ", "Davanagere": "ದಾವಣಗೆರೆ", "Dharwad": "ಧಾರವಾಡ",
    "Gadag": "ಗದಗ", "Hassan": "ಹಾಸನ", "Haveri": "ಹಾವೇರಿ",
    "Kalaburagi": "ಕಲಬುರಗಿ", "Kodagu": "ಕೊಡಗು", "Kolar": "ಕೋಲಾರ",
    "Koppal": "ಕೊಪ್ಪಳ", "Mandya": "ಮಂಡ್ಯ", "Mysuru": "ಮೈಸೂರು", "Raichur": "ರಾಯಚೂರು",
    "Ramanagara": "ರಾಮನಗರ", "Shivamogga": "ಶಿವಮೊಗ್ಗ", "Tumakuru": "ತುಮಕೂರು",
    "Udupi": "ಉಡುಪಿ", "Uttara Kannada": "ಉತ್ತರ ಕನ್ನಡ", "Vijayanagara": "ವಿಜಯನಗರ",
    "Vijayapura": "ವಿಜಯಪುರ", "Yadgir": "ಯಾದಗಿರಿ",
    "Karnataka": "ಕರ್ನಾಟಕ"
};

export const getDistrictName = (district: string, lang: Language): string => {
    if (!district) return '';
    if (lang !== 'kn') return district;
    return districtTranslations[district] || district;
};

export const talukTranslations: Record<string, string> = {
    // Dakshina Kannada Taluks & Hoblis
    "Mangaluru": "ಮಂಗಳೂರು", "Mangalore": "ಮಂಗಳೂರು", "Bantwal": "ಬಂಟ್ವಾಳ", "Belthangady": "ಬೆಳ್ತಂಗಡಿ",
    "Puttur": "ಪುತ್ತೂರು", "Sullia": "ಸುಳ್ಯ", "Moodabidri": "ಮೂಡುಬಿದಿರೆ", "Moodbidri": "ಮೂಡುಬಿದಿರೆ", 
    "Moodbidre": "ಮೂಡುಬಿದಿರೆ", "Kadaba": "ಕಡಬ",
    "Kasaba": "ಕಸಬ", "Gurupura": "ಗುರುಪುರ", "Surathkal": "ಸುರತ್ಕಲ್", "Mulki": "ಮುಲ್ಕಿ",
    "Panambur": "ಪಣಂಬೂರು", "Ullal": "ಉಳ್ಳಾಲ", "Haleyangadi": "ಹಳೆಯಂಗಡಿ",
    "Mangaluru A": "ಮಂಗಳೂರು ಎ", "Mangaluru B": "ಮಂಗಳೂರು ಬಿ",
    "Padumarnadu": "ಪಡುಮಾರ್ನಾಡು", "Moodabidri Kasaba": "ಮೂಡುಬಿದಿರೆ ಕಸಬ",
    "Belavai": "ಬೆಳವಾಯಿ", "Puttige": "ಪುತ್ತಿಗೆ", "Mijar": "ಮಿಜಾರು",
    "Panemangaluru": "ಪಾಣೆಮಂಗಳೂರು", "Vittal": "ವಿಟ್ಲ", "Rayi": "ರಾಯಿ", "Navoor": "ನವೂರು",
    "Uppinangady": "ಉಪ್ಪಿನಂಗಡಿ", "Nelyadi": "ನೆಲ್ಯಾಡಿ", "Venur": "ವೇಣೂರು", "Kokkada": "ಕೊಕ್ಕಡ",
    "Dharmasthala": "ಧರ್ಮಸ್ಥಳ", "Poonjalkatte": "ಪುಂಜಾಲಕಟ್ಟೆ", "Panja": "ಪಂಜ", "Bellare": "ಬೆಳ್ಳಾರೆ",
    "Subrahmanya": "ಸುಬ್ರಹ್ಮಣ್ಯ", "Kadaba Kasaba": "ಕಡಬ ಕಸಬ",
    
    // Udupi & Coastal
    "Udupi": "ಉಡುಪಿ", "Kundapura": "ಕುಂದಾಪುರ", "Karkala": "ಕಾರ್ಕಳ", "Byndoor": "ಬೈಂದೂರು",
    "Brahmavara": "ಬ್ರಹ್ಮಾವರ", "Hebri": "ಹೆಬ್ರಿ", "Kaup": "ಕಾಪು",
    
    // Kodagu
    "Madikeri": "ಮಡಿಕೇರಿ", "Virajpet": "ವಿರಾಜಪೇಟೆ", "Somwarpet": "ಸೋಮವಾರಪೇಟೆ",
    "Kushalnagar": "ಕುಶಾಲನಗರ", "Ponnampet": "ಪೊನ್ನಂಪೇಟೆ",
    
    // Uttara Kannada Taluks & Hoblis
    "Sirsi": "ಶಿರಸಿ", "Karwar": "ಕಾರವಾರ", "Kumta": "ಕುಮಟಾ", "Bhatkal": "ಭಟ್ಕಳ",
    "Ankola": "ಅಂಕೋಲಾ", "Honnavar": "ಹೊನ್ನಾವರ", "Siddapur": "ಸಿದ್ದಾಪುರ", "Yellapur": "ಯಲ್ಲಾಪುರ",
    "Mundgod": "ಮುಂಡಗೋಡ", "Haliyal": "ಹಳಿಯಾಳ", "Joida": "ಜೋಯಿಡಾ", "Dandeli": "ದಾಂಡೇಲಿ",
    "Karwar Kasaba": "ಕಾರವಾರ ಕಸಬ", "Asnoti": "ಅಸ್ನೋಟಿ", "Majali": "ಮಾಜಾಳಿ", "Shirwad": "ಶಿರ್ವಾಡ",
    "Hattikeri": "ಹಟ್ಟಿಕೇರಿ", "Poojageri": "ಪೂಜಾಗೇರಿ", "Gokarna": "ಗೋಕರ್ಣ", "Hiregutti": "ಹಿರೇಗುತ್ತಿ",
    "Mirjan": "ಮಿರ್ಜಾನ್", "Manki": "ಮಂಕಿ", "Gersoppa": "ಗೇರುಸೊಪ್ಪ", "Haldipur": "ಹಳದಿಪುರ",
    "Shirali": "ಶಿರಾಲಿ", "Murdeshwar": "ಮುರ್ಡೇಶ್ವರ", "Banavasi": "ಬನವಾಸಿ", "Sampkhand": "ಸಂಪಖಂಡ",
    "Hulekal": "ಹುಲೇಕಲ್", "Bilgi": "ಬಿಳಗಿ", "Kyadgi": "ಕ್ಯಾದಗಿ", "Harsikatta": "ಹರ್ಸಿಕಟ್ಟ",
    "Kirwatti": "ಕಿರ್ವತ್ತಿ", "Manchikere": "ಮಂಚಿಕೇರಿ", "Ambikanagar": "ಅಂಬಿಕಾನಗರ",
    
    // South Interior Karnataka
    "Mysuru": "ಮೈಸೂರು", "Nanjangud": "ನಂಜನಗೂಡು", "Hunsur": "ಹುಣಸೂರು", "Piriyapatna": "ಪಿರಿಯಾಪಟ್ಟಣ",
    "Mandya": "ಮಂಡ್ಯ", "Maddur": "ಮದ್ದೂರು", "Malavalli": "ಮಳವಳ್ಳಿ", "Pandavapura": "ಪಾಂಡವಪುರ",
    "Srirangapatna": "ಶ್ರೀರಂಗಪಟ್ಟಣ", "Nagamangala": "ನಾಗಮಂಗಲ", "Krishnarajpet": "ಕೃಷ್ಣರಾಜಪೇಟೆ",
    "Hassan": "ಹಾಸನ", "Alur": "ಆಲೂರು", "Belur": "ಬೇಲೂರು", "Sakleshpur": "ಸಕಲೇಶಪುರ",
    "Channarayapatna": "ಚನ್ನರಾಯಪಟ್ಟಣ", "Arsikere": "ಅರಸೀಕೆರೆ",
    "Shivamogga": "ಶಿವಮೊಗ್ಗ", "Bhadravati": "ಭದ್ರಾವತಿ", "Sagar": "ಸಾಗರ", "Shikaripura": "ಶಿಕಾರಿಪುರ",
    "Thirthahalli": "ತೀರ್ಥಹಳ್ಳಿ", "Hosanagara": "ಹೊಸನಗರ",
    "Chikkamagaluru": "ಚಿಕ್ಕಮಗಳೂರು", "Kadur": "ಕಡೂರು", "Tarikere": "ತರೀಕೆರೆ", "Mudigere": "ಮೂಡಿಗೆರೆ",
    "Koppa": "ಕೊಪ್ಪ", "Sringeri": "ಶೃಂಗೇರಿ", "Narasimharajapura": "ನರಸಿಂಹರಾಜಪುರ",
    "Davanagere": "ದಾವಣಗೆರೆ", "Harihar": "ಹರಿಹರ", "Channagiri": "ಚನ್ನಗಿರಿ",
    "Chitradurga": "ಚಿತ್ರದುರ್ಗ", "Challakere": "ಚಳ್ಳಕೆರೆ", "Hiriyur": "ಹಿರಿಯೂರು",
    "Tumakuru": "ತುಮಕೂರು", "Tiptur": "ತಿಪಟೂರು", "Kunigal": "ಕುಣಿಗಲ್", "Sira": "ಶಿರಾ",
    
    // North Karnataka & Hyderabad Karnataka
    "Belagavi": "ಬೆಳಗಾವಿ", "Athani": "ಅಥಣಿ", "Bailhongal": "ಬೈಲಹೊಂಗಲ", "Chikkodi": "ಚಿಕ್ಕೋಡಿ", "Gokak": "ಗೋಕಾಕ",
    "Dharwad": "ಧಾರವಾಡ", "Hubballi": "ಹುಬ್ಬಳ್ಳಿ", "Hubli": "ಹುಬ್ಬಳ್ಳಿ", "Kundgol": "ಕುಂದಗೋಳ",
    "Gadag": "ಗದಗ", "Naragund": "ನರಗುಂದ", "Haveri": "ಹಾವೇರಿ", "Ranebennur": "ರಾಣೆಬೆನ್ನೂರು",
    "Bagalkot": "ಬಾಗಲಕೋಟೆ", "Badami": "ಬಾದಾಮಿ", "Mudhol": "ಮುಧೋಳ", "Jamkhandi": "ಜಮಖಂಡಿ",
    "Ballari": "ಬಳ್ಳಾರಿ", "Hosapete": "ಹೊಸಪೇಟೆ", "Sandur": "ಸಂಡೂರು", "Siruguppa": "ಸಿರುಗುಪ್ಪ",
    "Kalaburagi": "ಕಲಬುರಗಿ", "Gulbarga": "ಕಲಬುರಗಿ", "Bidar": "ಬೀದರ್", "Raichur": "ರಾಯಚೂರು",
    "Koppal": "ಕೊಪ್ಪಳ", "Gangawati": "ಗಂಗಾವತಿ", "Yadgir": "ಯಾದಗಿರಿ", "Vijayapura": "ವಿಜಯಪುರ",
    
    // General terms
    "Taluk": "ತಾಲೂಕು", "District": "ಜಿಲ್ಲೆ", "Hobli": "ಹೋಬಳಿ"
};

export const getTalukName = (taluk: string, lang: Language): string => {
    if (!taluk) return '';
    if (lang !== 'kn') return taluk;
    const clean = taluk.trim();
    if (talukTranslations[clean]) return talukTranslations[clean];

    // Dynamic pattern matching for Kasaba / Hobli / Rural suffixes
    if (clean.endsWith(' Kasaba Hobli')) {
        const base = clean.replace(/ Kasaba Hobli$/, '');
        return `${talukTranslations[base] || base} ಕಸಬ ಹೋಬಳಿ`;
    }
    if (clean.endsWith(' Kasaba')) {
        const base = clean.replace(/ Kasaba$/, '');
        return `${talukTranslations[base] || base} ಕಸಬ`;
    }
    if (clean.endsWith(' Hobli')) {
        const base = clean.replace(/ Hobli$/, '');
        return `${talukTranslations[base] || base} ಹೋಬಳಿ`;
    }
    if (clean.endsWith(' Rural')) {
        const base = clean.replace(/ Rural$/, '');
        return `${talukTranslations[base] || base} ಗ್ರಾಮೀಣ`;
    }

    return talukTranslations[clean] || clean;
};

export const getHobliName = getTalukName;

// Farmer Name Translations & Transliterations
export const farmerNameTranslations: Record<string, string> = {
    // Explicit requested names
    'Rahul': 'ರಾಹುಲ್',
    'rahul': 'ರಾಹುಲ್',
    'RAHUL': 'ರಾಹುಲ್',
    'Padumarnadu': 'ಪಡುಮಾರ್ನಾಡು',
    'Moodabidri': 'ಮೂಡುಬಿದಿರೆ',

    // First names & common farmer names in Karnataka
    'Ramesh': 'ರಮೇಶ್', 'Suresh': 'ಸುರೇಶ್', 'Manjunath': 'ಮಂಜುನಾಥ್', 'Ganesh': 'ಗಣೇಶ್',
    'Shekhar': 'ಶೇಖರ್', 'Kempe': 'ಕೆಂಪೇ', 'Ananda': 'ಆನಂದ್', 'Anand': 'ಆನಂದ್',
    'Basavaraj': 'ಬಸವರಾಜ್', 'Nagaraj': 'ನಾಗರಾಜ್', 'Sharanappa': 'ಶರಣಪ್ಪ',
    'Venkatesh': 'ವೆಂಕಟೇಶ್', 'Kumar': 'ಕುಮಾರ್', 'Sathish': 'ಸತೀಶ್', 'Satish': 'ಸತೀಶ್',
    'Padma': 'ಪದ್ಮಾ', 'Parvathi': 'ಪಾರ್ವತಿ', 'Gopal': 'ಗೋಪಾಲ್',
    'Ashok': 'ಅಶೋಕ್', 'Kavitha': 'ಕವಿತಾ', 'Keshav': 'ಕೇಶವ್', 'Anil': 'ಅನಿಲ್',
    'Praveen': 'ಪ್ರವೀಣ್', 'Pradeep': 'ಪ್ರದೀಪ್', 'Mahesh': 'ಮಹೇಶ್', 'Santosh': 'ಸಂತೋಷ್',
    'Sunil': 'ಸುನಿಲ್', 'Shiva': 'ಶಿವ', 'Vijay': 'ವಿಜಯ್', 'Ajay': 'ಅಜಯ್',
    'Ravi': 'ರವಿ', 'Ravindra': 'ರವೀಂದ್ರ', 'Chandrashekhar': 'ಚಂದ್ರಶೇಖರ್',
    'Mahadev': 'ಮಹಾದೇವ', 'Sidda': 'ಸಿದ್ದ', 'Siddaraju': 'ಸಿದ್ದರಾಜು',
    'Raju': 'ರಾಜು', 'Somanna': 'ಸೋಮಣ್ಣ', 'Ningappa': 'ನಿಂಗಪ್ಪ', 'Mallappa': 'ಮಲ್ಲಪ್ಪ',
    'Hanumanth': 'ಹನುಮಂತ', 'Lakshman': 'ಲಕ್ಷ್ಮಣ', 'Ram': 'ರಾಮ್', 'Krishna': 'ಕೃಷ್ಣ',
    'Somesh': 'ಸೋಮೇಶ್', 'Harish': 'ಹರೀಶ್', 'Devendra': 'ದೇವೇಂದ್ರ', 'Kiran': 'ಕಿರಣ್',
    'Rohit': 'ರೋಹಿತ್', 'Sachin': 'ಸಚಿನ್', 'Deepak': 'ದೀಪಕ್', 'Naveen': 'ನವೀನ್',
    'Chandra': 'ಚಂದ್ರ', 'Lokesh': 'ಲೋಕೇಶ್', 'Prashanth': 'ಪ್ರಶಾಂತ್', 'Nagaraju': 'ನಾಗರಾಜು',
    'Pooja': 'ಪೂಜಾ', 'Radha': 'ರಾಧಾ', 'Suma': 'ಸುಮಾ', 'Lakshmi': 'ಲಕ್ಷ್ಮಿ',
    'Roopa': 'ರೂಪಾ', 'Deepa': 'ದೀಪಾ', 'Shwetha': 'ಶ್ವೇತಾ', 'Sowmya': 'ಸೌಮ್ಯಾ',

    // Surnames / Family names
    'Gowda': 'ಗೌಡ', 'Patil': 'ಪಾಟೀಲ್', 'Bhat': 'ಭಟ್', 'Hegde': 'ಹೆಗಡೆ',
    'Naik': 'ನಾಯ್ಕ್', 'Nayak': 'ನಾಯಕ್', 'Pujari': 'ಪೂಜಾರಿ', 'Poojary': 'ಪೂಜಾರಿ',
    'Reddy': 'ರೆಡ್ಡಿ', 'Shetty': 'ಶೆಟ್ಟಿ', 'Kulkarni': 'ಕುಲಕರ್ಣಿ', 'Pinto': 'ಪಿಂಟೋ',
    'Kotian': 'ಕೋಟ್ಯಾನ್', 'Kamath': 'ಕಾಮತ್', 'Acharya': 'ಆಚಾರ್ಯ', 'Salian': 'ಸಾಲ್ಯಾನ್',
    'Castelino': 'ಕ್ಯಾಸ್ಟೆಲಿನೊ', 'Moras': 'ಮೊರಾಸ್', 'Rao': 'ರಾವ್', 'Devadiga': 'ದೇವಾಡಿಗ',
    'Mendonca': 'ಮೆಂಡೋನ್ಸಾ', "D'Souza": 'ಡಿಸೋಜಾ', 'Dsouza': 'ಡಿಸೋಜಾ', 'Fernandes': 'ಫರ್ನಾಂಡಿಸ್',
    'Alva': 'ಆಳ್ವ', 'Bhandary': 'ಭಂಡಾರಿ', 'Suvarna': 'ಸುವರ್ಣ', 'Barke': 'ಬಾರ್ಕೆ',
    'Kunder': 'ಕುಂದರ್', 'Amin': 'ಅಮೀನ್', 'Banga': 'ಬಂಗಾ', 'Karkera': 'ಕರ್ಕೇರ',
    'Shinde': 'ಶಿಂಧೆ', 'Deshmukh': 'ದೇಶ್ಮುಖ್', 'Joshi': 'ಜೋಷಿ', 'Prabhu': 'ಪ್ರಭು'
};

export const getFarmerName = (name?: string, lang: Language = 'en'): string => {
    if (!name) return '';
    if (lang !== 'kn') return name;

    const trimmed = name.trim();
    if (farmerNameTranslations[trimmed]) {
        return farmerNameTranslations[trimmed];
    }

    // Split compound names (e.g. "Rahul Gowda", "Sathish Pinto")
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1) {
        return parts.map(part => farmerNameTranslations[part] || part).join(' ');
    }

    return farmerNameTranslations[trimmed] || trimmed;
};

export const seasonTranslations: Record<string, string> = {
    'all': 'ಎಲ್ಲಾ ಋತುಗಳು', 'All': 'ಎಲ್ಲಾ ಋತುಗಳು', 'All Seasons': 'ಎಲ್ಲಾ ಋತುಗಳು',
    'Kharif': 'ಖಾರೀಫ್', 'kharif': 'ಖಾರೀಫ್',
    'Rabi': 'ರಬಿ', 'rabi': 'ರಬಿ',
    'Summer': 'ಬೇಸಿಗೆ', 'summer': 'ಬೇಸಿಗೆ',
    'Perennial': 'ಬಹುವಾರ್ಷಿಕ', 'perennial': 'ಬಹುವಾರ್ಷಿಕ',
    'Annual': 'ವಾರ್ಷಿಕ', 'annual': 'ವಾರ್ಷಿಕ',
    'Year-round': 'ವರ್ಷವಿಡೀ', 'year-round': 'ವರ್ಷವಿಡೀ'
};

export const getSeasonName = (season: string, lang: Language): string => {
    if (!season) return '';
    if (lang !== 'kn') return season;
    return seasonTranslations[season] || season;
};

export const getCropName = (crop: string, lang: Language): string => {
    const item = cropTranslations[crop];
    if (!item) return toKannadaDigits(crop, lang);
    return lang === 'kn' ? item.kn : item.en;
};

export const getSoilName = (soil: string, lang: Language): string => {
    const item = soilTranslations[soil];
    if (!item) return toKannadaDigits(soil, lang);
    return lang === 'kn' ? item.kn : item.en;
};

export const getWeatherDesc = (desc: string, lang: Language): string => {
    const key = desc.toLowerCase();
    const item = weatherTranslations[key];
    if (!item) return toKannadaDigits(desc, lang);
    return lang === 'kn' ? item.kn : item.en;
};

export const t = (key: string, lang: Language): string => {
    const item = uiTranslations[key];
    if (!item) return key;
    const text = lang === 'kn' ? item.kn : item.en;
    return toKannadaDigits(text, lang);
};
