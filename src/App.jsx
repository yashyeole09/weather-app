import React, { useState, useEffect } from "react";
import "./styles/App.css";
import toast, { Toaster } from "react-hot-toast";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState("");

  const API_KEY = "f37f09560741490a84374858262103";

  // ⏰ CLOCK
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // LOAD RECENT
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recent")) || [];
    setRecent(stored.slice(0, 5));
  }, []);

  // SUGGESTIONS
  const cities = [
    "Pune","Mumbai","Delhi","Nashik","Nagpur",
    "Aurangabad","Solapur"
  ];

  useEffect(() => {
    if (city.length > 1) {
      setSuggestions(
        cities.filter(c =>
          c.toLowerCase().includes(city.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  }, [city]);

  // 🔥 FINAL SEARCH (INDIA SAFE + FLEXIBLE)
  const handleSearch = async (searchCity = city) => {
    if (!searchCity.trim()) return;

    setLoading(true);
    setSuggestions([]);

    try {
      // 🔍 STEP 1: SEARCH LOCATIONS
      const searchRes = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${searchCity.trim()}`
      );

      const searchData = await searchRes.json();

      if (!searchData || searchData.length === 0) {
        toast.error("City not found ❌");
        setLoading(false);
        return;
      }

      // 🇮🇳 STEP 2: SMART INDIA FILTER (FIXED)
      const indiaMatch = searchData.find(loc => {
        const country = loc.country?.toLowerCase() || "";
        const region = loc.region?.toLowerCase() || "";

        return (
          country.includes("india") ||
          country === "in" ||
          region.includes("india")
        );
      });

     

      // 📍 STEP 3: GET WEATHER USING LAT/LON
      const weatherRes = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${indiaMatch.lat},${indiaMatch.lon}&days=5&aqi=no&lang=en`
      );

      const data = await weatherRes.json();

      if (!weatherRes.ok || data.error) {
        toast.error("Weather fetch failed ❌");
        setLoading(false);
        return;
      }

      // ✅ SUCCESS
      setWeather(data);
      setForecast(
        data.forecast.forecastday.map(d => d.day.avgtemp_c)
      );

      const updated = [data.location.name, ...recent.filter(c => c !== data.location.name)].slice(0,5);
      setRecent(updated);
      localStorage.setItem("recent", JSON.stringify(updated));

      toast.success(`Showing ${data.location.name}, India `);

    } catch {
      toast.error("API Error ⚠️");
    }

    setLoading(false);
  };

  // REFRESH
  const handleRefresh = () => {
    window.location.reload();
  };

  // SMART MESSAGE
  const getMessage = () => {
    if (!weather) return "";
    const temp = weather.current.temp_c;

    if (temp > 35) return "🔥 Stay hydrated!";
    if (temp < 15) return "🧥 It's cold outside";
    return "🌤 Have a great day!";
  };

  // GRAPH
  const chartData = {
    labels: ["Day1","Day2","Day3","Day4","Day5"],
    datasets: [{
      label: "Temperature °C",
      data: forecast,
      borderColor: "#38bdf8",
      backgroundColor: "#38bdf8",
      tension: 0.4
    }]
  };

  return (
    <div className="main-container">
      <Toaster />

      <div className="app-box">
        <h1>🌦 Weather App</h1>
        <p className="clock">{time}</p>

        {/* SEARCH */}
        <div className="search-wrapper">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search Indian city..."
          />
          <button onClick={() => handleSearch()}>Search</button>

          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((s, i) => (
                <div key={i} onClick={() => handleSearch(s)}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT */}
        <div className="recent">
          {recent.map((r, i) => (
            <span key={i} onClick={() => handleSearch(r)}>
              {r}
            </span>
          ))}
        </div>

        {/* REFRESH */}
        <button className="refresh-btn" onClick={handleRefresh}>
          🔄 Refresh Page
        </button>

        {/* LOADING */}
        {loading && <div className="skeleton"></div>}

        {/* WEATHER */}
        {weather && !loading && (
          <div className="card">
            <h2>{weather.location.name}, India</h2>
            <h1>{weather.current.temp_c}°C</h1>
            <p>{weather.current.condition.text}</p>
            <p className="message">{getMessage()}</p>
          </div>
        )}

        {/* GRAPH */}
        {forecast.length > 0 && !loading && (
          <div className="chart">
            <Line data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;