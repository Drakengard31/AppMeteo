import { useState } from 'react'
import './App.css'

const API_KEY = '2ed86cc805289e5af55d3138efde11ba' // https://openweathermap.org/api

export default function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchWeather = async (e) => {
    e.preventDefault()
    if (!city.trim()) return
    setLoading(true); setError(''); setWeather(null); setForecast([])
    try {
      const wRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=fr`)
      if (!wRes.ok) throw new Error('Ville introuvable')
      const wData = await wRes.json()
      const fRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=fr&cnt=40`)
      const fData = await fRes.json()
      const daily = fData.list.filter(i => i.dt_txt.includes('12:00:00')).slice(0, 5)
      setWeather(wData); setForecast(daily)
    } catch (err) { setError('Ville introuvable. Vérifiez l\'orthographe.') }
    finally { setLoading(false) }
  }

  const icon = (code) => `https://openweathermap.org/img/wn/${code}@2x.png`

  return (
    <div className="app">
      <h1 className="app-title">🌤 Météo</h1>
      <form className="search-bar" onSubmit={fetchWeather}>
        <input className="search-input" type="text" placeholder="Rechercher une ville..." value={city} onChange={e => setCity(e.target.value)} />
        <button className="search-btn" type="submit" disabled={loading}>{loading ? 'Chargement...' : 'Rechercher'}</button>
      </form>
      {error && <div className="error">{error}</div>}
      {!weather && !error && !loading && <p className="hint">Entrez une ville pour voir la météo</p>}
      {weather && (
        <div className="weather-card">
          <div className="weather-top">
            <div>
              <h2>{weather.name}</h2>
              <p className="date">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <p className="desc">{weather.weather[0].description}</p>
            </div>
            <div className="temp-block">
              <img src={icon(weather.weather[0].icon)} alt="" />
              <span className="temp">{Math.round(weather.main.temp)}°C</span>
            </div>
          </div>
          <div className="stats">
            {[['Ressenti', Math.round(weather.main.feels_like) + '°C'], ['Humidité', weather.main.humidity + '%'], ['Vent', Math.round(weather.wind.speed * 3.6) + ' km/h'], ['Pression', weather.main.pressure + ' hPa']].map(([label, val]) => (
              <div key={label} className="stat"><span className="stat-label">{label}</span><span className="stat-value">{val}</span></div>
            ))}
          </div>
        </div>
      )}
      {forecast.length > 0 && (
        <div className="forecast-card">
          <h3 className="forecast-title">Prévisions 5 jours</h3>
          <div className="forecast-grid">
            {forecast.map((item, i) => (
              <div key={i} className="forecast-item">
                <span className="f-day">{new Date(item.dt_txt).toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                <img src={icon(item.weather[0].icon)} alt="" width="40" />
                <span className="f-temp">{Math.round(item.main.temp)}°</span>
                <span className="f-min">{Math.round(item.main.temp_min)}°</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
