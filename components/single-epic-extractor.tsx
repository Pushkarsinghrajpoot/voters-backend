'use client'

import { useState } from 'react'
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SingleEpicExtractorProps {
  onComplete: () => void
}

export function SingleEpicExtractor({ onComplete }: SingleEpicExtractorProps) {
  const [epicNumber, setEpicNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleExtract = async () => {
    if (!epicNumber.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/extract/single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          epic_number: epicNumber.trim(),
          state_code: 'S08'
        }),
      })

      const data = await response.json()
      setResult(data)
      onComplete()
    } catch (error) {
      setResult({
        status: 'error',
        message: `Request failed: ${error}`
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExtract()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Single EPIC Extraction
        </CardTitle>
        <CardDescription>
          Extract voter data for a single EPIC number or search existing records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={epicNumber}
            onChange={(e) => setEpicNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter EPIC number (e.g., HP/04/020/174079)"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Button onClick={handleExtract} disabled={loading || !epicNumber.trim()}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting</>
            ) : (
              <><Search className="w-4 h-4 mr-2" /> Extract</>
            )}
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border-l-4 ${
            result.status === 'success' ? 'bg-green-50 border-green-500' :
            result.status === 'duplicate' ? 'bg-yellow-50 border-yellow-500' :
            'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
              {result.status === 'duplicate' && <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />}
              {result.status === 'failed' && <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
              
              <div className="flex-1">
                <p className="font-medium text-slate-900">{result.message}</p>
                
                {result.data && (
                  <div className="mt-3 space-y-3">
                    <div className="bg-white p-3 rounded border">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {result.data.fullName && (
                          <div className="col-span-2">
                            <span className="text-slate-600 font-medium">Name:</span>
                            <p className="text-slate-900 font-semibold">{result.data.fullName}</p>
                            {result.data.fullNameL1 && (
                              <p className="text-slate-600 text-xs">{result.data.fullNameL1}</p>
                            )}
                          </div>
                        )}
                        {result.data.age && (
                          <div>
                            <span className="text-slate-600">Age:</span>
                            <p className="font-medium">{result.data.age} years</p>
                          </div>
                        )}
                        {result.data.gender && (
                          <div>
                            <span className="text-slate-600">Gender:</span>
                            <p className="font-medium">{result.data.gender}</p>
                          </div>
                        )}
                        {result.data.relationType && result.data.relativeFullName && (
                          <div className="col-span-2">
                            <span className="text-slate-600">Relation:</span>
                            <p className="font-medium">{result.data.relationType} of {result.data.relativeFullName}</p>
                          </div>
                        )}
                        {result.data.partName && (
                          <div className="col-span-2">
                            <span className="text-slate-600">Part:</span>
                            <p className="font-medium">{result.data.partNumber} - {result.data.partName}</p>
                          </div>
                        )}
                        {result.data.asmblyName && (
                          <div className="col-span-2">
                            <span className="text-slate-600">Assembly:</span>
                            <p className="font-medium">{result.data.acNumber} - {result.data.asmblyName}</p>
                          </div>
                        )}
                        {result.data.districtValue && (
                          <div>
                            <span className="text-slate-600">District:</span>
                            <p className="font-medium">{result.data.districtValue}</p>
                          </div>
                        )}
                        {result.data.stateName && (
                          <div>
                            <span className="text-slate-600">State:</span>
                            <p className="font-medium">{result.data.stateName}</p>
                          </div>
                        )}
                        {result.data.psbuildingName && (
                          <div className="col-span-2">
                            <span className="text-slate-600">Polling Station:</span>
                            <p className="font-medium">{result.data.psbuildingName}</p>
                            {result.data.psRoomDetails && (
                              <p className="text-xs text-slate-600">{result.data.psRoomDetails}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {result.status === 'success' && (
                      <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
                        ✓ Data saved to database successfully
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-slate-600 space-y-2">
          <p className="font-medium">Supported EPIC formats:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>HP/04/020/XXXXXX (Legacy format)</li>
            <li>JPJXXXXXXX (2012-2019)</li>
            <li>RPDXXXXXXX (2019-Present)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
