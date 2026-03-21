import React from "react";

function Forecast({ forecast }) {
  return (
    <div className="forecast-wrapper fade-in">
      {forecast.map((temp, i) => (
        <div key={i} className="forecast-card">
          <h4>Day {i + 1}</h4>
          <p>{temp}°C</p>
        </div>
      ))}
    </div>
  );
}

export default Forecast;