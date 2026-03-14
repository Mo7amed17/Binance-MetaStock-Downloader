export async function downloadMetaStockCSV(symbol: string, interval: string) {
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
    csv += `${yyyy}${mm}${dd},${entry[1]},${entry[2]},${entry[3]},${entry[4]},${entry[5]}\n`
  })

  const blob = new Blob([csv], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${symbol}_${interval}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
