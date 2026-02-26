'use client'

import { useEffect, useState } from 'react'
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    checkBackend()
    const interval = setInterval(checkBackend, 15000)
    return () => clearInterval(interval)
  }, [])

  const checkBackend = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        cache: 'no-store'
      })
      setIsOffline(!response.ok)
    } catch (err) {
      console.error('Backend check failed:', err)
      setIsOffline(true)
    }
  }

  const handleRetry = async () => {
    setChecking(true)
    await checkBackend()
    setTimeout(() => setChecking(false), 1000)
  }

  if (!isOffline) return null

  return (
    <div className="bg-red-600 text-white px-6 py-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5" />
          <div>
            <p className="font-semibold">Backend Server Offline</p>
            <p className="text-sm text-red-100">
              The API server is not responding. Please start the backend or check your connection.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={checking}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          {checking ? (
            <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Checking...</>
          ) : (
            <><RefreshCw className="w-4 h-4 mr-2" /> Retry</>
          )}
        </Button>
      </div>
    </div>
  )
}
