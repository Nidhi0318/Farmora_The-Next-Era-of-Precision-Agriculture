import React, { useState, useEffect } from 'react';
import './App.css';

interface SurveyData {
    state: string;
    district: string;
    taluk: string;
    village: string;
    hobli: string;
}

interface CropPrice {
    crop: string;
    price: string;
    trend: 'up' | 'down' | 'stable';
}

function App() {
    const [isRegistered, setIsRegistered] = useState(false);
    const [surveyNumber, setSurveyNumber] = useState('');

    const [surveyDetails, setSurveyDetails] = useState<SurveyData | null>(null);
    const [loadingLookup, setLoadingLookup] = useState(false);
    const [recommendations, setRecommendations] = useState<any>(null);
    const [marketPrices, setMarketPrices] = useState<CropPrice[]>([]);
    const [activeTab, setActiveTab] = useState<'recommendation' | 'prices'>('recommendation');

    // Lookup survey details when survey number matches pattern (mock)
    useEffect(() => {
        if (surveyNumber.length >= 3) {
            const fetchDetails = async () => {
                setLoadingLookup(true);
                try {
                    const response = await fetch(`http://localhost:8000/lookup/${surveyNumber}`);
                    if (response.ok) {
                        const data = await response.json();
                        setSurveyDetails(data);
                    } else {
                        setSurveyDetails(null);
                    }
                } catch (error) {
                    console.error("Lookup failed", error);
                } finally {
                    setLoadingLookup(false);
                }
            };

            const timeoutId = setTimeout(fetchDetails, 500);
            return () => clearTimeout(timeoutId);
        } else {
            setSurveyDetails(null);
        }
    }, [surveyNumber]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (surveyDetails) {
            // Simulate registration and fetch dashboard data
            setIsRegistered(true);
            fetchDashboardData(surveyDetails.taluk);
        }
    };

    const fetchDashboardData = async (taluk: string) => {
        try {
            const recRes = await fetch(`http://localhost:8000/recommendations/${taluk}`);
            const priceRes = await fetch('http://localhost:8000/market-prices');

            if (recRes.ok) setRecommendations(await recRes.json());
            if (priceRes.ok) setMarketPrices(await priceRes.json());
        } catch (e) {
            console.error("Failed to fetch dashboard data", e);
        }
    };

    if (!isRegistered) {
        return (
            <div className="container">
                <div className="card">
                    <h1>Farmer Portal</h1>
                    <p className="subtitle">Register to access recommendations & market prices</p>

                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label>Survey Number</label>
                            <input
                                type="text"
                                placeholder="e.g. 123/A"
                                value={surveyNumber}
                                onChange={(e) => setSurveyNumber(e.target.value)}
                                required
                            />
                            {loadingLookup && <div className="loading">Checking records...</div>}
                        </div>

                        {surveyDetails && (
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">State</span>
                                    <span className="detail-value">{surveyDetails.state}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">District</span>
                                    <span className="detail-value">{surveyDetails.district}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Taluk</span>
                                    <span className="detail-value">{surveyDetails.taluk}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Village</span>
                                    <span className="detail-value">{surveyDetails.village}</span>
                                </div>
                            </div>
                        )}



                        <button type="submit" disabled={!surveyDetails}>Register & Proceed</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="user-info">
                    <h2>Welcome, Farmer</h2>
                    <p>{surveyDetails?.village}, {surveyDetails?.taluk}</p>
                </div>
                <button className="logout-btn" onClick={() => setIsRegistered(false)}>Logout</button>
            </header>

            <div className="tabs">
                <button
                    className={activeTab === 'recommendation' ? 'active' : ''}
                    onClick={() => setActiveTab('recommendation')}
                >
                    🌾 Crop Recommendation
                </button>
                <button
                    className={activeTab === 'prices' ? 'active' : ''}
                    onClick={() => setActiveTab('prices')}
                >
                    💰 Market Prices
                </button>
            </div>

            <main className="dashboard-content">
                {activeTab === 'recommendation' && (
                    <div className="section-card">
                        <h3>Recommendations for your region</h3>
                        <div className="soil-info">
                            <div className="info-chip">pH: {recommendations?.soil_data?.ph}</div>
                            <div className="info-chip">Temp: {recommendations?.soil_data?.temp}°C</div>
                            <div className="info-chip">Rainfall: {recommendations?.soil_data?.rainfall}mm</div>
                        </div>
                        <div className="crop-grid">
                            {recommendations?.recommended_crops.map((item: any) => {
                                const cropName = typeof item === 'string' ? item : item.crop;
                                const cropPrice = typeof item === 'string' ? 'Check Market' : item.price;
                                const trend = typeof item === 'string' ? 'stable' : item.trend;

                                return (
                                    <div key={cropName} className="crop-card">
                                        <span className="crop-icon">🌿</span>
                                        <h4>{cropName}</h4>
                                        <p className="crop-price">{cropPrice}</p>
                                        <span className={`trend ${trend}`}>
                                            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'prices' && (
                    <div className="section-card">
                        <h3>Current Market Rates</h3>
                        <div className="price-list">
                            {marketPrices.map((item: any) => (
                                <div key={item.crop} className="price-item">
                                    <span className="crop-name">{item.crop}</span>
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
                )}
            </main>
        </div>
    );
}

export default App;
