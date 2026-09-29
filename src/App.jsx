import { useTechnicalData, useClock } from './hooks';
import {
  fmtPrice, fmtInd, fmtComma, getRatingSignal, ratingToAngle,
  buildOscList, buildMAList, countSignals,
} from './helpers';

// ==================== KONSTANTA ====================
const TIMEFRAMES = [
  { key: '1', label: '1 Menit' },
  { key: '5', label: '5 Menit' },
  { key: '15', label: '15 Menit' },
  { key: '60', label: '1 Jam' },
  { key: '240', label: '4 Jam' },
  { key: '1D', label: 'Harian' },
  { key: '1W', label: 'Mingguan' },
  { key: '1M', label: 'Bulanan' },
];

// Warna untuk sinyal
const SIG = {
  buy: { bg: 'bg-[#EAF5EF]', text: 'text-[#1B8755]', border: 'border-[#1B8755]/30' },
  sell: { bg: 'bg-[#FAF1F0]', text: 'text-[#D93829]', border: 'border-[#D93829]/30' },
  neutral: { bg: 'bg-[#F4F1EA]', text: 'text-[#4A463D]', border: 'border-[#DDD6C6]' },
};

// ==================== KOMPONEN KECIL ====================

// Badge sinyal untuk tabel
const SignalBadge = ({ signal }) => {
  const s = SIG[signal.cls] || SIG.neutral;
  return (
    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-sm ${s.bg} ${s.text} border ${s.border}`}>
      [ {signal.text} ]
    </span>
  );
};

// Mini badge (Jual: X, Netral: X, Beli: X)
const CountBadges = ({ counts }) => (
  <div className="flex items-center space-x-1.5 font-mono text-[11px]">
    <span className={`px-2 py-0.5 ${SIG.sell.bg} ${SIG.sell.text} font-bold border ${SIG.sell.border} rounded-sm`}>JUAL: {counts.sell}</span>
    <span className="px-2 py-0.5 bg-[#F4F1EA] text-[#848995] font-bold border border-[#141517]/20 rounded-sm">NETRAL: {counts.neutral}</span>
    <span className={`px-2 py-0.5 ${SIG.buy.bg} ${SIG.buy.text} font-bold border ${SIG.buy.border} rounded-sm`}>BELI: {counts.buy}</span>
  </div>
);

// ==================== MARKET TAPE ====================
const MarketTape = ({ data, clock }) => {
  const price = fmtComma(data?.close);
  const changePct = data?.changePercent;
  const isUp = changePct > 0;
  return (
    <aside className="bg-[#0E0F11] text-[#9A9EA7] border-b border-[#23252A] text-[11px] font-mono select-none overflow-hidden">
      <div className="max-w-[1760px] mx-auto px-4 py-1.5 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="text-[9px] font-bold tracking-widest text-[#E5C77A] uppercase bg-[#232015] px-1.5 py-0.5 rounded-sm border border-[#524424]">SPOT TAPE</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-white font-semibold">XAU/USD</span>
            <span className="text-white tabular-numbers">{price}</span>
            <span className={`font-medium ${isUp ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {changePct != null ? `${isUp ? '+' : ''}${Number(changePct).toFixed(2)}%` : '--'}
            </span>
          </div>
        </div>
        <div className="hidden xl:flex items-center space-x-3 text-[11px] shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-[#17191D] px-2 py-0.5 rounded border border-[#2B2E36] text-[#C2C6D1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            MARKET ACTIVE
          </span>
        </div>
      </div>
    </aside>
  );
};

// ==================== HEADER ====================
const Header = ({ clock, lastUpdated }) => {
  const hh = String(clock.getHours()).padStart(2, '0');
  const mm = String(clock.getMinutes()).padStart(2, '0');
  const ss = String(clock.getSeconds()).padStart(2, '0');

  const lastUpStr = lastUpdated
    ? `${String(lastUpdated.getHours()).padStart(2, '0')}:${String(lastUpdated.getMinutes()).padStart(2, '0')}:${String(lastUpdated.getSeconds()).padStart(2, '0')}`
    : '--:--:--';

  return (
    <header className="border-b border-[#141517]/15 bg-[#FAF8F5]/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-[1760px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#141517] text-[#FAF8F5] flex items-center justify-center font-headline font-bold text-lg rounded-sm shadow-neo-sm relative border border-[#141517]">
            <span className="tracking-tighter text-[#E5C77A]">GP</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C5A059] rounded-full border-2 border-[#FAF8F5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-lg tracking-tight text-[#141517]">GOLD PULSE</span>
              <span className="text-[9px] font-mono uppercase bg-[#141517] text-[#FAF8F5] px-1.5 py-0.5 rounded-[2px] font-semibold tracking-widest">INSTITUTIONAL</span>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#6B6E77] -mt-0.5">XAUUSD Technical Intelligence Terminal</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2 bg-white px-2.5 py-1 rounded-sm hairline-border text-xs font-mono shadow-neo-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B8755]" />
            </span>
            <span className="font-bold text-[11px] text-[#141517] tracking-wider uppercase">FEED: REAL-TIME</span>
          </div>

          <div className="bg-[#141517] text-[#FAF8F5] px-3 py-1 rounded-sm text-xs font-mono tabular-numbers flex items-center gap-2 border border-[#141517] shadow-neo-sm">
            <span className="text-[#A4A9B6] text-[10px] uppercase font-sans">WIB</span>
            <span className="font-semibold tracking-wider text-[13px] text-[#E5C77A]">{hh}:{mm}:{ss}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#5A5E68] bg-[#FAF8F5] px-2 py-1 rounded-sm hairline-border">
            <svg className="w-3 h-3 text-[#9E7D37] animate-spin" fill="none" stroke="currentColor" style={{ animationDuration: '8s' }} viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
            </svg>
            <span>{lastUpStr}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// ==================== PRICE CARD ====================
const PriceCard = ({ data }) => {
  if (!data) return null;
  const close = data.close;
  const change = data.change;
  const changePct = data.changePercent;
  const isUp = change >= 0;
  const priceParts = fmtComma(close).split('.');
  const high = data.high;
  const low = data.low;
  const rangePos = (high && low && close) ? ((close - low) / (high - low)) * 100 : 50;

  return (
    <article className="lg:col-span-5 bg-white rounded-sm hairline-border p-5 sm:p-6 flex flex-col justify-between shadow-neo relative overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#141517] flex">
        <div className="w-1/3 bg-[#C5A059]" />
        <div className="w-2/3 bg-[#141517]" />
      </div>

      <div>
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#141517]/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-[#8C6B24] font-bold tracking-widest uppercase bg-[#C5A059]/15 px-2 py-0.5 rounded-sm border border-[#C5A059]/30">BULLION SPOT</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#1B8755] font-semibold bg-[#EAF5EF] px-2 py-0.5 rounded-sm border border-[#BDE3CC]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1B8755]" />PASAR DIBUKA
              </span>
            </div>
            <h1 className="text-3xl font-headline font-bold text-[#141517] tracking-tight mt-1.5">XAU / USD</h1>
            <p className="text-xs text-[#5A5E68] font-sans font-medium">Emas Murni Spot London / Dolar AS • Troy Ounce</p>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] uppercase tracking-wider text-[#848995] block">Bursa Acuan</span>
            <span className="text-xs font-bold text-[#141517]">COMEX / NYMEX</span>
          </div>
        </div>

        {/* Big Price */}
        <div className="py-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-[#141517]/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#848995] block mb-0.5">HARGA TERAKHIR (BID/ASK MID)</span>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-[#141517] tracking-tight tabular-numbers flex items-baseline">
              <span className="text-[#9E7D37] text-2xl sm:text-3xl font-normal mr-1">$</span>
              {priceParts[0]}<span className="text-[#848995] font-medium text-3xl sm:text-4xl">.{priceParts[1] ?? '00'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 font-mono text-sm sm:text-base font-bold ${isUp ? 'text-[#1B8755] bg-[#EAF5EF] border-[#1B8755]/30' : 'text-[#D93829] bg-[#FAF1F0] border-[#D93829]/30'} border px-3 py-1.5 rounded-sm shadow-neo-sm`}>
              <svg className={`w-4 h-4 ${isUp ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{change != null ? `${isUp ? '+' : ''}${fmtPrice(change)}` : '--'}</span>
              <span className="text-xs font-semibold">({changePct != null ? `${isUp ? '+' : ''}${Number(changePct).toFixed(2)}%` : '--'})</span>
            </div>
          </div>
        </div>

        {/* OHLC Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
          {[
            { label: 'Open', value: fmtComma(data.open) },
            { label: 'High', value: fmtComma(data.high), color: 'text-[#1B8755]' },
            { label: 'Low', value: fmtComma(data.low), color: 'text-[#D93829]' },
            { label: 'Prev Close', value: fmtComma(data.prevClose), color: 'text-[#5A5E68]' },
          ].map((item) => (
            <div key={item.label} className="bg-[#FAF8F5] p-2.5 rounded-sm border border-[#141517]/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#707582] block mb-0.5">{item.label}</span>
              <span className={`font-mono text-xs sm:text-sm font-semibold ${item.color || 'text-[#141517]'} tabular-numbers`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Range Bar */}
      <div className="mt-5 pt-4 border-t border-[#141517]/10">
        <div className="flex items-center justify-between text-[11px] font-mono mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[#707582]">Rentang Harian:</span>
            <span className="text-[#D93829] font-bold">{fmtComma(data.low)}</span>
          </div>
          <div className="text-[10px] font-mono text-[#8C6B24] uppercase tracking-wide font-semibold">
            Posisi Saat Ini: {rangePos.toFixed(1)}%
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#707582]">Maksimal:</span>
            <span className="text-[#1B8755] font-bold">{fmtComma(data.high)}</span>
          </div>
        </div>
        <div className="relative w-full h-3 bg-[#E9E4D8] rounded-sm p-0.5 border border-[#141517]/15">
          <div className="h-full bg-gradient-to-r from-[#D93829] via-[#C5A059] to-[#1B8755] rounded-[1px]" style={{ width: `${rangePos}%` }} />
          <div className="absolute top-[-3px] bottom-[-3px] w-1.5 bg-[#141517] rounded-none shadow-sm -ml-0.5" style={{ left: `${rangePos}%` }} />
        </div>
      </div>
    </article>
  );
};

// ==================== GAUGE SVG ====================
const GaugeMeter = ({ value }) => {
  const angle = ratingToAngle(value);
  const signal = getRatingSignal(value);

  // Warna dot berdasarkan sinyal
  const dotColor = signal.cls === 'buy' ? '#1B8755' : signal.cls === 'sell' ? '#D93829' : '#C5A059';

  return (
    <div className="relative w-full max-w-[440px] flex flex-col items-center">
      <svg className="w-full max-w-[340px] h-[175px] overflow-visible" viewBox="0 0 300 160">
        <defs>
          <linearGradient id="meterDialTrack" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#D93829" />
            <stop offset="25%" stopColor="#E87C6F" />
            <stop offset="50%" stopColor="#C4BBA7" />
            <stop offset="75%" stopColor="#55B884" />
            <stop offset="100%" stopColor="#1B8755" />
          </linearGradient>
          <filter id="shadowFilter" height="130%" width="130%" x="-10%" y="-10%">
            <feDropShadow dx="0" dy="2" floodColor="#141517" floodOpacity="0.15" stdDeviation="2" />
          </filter>
        </defs>
        {/* Outer ring */}
        <path d="M 25 150 A 125 125 0 0 1 275 150" fill="none" stroke="#E9E4D8" strokeLinecap="butt" strokeWidth="18" />
        {/* Color track */}
        <path d="M 25 150 A 125 125 0 0 1 275 150" fill="none" stroke="url(#meterDialTrack)" strokeLinecap="butt" strokeWidth="8" />
        {/* Tick marks */}
        <line stroke="#141517" strokeWidth="2.5" x1="25" x2="12" y1="150" y2="150" />
        <line stroke="#141517" strokeWidth="3" x1="150" x2="150" y1="25" y2="10" />
        <line stroke="#141517" strokeWidth="2.5" x1="275" x2="288" y1="150" y2="150" />
        {/* Labels */}
        <text fill="#D93829" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" letterSpacing="1" x="35" y="142">JUAL</text>
        <text fill="#4A463D" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" letterSpacing="1" x="130" y="44">NETRAL</text>
        <text fill="#1B8755" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" letterSpacing="1" x="235" y="142">BELI</text>
        {/* Inner subdial */}
        <circle cx="150" cy="150" fill="#FAF8F5" r="70" stroke="#DDD6C6" strokeWidth="1" />
        <path d="M 95 150 A 55 55 0 0 1 205 150" fill="none" stroke="#DDD6C6" strokeDasharray="2,3" strokeWidth="1" />
        {/* Needle */}
        <g filter="url(#shadowFilter)" transform={`rotate(${angle}, 150, 150)`}>
          <line stroke="#141517" strokeLinecap="round" strokeWidth="3" x1="150" x2="150" y1="150" y2="168" />
          <polygon fill="#C5A059" points="150,32 153,50 147,50" />
          <line stroke="#141517" strokeLinecap="round" strokeWidth="2.2" x1="150" x2="150" y1="150" y2="35" />
          <circle cx="150" cy="150" fill="#141517" r="6" />
          <circle cx="150" cy="150" fill="#E5C77A" r="3" />
        </g>
      </svg>

      {/* Readout badge */}
      <div className="mt-[-12px] text-center bg-white px-5 py-2 rounded-sm border border-[#141517]/20 shadow-neo-sm z-10">
        <span className="text-[9px] font-mono tracking-widest uppercase text-[#707582] block">HASIL KONSENSUS</span>
        <div className="text-lg font-headline font-bold tracking-wider text-[#141517] uppercase flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
          {signal.text}
        </div>
        <div className="font-mono text-xs text-[#5A5E68] font-semibold tabular-numbers">
          SKOR: {value != null ? Number(value).toFixed(4) : '--'} <span className="text-[10px] text-[#848995]">[-1.00 ~ +1.00]</span>
        </div>
      </div>
    </div>
  );
};

// ==================== RATING CARD ====================
const RatingCard = ({ data, timeframe, setTimeframe }) => {
  const oscList = data ? buildOscList(data) : [];
  const maList = data ? buildMAList(data) : [];
  const allSignals = [...oscList, ...maList];
  const total = countSignals(allSignals);

  return (
    <article className="lg:col-span-7 bg-white rounded-sm hairline-border p-5 sm:p-6 flex flex-col justify-between shadow-neo relative">
      {/* Header + Timeframe */}
      <div>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-4 border-b border-[#141517]/10">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-[#141517] text-[#E5C77A] font-bold text-xs flex items-center justify-center font-mono rounded-sm">01</div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-headline font-bold uppercase tracking-wide text-[#141517]">RATING TEKNIKAL</h2>
                <span className="text-[9px] font-mono bg-[#E9E4D8] text-[#141517] px-1.5 py-0.5 rounded uppercase font-semibold">KONSENSUS MULTI-FAKTOR</span>
              </div>
              <p className="text-[11px] text-[#5A5E68] font-sans">Agregasi 26 indikator momentum, tren, & volatilitas</p>
            </div>
          </div>

          {/* Timeframe pills */}
          <nav className="inline-flex bg-[#F4F1EA] p-1 rounded-sm border border-[#141517]/15 overflow-x-auto max-w-full">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                className={`px-2.5 py-1 text-xs font-mono font-medium transition whitespace-nowrap ${
                  timeframe === tf.key
                    ? 'font-bold bg-[#141517] text-[#FAF8F5] shadow-neo-sm'
                    : 'text-[#5A5E68] hover:text-[#141517] hover:bg-[#E9E4D8]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Gauge */}
        <div className="py-4 flex flex-col items-center justify-center">
          <GaugeMeter value={data?.rating} />
        </div>
      </div>

      {/* Signal count cards */}
      <div className="grid grid-cols-3 gap-3 pt-3">
        {/* Jual */}
        <div className="bg-[#FAF8F5] rounded-sm border-2 border-[#D93829]/30 p-3 text-center shadow-neo-sm relative overflow-hidden group hover:border-[#D93829] transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#D93829]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#D93829] font-bold block mb-0.5">[ Sinyal Jual ]</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#D93829] tabular-numbers">{total.sell}</div>
          <span className="text-[10px] text-[#707582] font-mono mt-0.5 block">{allSignals.length > 0 ? ((total.sell / allSignals.length) * 100).toFixed(1) : 0}% Total</span>
        </div>
        {/* Netral */}
        <div className="bg-[#FAF8F5] rounded-sm border-2 border-[#141517]/20 p-3 text-center shadow-neo-sm relative overflow-hidden group hover:border-[#141517] transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#141517]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A5E68] font-bold block mb-0.5">[ Sinyal Netral ]</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#141517] tabular-numbers">{total.neutral}</div>
          <span className="text-[10px] text-[#707582] font-mono mt-0.5 block">{allSignals.length > 0 ? ((total.neutral / allSignals.length) * 100).toFixed(1) : 0}% Sideways</span>
        </div>
        {/* Beli */}
        <div className="bg-[#FAF8F5] rounded-sm border-2 border-[#1B8755]/30 p-3 text-center shadow-neo-sm relative overflow-hidden group hover:border-[#1B8755] transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1B8755]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#1B8755] font-bold block mb-0.5">[ Sinyal Beli ]</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#1B8755] tabular-numbers">{total.buy}</div>
          <span className="text-[10px] text-[#707582] font-mono mt-0.5 block">{allSignals.length > 0 ? ((total.buy / allSignals.length) * 100).toFixed(1) : 0}% Bullish</span>
        </div>
      </div>
    </article>
  );
};

// ==================== LEDGER TABLE (OSC / MA) ====================
const LedgerTable = ({ title, icon, scoreValue, statusLabel, statusColor, items, counts, footerLeft, footerRight, valueFormatter }) => (
  <article className="bg-white rounded-sm hairline-border flex flex-col shadow-neo">
    {/* Header */}
    <div className="p-4 sm:p-5 border-b border-[#141517]/15 bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center space-x-3">
        <span className={`w-3 h-3 rounded-none border border-[#141517] ${icon === 'gold' ? 'bg-[#C5A059]' : 'bg-[#141517]'}`} />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-headline font-bold text-base text-[#141517] uppercase tracking-wide">{title}</h3>
            <span className={`text-[10px] font-mono bg-white px-2 py-0.5 rounded-sm border border-[#141517]/15 font-bold ${statusColor === 'sell' ? 'text-[#D93829]' : statusColor === 'buy' ? 'text-[#1B8755]' : 'text-[#141517]'}`}>
              SKOR: {scoreValue != null ? Number(scoreValue).toFixed(4) : '--'}
            </span>
          </div>
          <p className="text-[11px] text-[#5A5E68] font-mono">
            Status: <strong className={statusColor === 'sell' ? 'text-[#D93829]' : statusColor === 'buy' ? 'text-[#1B8755]' : 'text-[#141517]'}>{statusLabel}</strong> • {items.length} Formulasi
          </p>
        </div>
      </div>
      <CountBadges counts={counts} />
    </div>

    {/* Table */}
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#141517]/15 bg-[#F4F1EA]/80 font-mono text-[10px] text-[#5A5E68] uppercase tracking-wider">
            <th className="py-2.5 px-4 font-bold">NAMA INDIKATOR</th>
            <th className="py-2.5 px-4 text-right font-bold">NILAI METRIK</th>
            <th className="py-2.5 px-4 text-right font-bold">SINYAL EKSEKUSI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#141517]/10 font-mono text-[12px]">
          {items.map((item) => (
            <tr key={item.name} className="ledger-row transition-colors">
              <td className="py-2.5 px-4 font-sans font-medium text-[#141517]">
                {item.name}
                <span className="text-[10px] font-mono text-[#848995] block sm:inline sm:ml-1">{item.sub}</span>
              </td>
              <td className="py-2.5 px-4 text-right tabular-numbers text-[#141517] font-semibold">
                {valueFormatter(item.value)}
              </td>
              <td className="py-2.5 px-4 text-right">
                <SignalBadge signal={item.signal} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Footer */}
    <div className="p-3 bg-[#FAF8F5] border-t border-[#141517]/10 flex items-center justify-between text-[11px] font-mono text-[#5A5E68]">
      <span>{footerLeft}</span>
      <span className="font-bold text-[#141517]">{footerRight}</span>
    </div>
  </article>
);

// ==================== PIVOT TABLE ====================
const PivotSection = ({ data }) => {
  if (!data) return null;
  const types = [
    { name: 'Classic', s3: data.pivotClassicS3, s2: data.pivotClassicS2, s1: data.pivotClassicS1, p: data.pivotClassicP, r1: data.pivotClassicR1, r2: data.pivotClassicR2, r3: data.pivotClassicR3 },
    { name: 'Fibonacci', s3: data.pivotFibS3, s2: data.pivotFibS2, s1: data.pivotFibS1, p: data.pivotFibP, r1: data.pivotFibR1, r2: data.pivotFibR2, r3: data.pivotFibR3 },
    { name: 'Camarilla', s3: data.pivotCamarillaS3, s2: data.pivotCamarillaS2, s1: data.pivotCamarillaS1, p: data.pivotCamarillaP, r1: data.pivotCamarillaR1, r2: data.pivotCamarillaR2, r3: data.pivotCamarillaR3 },
    { name: 'Woodie', s3: data.pivotWoodieS3, s2: data.pivotWoodieS2, s1: data.pivotWoodieS1, p: data.pivotWoodieP, r1: data.pivotWoodieR1, r2: data.pivotWoodieR2, r3: data.pivotWoodieR3 },
    { name: 'Demark', s3: data.pivotDMS1, s2: null, s1: null, p: data.pivotDMP, r1: data.pivotDMR1, r2: null, r3: null },
  ];

  return (
    <section className="bg-white rounded-sm hairline-border shadow-neo overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[#141517]/15 bg-[#FAF8F5]">
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 bg-[#C5A059] rounded-none border border-[#141517]" />
          <h3 className="font-headline font-bold text-base text-[#141517] uppercase tracking-wide">Pivot Points</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#141517]/15 bg-[#F4F1EA]/80 font-mono text-[10px] text-[#5A5E68] uppercase tracking-wider">
              <th className="py-2.5 px-4 font-bold">TIPE</th>
              {['S3', 'S2', 'S1', 'PIVOT', 'R1', 'R2', 'R3'].map((h) => (
                <th key={h} className="py-2.5 px-4 text-right font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141517]/10 font-mono text-[12px]">
            {types.map((t) => (
              <tr key={t.name} className="ledger-row transition-colors">
                <td className="py-2.5 px-4 font-sans font-medium text-[#141517]">{t.name}</td>
                {[t.s3, t.s2, t.s1, t.p, t.r1, t.r2, t.r3].map((v, i) => (
                  <td key={i} className="py-2.5 px-4 text-right tabular-numbers text-[#141517] font-semibold">{fmtPrice(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ==================== DEPTH BAR ====================
const DepthBar = ({ data }) => (
  <section className="bg-[#141517] text-[#FAF8F5] rounded-sm p-4 sm:p-5 hairline-border shadow-neo">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-sm bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#E5C77A] font-mono text-sm font-bold">⊞</div>
        <div>
          <h4 className="font-headline font-bold text-sm text-white tracking-wide">KEDALAMAN BUKU PESANAN (INSTITUTIONAL L2 DEPTH)</h4>
          <p className="text-[11px] text-[#A4A9B6] font-mono">
            Likuiditas • <span className="text-[#E5C77A] font-bold">XAU/USD</span> • Real-time Book
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-[#1F2124] px-3 py-1 rounded-sm border border-[#2F3238] text-[11px] font-mono">
          <span className="text-[#848995]">HARGA:</span>
          <span className="text-white font-bold ml-1">{data ? fmtComma(data.close) : '--'}</span>
        </div>
        <div className="bg-[#1F2124] px-3 py-1 rounded-sm border border-[#2F3238] text-[11px] font-mono">
          <span className="text-[#848995]">STATUS:</span>
          <span className="text-[#E5C77A] font-bold ml-1">AKTIF</span>
        </div>
      </div>
    </div>
  </section>
);

// ==================== FOOTER ====================
const Footer = () => (
  <footer className="mt-8 border-t border-[#141517]/15 bg-[#FAF8F5] text-[#5A5E68] py-4 text-xs font-mono">
    <div className="max-w-[1760px] mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1.5 text-[#141517] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#1B8755]" />
          <span>TradingView Scanner API</span>
        </div>
        <span className="text-[#DDD6C6]">|</span>
        <span>Auto-refresh: <strong className="text-[#141517]">5s</strong></span>
        <span className="text-[#DDD6C6]">|</span>
        <span>Engine: <strong className="text-[#141517]">Vite + React</strong></span>
      </div>
      <div className="text-[10px] text-[#707582] text-center md:text-right max-w-xl">
        © 2025 Gold Pulse. Terminal data untuk observasi analitikal pasar.
      </div>
    </div>
  </footer>
);

// ==================== MAIN APP ====================
export default function App() {
  const { data, timeframe, setTimeframe, lastUpdated, loading } = useTechnicalData();
  const clock = useClock();

  const oscList = data ? buildOscList(data) : [];
  const maList = data ? buildMAList(data) : [];
  const oscCounts = countSignals(oscList);
  const maCounts = countSignals(maList);
  const oscSignal = getRatingSignal(data?.ratingOsc);
  const maSignal = getRatingSignal(data?.ratingMA);

  return (
    <div className="min-h-full flex flex-col bg-[#F4F1EA] text-[#141517] selection:bg-[#C5A059] selection:text-white">
      <MarketTape data={data} clock={clock} />
      <Header clock={clock} lastUpdated={lastUpdated} />

      <main className="flex-1 max-w-[1760px] w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-5">
        {loading && !data ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center font-mono text-[#5A5E68]">
              <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Memuat data teknikal...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top Deck */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <PriceCard data={data} />
              <RatingCard data={data} timeframe={timeframe} setTimeframe={setTimeframe} />
            </section>

            {/* Oscillator + MA Tables */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <LedgerTable
                title="Indikator Oscillator"
                icon="gold"
                scoreValue={data?.ratingOsc}
                statusLabel={oscSignal.text}
                statusColor={oscSignal.cls}
                items={oscList}
                counts={oscCounts}
                valueFormatter={fmtInd}
                footerLeft="MODEL: REVERSION OSCILLATOR SUITE"
                footerRight={`DIVERGENSI: ${oscSignal.cls === 'sell' ? 'BEARISH' : oscSignal.cls === 'buy' ? 'BULLISH' : 'MINOR'}`}
              />
              <LedgerTable
                title="Moving Average (Rerata Bergerak)"
                icon="dark"
                scoreValue={data?.ratingMA}
                statusLabel={maSignal.text}
                statusColor={maSignal.cls}
                items={maList}
                counts={maCounts}
                valueFormatter={fmtPrice}
                footerLeft={`SUPPORT: EMA 200 (${fmtComma(data?.ema200)})`}
                footerRight={`BIAS MAKRO: ${maSignal.cls === 'buy' ? 'BULLISH' : maSignal.cls === 'sell' ? 'BEARISH' : 'SIDEWAYS'}`}
              />
            </section>

            {/* Pivot Points */}
            <PivotSection data={data} />

            {/* Depth Bar */}
            <DepthBar data={data} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
