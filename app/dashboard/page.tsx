'use client'

import { useState, useEffect } from 'react'
import { Users, TrendingUp, Clock, CheckCircle, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCards } from '@/components/stats-cards'
import { SystemStatus } from '@/components/system-status'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function AdditionalStats() {
  const [totalJobs, setTotalJobs] = useState(0)
  const [avgSuccessRate, setAvgSuccessRate] = useState(0)
  const [duplicateRate, setDuplicateRate] = useState(0)
  const [failureRate, setFailureRate] = useState(0)

  useEffect(() => {
    loadAdditionalStats()
  }, [])

  const loadAdditionalStats = async () => {
    try {
      // Total jobs count
      const { count: jobsCount } = await supabase
        .from('extraction_jobs')
        .select('*', { count: 'exact', head: true })

      setTotalJobs(jobsCount || 0)

      // Success, duplicate, and failure rates from completed jobs
      const { data: completedJobs } = await supabase
        .from('extraction_jobs')
        .select('successful_records, failed_records, duplicate_records, total_records')
        .eq('status', 'completed')

      if (completedJobs && completedJobs.length > 0) {
        const totals = completedJobs.reduce((acc, job) => ({
          total: acc.total + (job.total_records || 0),
          success: acc.success + (job.successful_records || 0),
          failed: acc.failed + (job.failed_records || 0),
          duplicates: acc.duplicates + (job.duplicate_records || 0)
        }), { total: 0, success: 0, failed: 0, duplicates: 0 })

        if (totals.total > 0) {
          setAvgSuccessRate(Math.round((totals.success / totals.total) * 100))
          setDuplicateRate(Math.round((totals.duplicates / totals.total) * 100))
          setFailureRate(Math.round((totals.failed / totals.total) * 100))
        }
      }
    } catch (error) {
      console.error('Error loading additional stats:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Jobs</CardTitle>
          <Clock className="w-4 h-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{totalJobs}</div>
          <p className="text-xs text-slate-600 mt-1">All extraction jobs</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
          <CheckCircle className="w-4 h-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{avgSuccessRate}%</div>
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            {avgSuccessRate >= 90 ? <ArrowUp className="w-3 h-3" /> : null} 
            {avgSuccessRate >= 90 ? 'Excellent' : 'Good'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Duplicate Rate</CardTitle>
          <Activity className="w-4 h-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{duplicateRate}%</div>
          <p className="text-xs text-slate-600 mt-1">Existing records</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Failure Rate</CardTitle>
          <TrendingUp className="w-4 h-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{failureRate}%</div>
          <p className="text-xs text-slate-600 mt-1">
            {failureRate < 10 ? 'Low failure rate' : 'Needs attention'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalVoters: 0,
    activeJobs: 0,
    todayExtractions: 0,
    successRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [dailyStats, setDailyStats] = useState<any[]>([])
  const [genderStats, setGenderStats] = useState<any[]>([])

  useEffect(() => {
    loadStats()
    loadChartData()
    
    // Refresh stats every 10 seconds
    const interval = setInterval(() => {
      loadStats()
      loadChartData()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      console.log('Loading stats from Supabase...')
      
      const { count: totalVoters, error: votersError } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)

      if (votersError) {
        console.error('Voters query error:', votersError)
      }

      const { count: activeJobs, error: jobsError } = await supabase
        .from('extraction_jobs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress'])

      if (jobsError) {
        console.error('Jobs query error:', jobsError)
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: todayExtractions, error: todayError } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      if (todayError) {
        console.error('Today extractions error:', todayError)
      }

      const { data: recentJobs, error: recentError } = await supabase
        .from('extraction_jobs')
        .select('successful_records, failed_records, total_records')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10)

      if (recentError) {
        console.error('Recent jobs error:', recentError)
      }

      let successRate = 0
      if (recentJobs && recentJobs.length > 0) {
        const totalProcessed = recentJobs.reduce((sum, job) => sum + (job.total_records || 0), 0)
        const totalSuccess = recentJobs.reduce((sum, job) => sum + (job.successful_records || 0), 0)
        successRate = totalProcessed > 0 ? (totalSuccess / totalProcessed) * 100 : 0
      }

      console.log('Stats loaded:', { totalVoters, activeJobs, todayExtractions, successRate })

      setStats({
        totalVoters: totalVoters || 0,
        activeJobs: activeJobs || 0,
        todayExtractions: todayExtractions || 0,
        successRate: Math.round(successRate)
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChartData = async () => {
    // Load last 7 days data
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const { count } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDay.toISOString())

      days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        extractions: count || 0
      })
    }
    setDailyStats(days)

    // Gender distribution - using count
    const { count: maleCount } = await supabase
      .from('voters')
      .select('*', { count: 'exact', head: true })
      .eq('gender', 'M')
      .eq('is_deleted', false)

    const { count: femaleCount } = await supabase
      .from('voters')
      .select('*', { count: 'exact', head: true })
      .eq('gender', 'F')
      .eq('is_deleted', false)

    setGenderStats([
      { name: 'Male', value: maleCount || 0, color: '#3b82f6' },
      { name: 'Female', value: femaleCount || 0, color: '#ec4899' }
    ])
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-600 mt-1">Welcome to ECI Data Extraction Portal</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Extractions Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Extractions (Last 7 Days)</CardTitle>
            <CardDescription>Voter records extracted per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="extractions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Status */}
        <SystemStatus />
      </div>

      {/* Additional Stats - Real Data */}
      <AdditionalStats />

      {/* Gender Distribution */}
      {genderStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Male vs Female voter breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genderStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
