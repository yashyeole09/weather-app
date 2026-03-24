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
  const [recent, setRecent] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState("");

  const API_KEY = "f37f09560741490a84374858262103";

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formatted = now.toLocaleString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      setTime(formatted);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recent")) || [];
    setRecent(stored.slice(0, 5));
  }, []);

  const cities = ["Pune","Mumbai","Delhi","Nashik","Nagpur","Thane","Aurangabad","Solapur","Amravati","Kolhapur","Ahmednagar","Latur","Satara","Jalgaon","Dhule","Beed","Nanded","Akola","Buldhana","Parbhani","Hingoli","Chennai","Bengaluru","Hyderabad","Kolkata","Ahmedabad","Surat","Pune","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal","Visakhapatnam","Pimpri-Chinchwad","Patna","Vadodara","Ghaziabad","Ludhiana","Agra","Varanasi","Nashik","Meerut","Faridabad","Rajkot","Kalyan-Dombivli","Vasai-Virar","Srinagar","Aurangabad","Dhanbad","Amritsar","Navi Mumbai","Allahabad","Ranchi","Howrah","Coimbatore","Jabalpur","Gwalior","Vijayawada","Jodhpur","Madurai","Raipur","Kota","Guwahati"];

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

  const handleSearch = async (searchCity = city) => {
    if (!searchCity.trim()) return;

    setLoading(true);
    setSuggestions([]);

    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${searchCity}&days=5`
      );
      const data = await res.json();

      if (data.error) {
        toast.error("City not found ❌");
        setLoading(false);
        return;
      }

      setWeather(data);
      setForecast(
        data.forecast.forecastday.map(d => d.day.avgtemp_c)
      );

      const updated = [data.location.name, ...recent.filter(c => c !== data.location.name)].slice(0,5);
      setRecent(updated);
      localStorage.setItem("recent", JSON.stringify(updated));

      toast.success(`Showing ${data.location.name}`);
    } catch {
      toast.error("API Error");
    }

    setLoading(false);
  };

  const removeRecent = (cityName) => {
    const updated = recent.filter(c => c !== cityName);
    setRecent(updated);
    localStorage.setItem("recent", JSON.stringify(updated));
  };

  const handleRefresh = () => window.location.reload();

  const chartData = {
    labels: ["Day1","Day2","Day3","Day4","Day5"],
    datasets: [{
      label: "Temp °C",
      data: forecast,
      borderColor: "#38bdf8",
      backgroundColor: "rgba(56,189,248,0.2)",
      tension: 0.4
    }]
  };

  return (
    <div className="app-container">
      <Toaster />

      {/* NAVBAR */}
      <div className="navbar">
        <h1 className="logo">WeatherScope</h1>

        <div className="nav-right">
          <span className="clock">{time}</span>
          <button className="refresh-btn" onClick={handleRefresh}>
            ⟳
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="search-box">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search city..."
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

      {/* EMPTY STATE */}
      {!weather && !loading && (
        <div className="empty">
          <h2>🌍 Search for a city</h2>
          <p>Get real-time weather insights instantly</p>
        </div>
      )}

   
      {weather && (
        <div className="content">

          {/* WEATHER */}
          <div className="card weather">
            {loading && <div className="loader"></div>}

            {!loading && (
              <>
                <h2>{weather.location.name}</h2>
                <img src={weather.current.condition.icon} alt="icon" />
                <h1>{weather.current.temp_c}°C</h1>
                <p>{weather.current.condition.text}</p>

                {/* EXTRA DATA */}
                <div className="extra">
                  <div>💧<span>{weather.current.humidity}%</span></div>
                  <div>🌬<span>{weather.current.wind_kph} km/h</span></div>
                  <div>🌡<span>{weather.current.feelslike_c}°C</span></div>
                  <div>📊<span>{weather.current.pressure_mb}</span></div>
                </div>
              </>
            )}
          </div>

          <div className="card graph">
            <Line data={chartData} />
          </div>

        </div>
      )}

      <div className="recent">
        {recent.map((r, i) => (
          <div key={i} className="recent-item">
            <span onClick={() => handleSearch(r)}>{r}</span>
            <button onClick={() => removeRecent(r)}>✕</button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;