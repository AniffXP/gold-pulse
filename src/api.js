// =============================================================
// API layer — Fetch data teknikal XAUUSD dari TradingView Scanner
// =============================================================

// Field teknikal yang diminta dari API
const TECHNICAL_FIELDS = {
  rating: (tf) => `Recommend.All${tf}`,
  ratingMA: (tf) => `Recommend.MA${tf}`,
  ratingOsc: (tf) => `Recommend.Other${tf}`,

  rsi: (tf) => `RSI${tf}`,
  stochK: (tf) => `Stoch.K${tf}`,
  stochD: (tf) => `Stoch.D${tf}`,
  cci: (tf) => `CCI20${tf}`,
  adx: (tf) => `ADX${tf}`,
  adxPlusDI: (tf) => `ADX+DI${tf}`,
  adxMinusDI: (tf) => `ADX-DI${tf}`,
  ao: (tf) => `AO${tf}`,
  mom: (tf) => `Mom${tf}`,
  macd: (tf) => `MACD.macd${tf}`,
  macdSignal: (tf) => `MACD.signal${tf}`,
  stochRsiK: (tf) => `Stoch.RSI.K${tf}`,
  williamsR: (tf) => `W.R${tf}`,
  bbPower: (tf) => `BBPower${tf}`,
  uo: (tf) => `UO${tf}`,

  ema10: (tf) => `EMA10${tf}`,
  sma10: (tf) => `SMA10${tf}`,
  ema20: (tf) => `EMA20${tf}`,
  sma20: (tf) => `SMA20${tf}`,
  ema30: (tf) => `EMA30${tf}`,
  sma30: (tf) => `SMA30${tf}`,
  ema50: (tf) => `EMA50${tf}`,
  sma50: (tf) => `SMA50${tf}`,
  ema100: (tf) => `EMA100${tf}`,
  sma100: (tf) => `SMA100${tf}`,
  ema200: (tf) => `EMA200${tf}`,
  sma200: (tf) => `SMA200${tf}`,
  ichimokuBLine: (tf) => `Ichimoku.BLine${tf}`,
  vwma: (tf) => `VWMA${tf}`,
  hullMA: (tf) => `HullMA9${tf}`,

  pivotClassicS3: (tf) => `Pivot.M.Classic.S3${tf}`,
  pivotClassicS2: (tf) => `Pivot.M.Classic.S2${tf}`,
  pivotClassicS1: (tf) => `Pivot.M.Classic.S1${tf}`,
  pivotClassicP: (tf) => `Pivot.M.Classic.Middle${tf}`,
  pivotClassicR1: (tf) => `Pivot.M.Classic.R1${tf}`,
  pivotClassicR2: (tf) => `Pivot.M.Classic.R2${tf}`,
  pivotClassicR3: (tf) => `Pivot.M.Classic.R3${tf}`,

  pivotFibS3: (tf) => `Pivot.M.Fibonacci.S3${tf}`,
  pivotFibS2: (tf) => `Pivot.M.Fibonacci.S2${tf}`,
  pivotFibS1: (tf) => `Pivot.M.Fibonacci.S1${tf}`,
  pivotFibP: (tf) => `Pivot.M.Fibonacci.Middle${tf}`,
  pivotFibR1: (tf) => `Pivot.M.Fibonacci.R1${tf}`,
  pivotFibR2: (tf) => `Pivot.M.Fibonacci.R2${tf}`,
  pivotFibR3: (tf) => `Pivot.M.Fibonacci.R3${tf}`,

  pivotCamarillaS3: (tf) => `Pivot.M.Camarilla.S3${tf}`,
  pivotCamarillaS2: (tf) => `Pivot.M.Camarilla.S2${tf}`,
  pivotCamarillaS1: (tf) => `Pivot.M.Camarilla.S1${tf}`,
  pivotCamarillaP: (tf) => `Pivot.M.Camarilla.Middle${tf}`,
  pivotCamarillaR1: (tf) => `Pivot.M.Camarilla.R1${tf}`,
  pivotCamarillaR2: (tf) => `Pivot.M.Camarilla.R2${tf}`,
  pivotCamarillaR3: (tf) => `Pivot.M.Camarilla.R3${tf}`,

  pivotWoodieS3: (tf) => `Pivot.M.Woodie.S3${tf}`,
  pivotWoodieS2: (tf) => `Pivot.M.Woodie.S2${tf}`,
  pivotWoodieS1: (tf) => `Pivot.M.Woodie.S1${tf}`,
  pivotWoodieP: (tf) => `Pivot.M.Woodie.Middle${tf}`,
  pivotWoodieR1: (tf) => `Pivot.M.Woodie.R1${tf}`,
  pivotWoodieR2: (tf) => `Pivot.M.Woodie.R2${tf}`,
  pivotWoodieR3: (tf) => `Pivot.M.Woodie.R3${tf}`,

  pivotDMS1: (tf) => `Pivot.M.Demark.S1${tf}`,
  pivotDMP: (tf) => `Pivot.M.Demark.Middle${tf}`,
  pivotDMR1: (tf) => `Pivot.M.Demark.R1${tf}`,

  close: () => 'close',
  open: () => 'open',
  high: () => 'high',
  low: () => 'low',
  prevClose: () => 'close|1D',
  change: () => 'change',
  changePercent: () => 'change_abs',
  volume: () => 'volume',
};

const PRICE_FIELDS = ['close', 'open', 'high', 'low', 'prevClose', 'change', 'changePercent', 'volume'];

// Mapping timeframe UI ke suffix API
// PENTING: Harian (1D) = TANPA suffix. TradingView default = harian.
const TF_MAP = {
  '1': '|1',
  '5': '|5',
  '15': '|15',
  '60': '|60',
  '240': '|240',
  '1D': '',      // TANPA suffix = harian (default)
  '1W': '|1W',
  '1M': '|1M',
};

const buildColumns = (tf) => {
  const suffix = TF_MAP[tf] ?? '';
  const columns = [];
  for (const [key, fn] of Object.entries(TECHNICAL_FIELDS)) {
    if (PRICE_FIELDS.includes(key)) {
      columns.push(fn());
    } else {
      columns.push(fn(suffix));
    }
  }
  return columns;
};

export const fetchTechnicalData = async (tf = '1D') => {
  const columns = buildColumns(tf);
  const payload = {
    symbols: { tickers: ['OANDA:XAUUSD'], query: { types: [] } },
    columns,
  };

  try {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.data?.length) throw new Error('Data kosong');

    const values = json.data[0].d;
    const keys = Object.keys(TECHNICAL_FIELDS);
    const result = {};
    keys.forEach((key, idx) => { result[key] = values[idx]; });
    return result;
  } catch (err) {
    console.error('Gagal fetch data teknikal:', err);
    return null;
  }
};
