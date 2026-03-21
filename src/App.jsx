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
    setRecent(JSON.parse(localStorage.getItem("recent")) || []);
  }, []);

  // 🔍 STATIC SUGGESTIONS
  const cities = [
    "Pune","Mumbai","Delhi","Nashik","Nagpur",
    "London","Paris","Tokyo","New York"
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

  // 🔥 SEARCH
  const handleSearch = async (searchCity = city) => {
    if (!searchCity) return;

    setLoading(true);
    setSuggestions([]);

    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${searchCity},India&days=5`
      );
      const data = await res.json();

      if (data.error) {
        toast.error("City not found");
        setLoading(false);
        return;
      }

      setWeather(data);
      setForecast(
        data.forecast.forecastday.map(d => d.day.avgtemp_c)
      );

      // recent
      const updated = [searchCity, ...recent.filter(c => c !== searchCity)].slice(0,5);
      setRecent(updated);
      localStorage.setItem("recent", JSON.stringify(updated));

      toast.success("Weather Loaded ✅");
    } catch {
      toast.error("Error");
    }

    setLoading(false);
  };

  // 🧠 SMART MESSAGE
  const getMessage = () => {
    if (!weather) return "";
    const temp = weather.current.temp_c;
    const cond = weather.current.condition.text.toLowerCase();

    if (temp > 35) return "🔥 Stay hydrated!";
    if (temp < 15) return "🧥 It's cold outside";
    if (cond.includes("rain")) return "☔ Carry umbrella";
    return "🌤 Have a great day!";
  };

  // 📊 GRAPH
  const chartData = {
    labels: ["Day1","Day2","Day3","Day4","Day5"],
    datasets: [{
      label: "Temp °C",
      data: forecast
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
            placeholder="Search city..."
          />
          <button onClick={() => handleSearch()}>Search</button>

          {/* SUGGESTIONS */}
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
        <button className="refresh-btn" onClick={() => handleSearch()}>
          🔄 Refresh
        </button>

        {/* LOADING */}
        {loading && <div className="skeleton"></div>}

        {/* WEATHER */}
        {weather && !loading && (
          <div className="card">
            <h2>{weather.location.name}</h2>
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