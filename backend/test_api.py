import requests

URL = "http://127.0.0.1:5000/api/predict"
good = {
    "year": 2017, "km_driven": 40000, "fuel": "Diesel",
    "seller_type": "Individual", "transmission": "Manual",
    "owner": "First Owner", "mileage": 23.59, "engine": 1364,
    "max_power": 67.05, "seats": 5, "brand": "Toyota",
}

tests = {
    "good": good,
    "missing field": {k: v for k, v in good.items() if k != "engine"},
    "text in year": {**good, "year": "abc"},
    "bad fuel + year 1800": {**good, "fuel": "Water", "year": 1800},
}

for name, payload in tests.items():
    r = requests.post(URL, json=payload)
    print(name, "->", r.status_code, r.json())
    