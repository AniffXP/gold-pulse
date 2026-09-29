# 🥇 Gold Pulse — XAUUSD Technical Intelligence Terminal

Dashboard analisis teknikal XAUUSD real-time yang mengambil data langsung dari TradingView Scanner API.

![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=fff)

## ✨ Fitur

- 💰 **Harga Real-time** — Open, High, Low, Close, Change
- 📊 **Rating Teknikal** — SVG gauge dengan needle presisi
- ⚡ **11 Oscillator** — RSI, Stochastic, CCI, MACD, dll
- 📈 **15 Moving Average** — EMA/SMA 10-200, Ichimoku, VWMA, Hull MA
- 🎯 **Pivot Points** — Classic, Fibonacci, Camarilla, Woodie, Demark
- ⏱️ **8 Timeframe** — 1 Menit sampai Bulanan
- 🔄 **Auto-refresh** — Data update otomatis setiap 5 detik

## 🚀 Cara Menjalankan

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Buka `http://localhost:5173` di browser.

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| **Vite** | Build tool + dev server + API proxy |
| **React** | UI component framework |
| **Tailwind CSS v4** | Utility-first styling |
| **TradingView Scanner API** | Sumber data teknikal |

## 📁 Struktur

```
src/
├── App.jsx       # Semua komponen UI
├── api.js        # Fetch data dari TradingView
├── hooks.js      # Custom hooks (auto-refresh, clock)
├── helpers.js    # Sinyal, formatting, kalkulasi
└── index.css     # Tailwind + custom theme
```

## 📄 Lisensi

MIT
