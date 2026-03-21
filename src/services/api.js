import axios from "axios";

export const getWeatherByCity = async (city) => {
  const geoRes = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
  );

  if (!geoRes.data.results) throw new Error("City not found");

  const { latitude, longitude, name } = geoRes.data.results[0];

  const weatherRes = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );

  const forecastRes = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max&timezone=auto`
  );

  return {
    name,
    temp: weatherRes.data.current_weather.temperature,
    wind: weatherRes.data.current_weather.windspeed,
    code: weatherRes.data.current_weather.weathercode,
    forecast: forecastRes.data.daily.temperature_2m_max,
  };
};

export const getWeatherByLocation = async (lat, lon) => {
  const weatherRes = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  );

  return {
    name: "Your Location",
    temp: weatherRes.data.current_weather.temperature,
    wind: weatherRes.data.current_weather.windspeed,
    code: weatherRes.data.current_weather.weathercode,
  };
};