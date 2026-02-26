'use client'

import { useEffect, useState } from 'react'
import { User, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VoterExtraction {
  id: string
  epicNumber: string
  status: 'success' | 'failed' | 'duplicate'
  voterData?: any
  timestamp: Date
}

interface ExtractionFeedProps {
  jobId: string | null
}

export function ExtractionFeed({ jobId }: ExtractionFeedProps) {
  const [extractions, setExtractions] = useState<VoterExtraction[]>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!jobId) {
      setExtractions([])
      setIsActive(false)
      return
    }

    setIsActive(true)
    // Simulate real-time updates (replace with actual WebSocket/polling)
    const interval = setInterval(() => {
      // This would be replaced with actual API polling or WebSocket
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId])

  const addExtraction = (extraction: VoterExtraction) => {
    setExtractions(prev => [extraction, ...prev].slice(0, 50)) // Keep last 50
  }

  if (!isActive && extractions.length === 0) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Loader2 className={`w-5 h-5 ${isActive ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
          Live Extraction Feed
          {extractions.length > 0 && (
            <span className="ml-auto text-sm font-normal text-slate-600">
              {extractions.length} records
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {extractions.map((extraction) => (
            <div
              key={extraction.id}
              className={`p-3 rounded-lg border-l-4 transition-all duration-300 ${
                extraction.status === 'success'
                  ? 'bg-green-50 border-green-500'
                  : extraction.status === 'duplicate'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex items-start gap-3">
                {extraction.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
                {extraction.status === 'duplicate' && <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
                {extraction.status === 'failed' && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium">{extraction.epicNumber}</span>
                    <span className="text-xs text-slate-500">
                      {extraction.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {extraction.voterData && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium text-slate-900">{extraction.voterData.fullName}</p>
                      <p className="text-slate-600 text-xs">
                        {extraction.voterData.age} years • {extraction.voterData.gender} • {extraction.voterData.partName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
