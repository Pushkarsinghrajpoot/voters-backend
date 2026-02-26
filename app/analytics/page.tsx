'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AnalyticsPage() {
  const [wards, setWards] = useState(0)
  const [districts, setDistricts] = useState(0)
  const [pollingStations, setPollingStations] = useState(0)
  const [avgAge, setAvgAge] = useState(0)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      // Get unique wards
      const { data: wardsData } = await supabase
        .from('voters')
        .select('part_number')
        .eq('is_deleted', false)

      const uniqueWards = new Set(wardsData?.map(v => v.part_number))
      setWards(uniqueWards.size)

      // Get unique districts
      const { data: districtsData } = await supabase
        .from('voters')
        .select('district_value')
        .eq('is_deleted', false)

      const uniqueDistricts = new Set(districtsData?.map(v => v.district_value))
      setDistricts(uniqueDistricts.size)

      // Get unique polling stations
      const { data: pollingData } = await supabase
        .from('voters')
        .select('psbuilding_name')
        .eq('is_deleted', false)

      const uniquePS = new Set(pollingData?.filter(v => v.psbuilding_name).map(v => v.psbuilding_name))
      setPollingStations(uniquePS.size)

      // Calculate average age
      const { data: votersWithAge } = await supabase
        .from('voters')
        .select('age')
        .not('age', 'is', null)
        .eq('is_deleted', false)

      if (votersWithAge && votersWithAge.length > 0) {
        const totalAge = votersWithAge.reduce((sum, v) => sum + (parseInt(v.age) || 0), 0)
        setAvgAge(Math.round(totalAge / votersWithAge.length))
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics & Insights</h1>
        <p className="text-slate-600 mt-1">Detailed voter data analysis from Supabase</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Wards/Parts</CardTitle>
            <PieChart className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wards}</div>
            <p className="text-xs text-slate-600">Across {districts} districts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAge} years</div>
            <p className="text-xs text-slate-600">Across all voters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Districts</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{districts}</div>
            <p className="text-xs text-slate-600">Unique districts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Polling Stations</CardTitle>
            <Activity className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pollingStations}</div>
            <p className="text-xs text-slate-600">Active locations</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Real Database Statistics</CardTitle>
          <CardDescription>All metrics loaded from Supabase in real-time</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-slate-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium">More Analytics Coming Soon</p>
          <p className="text-sm mt-2">
            Advanced charts for age distribution, gender ratios, ward-wise breakdown, and geographic visualization
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
