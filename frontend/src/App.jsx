import { useState, useEffect } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const DROPDOWNS = [
  { name: "brand", label: "Brand" },
  { name: "fuel", label: "Fuel type" },
  { name: "seller_type", label: "Seller type" },
  { name: "transmission", label: "Transmission" },
  { name: "owner", label: "Owner" },
];

const NUMBERS = [
  { name: "year", label: "Year" },
  { name: "km_driven", label: "Kilometers driven" },
  { name: "mileage", label: "Mileage (kmpl)" },
  { name: "engine", label: "Engine (CC)" },
  { name: "max_power", label: "Max power (bhp)" },
  { name: "seats", label: "Seats" },
];

function App() {
  const [options, setOptions] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/options`)
      .then((response) => response.json())
      .then((data) => {
        setOptions(data);
        // start each dropdown on its first option, each number empty
        const initial = {};
        DROPDOWNS.forEach((d) => (initial[d.name] = data.options[d.name][0]));
        NUMBERS.forEach((n) => (initial[n.name] = ""));
        setForm(initial);
      })
      .catch(() => setLoadError("Could not load options from the server."));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setErrors([]);

    const payload = { ...form };
    NUMBERS.forEach((n) => {
      payload[n.name] = form[n.name] === "" ? "" : Number(form[n.name]);
    });

    try {
      const response = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        setResult(data.predicted_price);
      } else {
        setErrors(data.errors || ["Something went wrong."]);
      }
    } catch {
      setErrors(["Could not reach the server. Is Flask running?"]);
    } finally {
      setLoading(false);
    }
  }

  if (loadError) return <p className="status-message">{loadError}</p>;
  if (!options) return <p className="status-message">Loading...</p>;

  return (
    <div className="container">
      <h1 className="title">Used Car Price Predictor</h1>
      <p className="subtitle">Enter the car details to get an estimated resale price.</p>

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {DROPDOWNS.map((d) => (
              <div className="field" key={d.name}>
                <label>{d.label}</label>
                <select name={d.name} value={form[d.name]} onChange={handleChange}>
                  {options.options[d.name].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            ))}

            {NUMBERS.map((n) => {
              const [low, high] = options.ranges[n.name];
              return (
                <div className="field" key={n.name}>
                  <label>{n.label} ({low} to {high})</label>
                  <input
                    type="number"
                    step="any"
                    name={n.name}
                    value={form[n.name]}
                    onChange={handleChange}
                  />
                </div>
              );
            })}
          </div>

          <button className="predict-btn" type="submit" disabled={loading}>
            {loading ? "Predicting..." : "Predict price"}
          </button>
        </form>

        {errors.length > 0 && (
          <div className="error-box">
            <ul>
              {errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </div>
        )}

        {result !== null && (
          <div className="result-box">
            <p className="result-label">Estimated resale price</p>
            <h2 className="result-price">₹{result.toLocaleString("en-IN")}</h2>
            <p className="result-note">
              An estimate based on past listings (typical error about ₹75,000).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;