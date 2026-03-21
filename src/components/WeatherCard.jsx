import React from "react";

function WeatherCard({ weather }) {
  if (!weather) return null;

  return (
    <div className="card fade-in">
      <h2>
        {weather.name}, {weather.region}
      </h2>
      <p>{weather.country}</p>

      <p>🌡 {weather.temp}°C</p>
      <p>🌥 {weather.condition}</p>
      <p>💨 {weather.wind} km/h</p>
    </div>
  );
}

export default WeatherCard;
