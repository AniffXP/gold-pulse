// =============================================================
// Helper functions — sinyal, format, dan kalkulasi
// =============================================================

// Format harga 2 desimal
export const fmtPrice = (v) => (v == null || isNaN(v)) ? '--' : Number(v).toFixed(2);

// Format indikator 4 desimal
export const fmtInd = (v) => (v == null || isNaN(v)) ? '--' : Number(v).toFixed(4);

// Format angka dengan koma ribuan
export const fmtComma = (v) => {
  if (v == null || isNaN(v)) return '--';
  const parts = Number(v).toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

// Rating keseluruhan → label + class
export const getRatingSignal = (v) => {
  if (v == null || isNaN(v)) return { text: '--', cls: 'neutral' };
  if (v >= 0.5) return { text: 'BELI KUAT', cls: 'buy' };
  if (v >= 0.1) return { text: 'BELI', cls: 'buy' };
  if (v <= -0.5) return { text: 'JUAL KUAT', cls: 'sell' };
  if (v <= -0.1) return { text: 'JUAL', cls: 'sell' };
  return { text: 'NETRAL', cls: 'neutral' };
};

// Sinyal oscillator individual
export const getOscSignal = (name, value, data) => {
  if (value == null || isNaN(value)) return { text: '--', cls: 'neutral' };
  switch (name) {
    case 'RSI (14)':
      return value < 30 ? { text: 'BELI', cls: 'buy' } : value > 70 ? { text: 'JUAL', cls: 'sell' } : { text: 'NETRAL', cls: 'neutral' };
    case 'Stochastic %K':
      return value < 20 ? { text: 'BELI', cls: 'buy' } : value > 80 ? { text: 'JUAL', cls: 'sell' } : { text: 'NETRAL', cls: 'neutral' };
    case 'CCI (20)':
      return value < -100 ? { text: 'BELI', cls: 'buy' } : value > 100 ? { text: 'JUAL', cls: 'sell' } : { text: 'NETRAL', cls: 'neutral' };
    case 'ADX (14)':
      if (value > 25 && data.adxPlusDI > data.adxMinusDI) return { text: 'BELI', cls: 'buy' };
      if (value > 25 && data.adxPlusDI < data.adxMinusDI) return { text: 'JUAL', cls: 'sell' };
      return { text: 'NETRAL', cls: 'neutral' };
    case 'Awesome Oscillator':
    case 'Momentum (10)':
    case 'Bull Bear Power':
      return value > 0 ? { text: 'BELI', cls: 'buy' } : value < 0 ? { text: 'JUAL', cls: 'sell' } : { text: 'NETRAL', cls: 'neutral' };
    case 'MACD (12, 26)':
      return value > (data.macdSignal ?? 0) ? { text: 'BELI', cls: 'buy' } : value < (data.macdSignal ?? 0) ? { text: 'JUAL', cls: 'sell' } : { text: 'NETRAL', cls: 'neutral' };
    case 'Stochastic RSI':
      return value < 20 ? { text: 'BELI', cls: 'buy' } : value > 80 ? { text: 'JUAL', cls: 'sell' } : { text: 'NETRAL', cls: 'neutral' };
    case 'Williams %R':
      return value < -80 ? { text: 'BELI', cls: 'buy' } : value > -20 ? { text: 'JUAL', cls: 'sell' } : { text: 'NETRAL', cls: 'neutral' };
    case 'Ultimate Oscillator':
      return value < 30 ? { text: 'BELI', cls: 'buy' } : value > 70 ? { text: 'JUAL', cls: 'sell' } : { text: 'NETRAL', cls: 'neutral' };
    default:
      return { text: 'NETRAL', cls: 'neutral' };
  }
};

// Sinyal MA individual
export const getMASignal = (maVal, close) => {
  if (maVal == null || isNaN(maVal)) return { text: '--', cls: 'neutral' };
  if (close > maVal) return { text: 'BELI', cls: 'buy' };
  if (close < maVal) return { text: 'JUAL', cls: 'sell' };
  return { text: 'NETRAL', cls: 'neutral' };
};

// Daftar oscillator dari data
export const buildOscList = (data) => {
  const items = [
    { name: 'RSI (14)', sub: 'Relative Strength Index', value: data.rsi },
    { name: 'Stochastic %K', sub: '(14, 3, 3) Fast', value: data.stochK },
    { name: 'CCI (20)', sub: 'Commodity Channel', value: data.cci },
    { name: 'ADX (14)', sub: 'Avg Directional Index', value: data.adx },
    { name: 'Awesome Oscillator', sub: 'AO Barometer', value: data.ao },
    { name: 'Momentum (10)', sub: 'MOM Rate of Change', value: data.mom },
    { name: 'MACD (12, 26)', sub: 'Level / Signal', value: data.macd },
    { name: 'Stochastic RSI', sub: 'Fast (3, 3, 14, 14)', value: data.stochRsiK },
    { name: 'Williams %R', sub: '(14) Extreme Range', value: data.williamsR },
    { name: 'Bull Bear Power', sub: 'Elder-Ray BBP', value: data.bbPower },
    { name: 'Ultimate Oscillator', sub: '(7, 14, 28) UO', value: data.uo },
  ];
  return items.map((o) => ({ ...o, signal: getOscSignal(o.name, o.value, data) }));
};

// Daftar moving average dari data
export const buildMAList = (data) => {
  const close = data.close;
  const items = [
    { name: 'EMA (10)', sub: 'Eksponensial 10 Periode', value: data.ema10 },
    { name: 'SMA (10)', sub: 'Sederhana 10 Periode', value: data.sma10 },
    { name: 'EMA (20)', sub: 'Eksponensial 20 Periode', value: data.ema20 },
    { name: 'SMA (20)', sub: 'Sederhana 20 Periode', value: data.sma20 },
    { name: 'EMA (30)', sub: 'Eksponensial 30 Periode', value: data.ema30 },
    { name: 'SMA (30)', sub: 'Sederhana 30 Periode', value: data.sma30 },
    { name: 'EMA (50)', sub: 'Eksponensial 50 Periode', value: data.ema50 },
    { name: 'SMA (50)', sub: 'Sederhana 50 Periode', value: data.sma50 },
    { name: 'EMA (100)', sub: 'Eksponensial Jangka Menengah', value: data.ema100 },
    { name: 'SMA (100)', sub: 'Sederhana Jangka Menengah', value: data.sma100 },
    { name: 'EMA (200)', sub: 'Garis Tren Utama Institusi', value: data.ema200 },
    { name: 'SMA (200)', sub: 'Sederhana Jangka Panjang', value: data.sma200 },
    { name: 'Ichimoku Base', sub: 'Kijun-Sen Baseline', value: data.ichimokuBLine },
    { name: 'VWMA (20)', sub: 'Volume Weighted MA', value: data.vwma },
    { name: 'Hull MA (9)', sub: 'Hull Moving Average', value: data.hullMA },
  ];
  return items.map((m) => ({ ...m, signal: getMASignal(m.value, close) }));
};

// Hitung jumlah sinyal
export const countSignals = (list) => {
  let buy = 0, sell = 0, neutral = 0;
  list.forEach((i) => {
    if (i.signal.cls === 'buy') buy++;
    else if (i.signal.cls === 'sell') sell++;
    else neutral++;
  });
  return { buy, sell, neutral };
};

// Needle angle dari rating value (-1 sampai +1) ke derajat (-90 sampai +90)
export const ratingToAngle = (v) => {
  if (v == null || isNaN(v)) return 0;
  return Math.max(-90, Math.min(90, v * 90));
};
