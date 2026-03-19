import React, { useState, useEffect } from 'react';
import './App.css';
import { 
    indiaStates, 
    karnatakaDistricts, 
    getTaluksForDistrict, 
    getHoblisForTaluk 
} from './data/locations';

interface CropPrice {
    crop: string;
    price: string;
    trend: 'up' | 'down' | 'stable';
}

function App() {
    const [isRegistered, setIsRegistered] = useState(false);
    
    // Form States
    const [name, setName] = useState('');
    const [surveyNumber, setSurveyNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [stateLoc, setStateLoc] = useState('');
    const [district, setDistrict] = useState('');
    const [taluk, setTaluk] = useState('');
    const [hobli, setHobli] = useState('');
    
    // Derived location lists
    const [taluksList, setTaluksList] = useState<string[]>([]);
    const [hoblisList, setHoblisList] = useState<string[]>([]);

    const [loadingRegister, setLoadingRegister] = useState(false);
    
    // Dashboard States
    const [registeredUser, setRegisteredUser] = useState<{name: string, taluk: string} | null>(null);
    const [recommendations, setRecommendations] = useState<any>(null);
    const [marketPrices, setMarketPrices] = useState<CropPrice[]>([]);
    const [activeTab, setActiveTab] = useState<'recommendation' | 'prices'>('recommendation');

    // Cascading logic
    useEffect(() => {
        if (stateLoc !== 'Karnataka') {
            setDistrict('');
        }
    }, [stateLoc]);

    useEffect(() => {
        if (district) {
            setTaluksList(getTaluksForDistrict(district));
            setTaluk(''); // reset taluk when district changes
        } else {
            setTaluksList([]);
        }
    }, [district]);

    useEffect(() => {
        if (taluk) {
            setHoblisList(getHoblisForTaluk(taluk));
            setHobli(''); // reset hobli when taluk changes
        } else {
            setHoblisList([]);
        }
    }, [taluk]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingRegister(true);
        try {
            const payload = {
                name,
                survey_number: surveyNumber,
                phone_number: phoneNumber,
                state: stateLoc,
                district: district || 'N/A',
                taluk: taluk || 'N/A',
                hobli: hobli || 'N/A'
            };
            
            const response = await fetch(`http://localhost:8000/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                setIsRegistered(true);
                setRegisteredUser({ name, taluk: taluk || 'N/A' });
                fetchDashboardData(taluk || 'Unknown');
            } else {
                alert("Registration failed. Please strictly check your inputs.");
            }
        } catch (error) {
            console.error("Registration failed", error);
            alert("Could not connect to the server.");
        } finally {
            setLoadingRegister(false);
        }
    };

    const fetchDashboardData = async (userTaluk: string) => {
        try {
            const recRes = await fetch(`http://localhost:8000/recommendations/${userTaluk}`);
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
                <div className="card form-card">
                    <h1>Farmer Registration</h1>
                    <p className="subtitle">Sign up to access tailored recommendations & market prices</p>

                    <form onSubmit={handleRegister} className="registration-form">
                        
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Survey Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 123/A"
                                    value={surveyNumber}
                                    onChange={(e) => setSurveyNumber(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="form-group half">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="10-digit number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                    pattern="[0-9]{10}"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>State</label>
                                <select 
                                    value={stateLoc} 
                                    onChange={(e) => setStateLoc(e.target.value)} 
                                    required
                                >
                                    <option value="" disabled>Select State</option>
                                    {indiaStates.map(st => (
                                        <option key={st} value={st}>{st}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group half">
                                <label>District</label>
                                <select 
                                    value={district} 
                                    onChange={(e) => setDistrict(e.target.value)} 
                                    required={stateLoc === 'Karnataka'}
                                    disabled={stateLoc !== 'Karnataka'}
                                >
                                    <option value="" disabled>Select District</option>
                                    {stateLoc === 'Karnataka' && karnatakaDistricts.map(dst => (
                                        <option key={dst} value={dst}>{dst}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Taluk</label>
                                <select 
                                    value={taluk} 
                                    onChange={(e) => setTaluk(e.target.value)} 
                                    required={!!district}
                                    disabled={!district}
                                >
                                    <option value="" disabled>Select Taluk</option>
                                    {taluksList.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group half">
                                <label>Hobli</label>
                                <select 
                                    value={hobli} 
                                    onChange={(e) => setHobli(e.target.value)} 
                                    required={!!taluk}
                                    disabled={!taluk}
                                >
                                    <option value="" disabled>Select Hobli</option>
                                    {hoblisList.map(h => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="register-btn" disabled={loadingRegister}>
                            {loadingRegister ? "Registering..." : "Register"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="user-info">
                    <h2>Welcome, {registeredUser?.name || 'Farmer'}</h2>
                    <p>{registeredUser?.taluk}</p>
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
