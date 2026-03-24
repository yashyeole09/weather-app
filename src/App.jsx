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

  // CLOCK
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
  const cities = ["Pune","Mumbai","Delhi","Nashik","Nagpur"];

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

  // SMART MESSAGE
  const getSmartMessage = () => {
    if (!weather) return "";

    const temp = weather.current.temp_c;
    const humidity = weather.current.humidity;
    const condition = weather.current.condition.text.toLowerCase();

    if (condition.includes("rain")) return "☔ Carry an umbrella!";
    if (temp > 35) return "🔥 Too hot! Stay hydrated.";
    if (temp < 15) return "🧥 Cold weather! Wear warm clothes.";
    if (humidity > 80) return "💧 High humidity today.";
    return "🌤 Weather looks good!";
  };

  // SEARCH
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

  // DELETE RECENT
  const removeRecent = (cityName) => {
    const updated = recent.filter(c => c !== cityName);
    setRecent(updated);
    localStorage.setItem("recent", JSON.stringify(updated));
  };

  // REFRESH
  const handleRefresh = () => window.location.reload();

  const chartData = {
    labels: ["Day1","Day2","Day3","Day4","Day5"],
    datasets: [{
      label: "Temp °C",
      data: forecast,
      borderColor: "#38bdf8",
      tension: 0.4
    }]
  };

  return (
    <div className="app-container">
      <Toaster />

      {/* NAVBAR */}
      <div className="navbar">
        <h1>🌦 Weather Pro</h1>

        <div className="nav-right">
          <span className="clock">{time}</span>
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄
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

      {/* MAIN */}
      <div className="content">

        {/* WEATHER CARD */}
        <div className="card weather">
          {loading && <div className="loader"></div>}

          {weather && !loading && (
            <>
              <h2>{weather.location.name}</h2>
              <h1>{weather.current.temp_c}°C</h1>
              <p>{weather.current.condition.text}</p>

              {/* EXTRA DATA */}
              <div className="extra">
                <span>💧 {weather.current.humidity}%</span>
                <span>🌬 {weather.current.wind_kph} km/h</span>
                <span>🌡 Feels {weather.current.feelslike_c}°C</span>
                <span>📊 {weather.current.pressure_mb} mb</span>
              </div>

              {/* SMART MESSAGE */}
              <p className="message">{getSmartMessage()}</p>
            </>
          )}
        </div>

        {/* GRAPH */}
        <div className="card graph">
          {forecast.length > 0 && <Line data={chartData} />}
        </div>

      </div>

      {/* RECENT */}
      <div className="recent">
        {recent.map((r, i) => (
          <div key={i} className="recent-item">
            <span onClick={() => handleSearch(r)}>{r}</span>
            <button onClick={() => removeRecent(r)}>❌</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;