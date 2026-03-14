import { useState } from 'react'

const INTERVALS = [
  { value: '1m', label: '1 Minute' },
  { value: '3m', label: '3 Minutes' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '2h', label: '2 Hours' },
  { value: '4h', label: '4 Hours' },
  { value: '6h', label: '6 Hours' },
  { value: '8h', label: '8 Hours' },
  { value: '12h', label: '12 Hours' },
  { value: '1d', label: 'Daily' },
  { value: '3d', label: '3 Days' },
  { value: '1w', label: 'Weekly' },
  { value: '1M', label: 'Monthly' },
]

async function downloadMetaStockCSV(symbol: string, interval: string) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status}`)
  }

  const data: string[][] = await response.json()

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No data returned. Check the symbol name.')
  }

  let csv = ''
  data.forEach((entry) => {
    const date = new Date(Number(entry[0]))
    const yyyy = date.getUTCFullYear()
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(date.getUTCDate()).padStart(2, '0')
    const formattedDate = `${yyyy}${mm}${dd}`
    csv += `${symbol},${formattedDate},${entry[1]},${entry[2]},${entry[3]},${entry[4]},${entry[5]}\n`
  })

  const blob = new Blob([csv], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${symbol}_${interval}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function App() {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [interval, setInterval] = useState('1d')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDownload = async () => {
    const sym = symbol.trim().toUpperCase()
    if (!sym) {
      setError('Please enter a symbol.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await downloadMetaStockCSV(sym, interval)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Binance CSV Downloader</h1>
          <p className="text-gray-400 text-sm mt-1">MetaStock format · 1000 candles</p>
        </div>

        {/* Symbol Input */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g. BTCUSDT"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-gray-600 uppercase"
          />
        </div>

        {/* Interval Select */}
        <div className="mb-7">
          <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
          >
            {INTERVALS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 disabled:cursor-not-allowed text-black font-semibold rounded-lg px-4 py-3 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Fetching...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Download CSV
            </>
          )}
        </button>

        <p className="text-center text-gray-600 text-xs mt-5">
          Data from Binance API · {symbol.trim().toUpperCase() || '—'}_{interval}
        </p>
      </div>
    </div>
  )
}
