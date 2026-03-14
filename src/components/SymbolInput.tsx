import { useState, useRef, useEffect } from 'react'
import { useUsdtPairs } from '../hooks/useUsdtPairs'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function SymbolInput({ value, onChange }: Props) {
  const allPairs = useUsdtPairs()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (raw: string) => {
    const upper = raw.toUpperCase()
    onChange(upper)
    const filtered = allPairs.filter((s) => s.startsWith(upper)).slice(0, 8)
    setSuggestions(filtered)
    setShowSuggestions(upper.length > 0 && filtered.length > 0)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder="e.g. BTCUSDT"
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-gray-600 uppercase"
      />
      {showSuggestions && (
        <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-lg mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s}
              onMouseDown={() => {
                onChange(s)
                setShowSuggestions(false)
              }}
              className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer text-sm"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
