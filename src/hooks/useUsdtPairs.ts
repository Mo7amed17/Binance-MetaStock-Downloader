import { useState, useEffect } from 'react'

export function useUsdtPairs() {
  const [pairs, setPairs] = useState<string[]>([])

  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/price')
      .then((r) => r.json())
      .then((data: { symbol: string }[]) => {
        const usdt = data
          .map((d) => d.symbol)
          .filter((s) => s.endsWith('USDT'))
          .sort()
        setPairs(usdt)
      })
      .catch(() => {})
  }, [])

  return pairs
}
