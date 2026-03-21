import React, { useState } from "react";
import "./styles/App.css";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import Forecast from "./components/Forecast";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = "f37f09560741490a84374858262103";

  const handleSearch = async () => {
    const cleanCity = city.trim();

    // 🔥 VALIDATION
    if (!cleanCity) {
      toast.error("Enter city name");
      return;
    }

    if (cleanCity.length < 2) {
      toast.error("Enter valid city");
      return;
    }

    setLoading(true);

    try {
      // 🔥 INDIA FIX (IMPORTANT)
      const query = `${cleanCity},India`;

      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=5`
      );

      const data = await res.json();

      // ❌ ERROR HANDLING
      if (data.error) {
        toast.error("City not found ❌");
        setWeather(null);
        setForecast([]);
        setLoading(false);
        return;
      }

      // ✅ WEATHER DATA
      setWeather({
        name: data.location.name,
        region: data.location.region,
        country: data.location.country,
        temp: data.current.temp_c,
        condition: data.current.condition.text,
        wind: data.current.wind_kph,
      });

      // ✅ FORECAST DATA
      const temps = data.forecast.forecastday.map(
        (day) => day.day.avgtemp_c
      );

      setForecast(temps);

      toast.success("Weather Loaded ✅");
    } catch (err) {
      toast.error("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="main-container">
      <Toaster position="top-right" />

      <div className="app-box">
        <h1>🌦 Weather App</h1>

        <SearchBar
          city={city}
          setCity={setCity}
          handleSearch={handleSearch}
        />

        {loading && <p className="loading">Loading...</p>}

        {!weather && !loading && (
          <p className="placeholder">Search a city...</p>
        )}

        {weather && <WeatherCard weather={weather} />}
        {forecast.length > 0 && <Forecast forecast={forecast} />}
      </div>
    </div>
  );
}

export default App;