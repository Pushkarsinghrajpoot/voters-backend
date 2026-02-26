'use client'

import { useEffect, useState } from 'react'
import { Activity, Database, Globe, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface HealthStatus {
  api: string
  database: string
  eci_portal: string
  overall: string
  timestamp?: string
}

export function SystemStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      console.log('Checking health at:', `${apiUrl}/health`)
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store'
      })
      
      console.log('Health check response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Health data:', data)
        setHealth(data)
        setError(false)
      } else {
        throw new Error('Health check failed')
      }
    } catch (err) {
      console.error('Health check error:', err)
      setError(true)
      setHealth({
        api: 'offline',
        database: 'unknown',
        eci_portal: 'unknown',
        overall: 'offline'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'unhealthy':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'offline':
      case 'unknown':
        return 'bg-slate-100 text-slate-600 border-slate-200'
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
        return <CheckCircle className="w-4 h-4" />
      case 'offline':
        return <WifiOff className="w-4 h-4" />
      case 'unhealthy':
      case 'critical':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4 animate-pulse" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Online'
      case 'degraded':
        return 'Degraded'
      case 'unhealthy':
        return 'Error'
      case 'offline':
        return 'Offline'
      case 'unknown':
        return 'Unknown'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse" />
            System Status
          </CardTitle>
          <CardDescription>Checking system health...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center animate-pulse">
              <span className="h-4 bg-slate-200 rounded w-24"></span>
              <span className="h-6 bg-slate-200 rounded w-20"></span>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={error ? 'border-red-300 bg-red-50/30' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {error ? <WifiOff className="w-5 h-5 text-red-600" /> : <Activity className="w-5 h-5 text-green-600" />}
          System Status
        </CardTitle>
        <CardDescription>
          {error ? 'Backend is offline' : 'Real-time health monitoring'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* API Backend */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            API Backend
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(health?.api || 'unknown')}`}>
            {getStatusIcon(health?.api || 'unknown')}
            {getStatusText(health?.api || 'unknown')}
          </span>
        </div>

        {/* Database */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(health?.database || 'unknown')}`}>
            {getStatusIcon(health?.database || 'unknown')}
            {getStatusText(health?.database || 'unknown')}
          </span>
        </div>

        {/* ECI Portal */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            ECI Portal
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(health?.eci_portal || 'unknown')}`}>
            {getStatusIcon(health?.eci_portal || 'unknown')}
            {getStatusText(health?.eci_portal || 'unknown')}
          </span>
        </div>

        {/* Last Check Time */}
        {health?.timestamp && (
          <div className="pt-2 border-t mt-2">
            <p className="text-xs text-slate-500">
              Last checked: {new Date(health.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
            ⚠️ Cannot connect to backend. Please ensure the API server is running.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
