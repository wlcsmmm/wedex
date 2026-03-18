'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatSGD } from '@/lib/gst'

interface Props {
  totalBudget: string
  onChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}

const ESTIMATES = [
  { label: 'Intimate (~80 pax)', range: 'S$30K – S$45K', value: '38000' },
  { label: 'Mid-size (~150 pax)', range: 'S$50K – S$65K', value: '58000' },
  { label: 'Grand (~250 pax)', range: 'S$70K – S$85K', value: '78000' },
]

export function Step2Budget({ totalBudget, onChange, onNext, onBack }: Props) {
  const [showEstimates, setShowEstimates] = useState(false)
  const parsed = parseFloat(totalBudget)
  const isValid = !isNaN(parsed) && parsed >= 1000

  return (
    <div className="max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold text-charcoal mb-2">What&apos;s your total budget?</h2>
      <p className="text-charcoal/50 text-sm mb-8">
        This is the all-in number — venue, attire, photography, everything.
      </p>

      <div className="mb-4">
        <Input
          label="Total wedding budget"
          prefix="S$"
          type="number"
          min={1000}
          step={1000}
          placeholder="60000"
          value={totalBudget}
          onChange={(e) => onChange(e.target.value)}
        />
        {isValid && (
          <p className="mt-2 text-sm text-sage font-medium">
            {formatSGD(parsed)} — looks good 👍
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowEstimates(!showEstimates)}
        className="text-sm text-blush hover:underline mb-6"
      >
        {showEstimates ? '▾' : '▸'} Help me estimate
      </button>

      {showEstimates && (
        <div className="space-y-2 mb-6">
          {ESTIMATES.map((e) => (
            <button
              key={e.value}
              onClick={() => { onChange(e.value); setShowEstimates(false) }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-charcoal/10 rounded-xl hover:border-blush/50 hover:bg-blush-50 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-medium text-charcoal">{e.label}</p>
                <p className="text-xs text-charcoal/50">{e.range}</p>
              </div>
              <span className="text-sm font-semibold text-blush">{formatSGD(parseInt(e.value))}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} disabled={!isValid} className="flex-1">Next →</Button>
      </div>
    </div>
  )
}
