'use client'

import { useState, useEffect } from 'react'
import { Upload, Search, Database, TrendingUp, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExcelUploader } from './excel-uploader'
import { SingleEpicExtractor } from './single-epic-extractor'
import { JobsMonitor } from './jobs-monitor'
import { RecentExtractions } from './recent-extractions'
import { StatsCards } from './stats-cards'
import { SystemStatus } from './system-status'
import { supabase } from '@/lib/supabase'

export function ExtractionDashboard() {
  const [activeTab, setActiveTab] = useState<'upload' | 'single' | 'jobs' | 'recent'>('upload')
  const [stats, setStats] = useState({
    totalVoters: 0,
    activeJobs: 0,
    todayExtractions: 0,
    successRate: 0
  })

  useEffect(() => {
    loadStats()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('extraction-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voters' }, () => {
        loadStats()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'extraction_jobs' }, () => {
        loadStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadStats = async () => {
    try {
      // Total voters
      const { count: totalVoters } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)

      // Active jobs
      const { count: activeJobs } = await supabase
        .from('extraction_jobs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress'])

      // Today's extractions
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: todayExtractions } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Success rate (from recent jobs)
      const { data: recentJobs } = await supabase
        .from('extraction_jobs')
        .select('successful_records, failed_records, total_records')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10)

      let successRate = 0
      if (recentJobs && recentJobs.length > 0) {
        const totalProcessed = recentJobs.reduce((sum, job) => sum + (job.total_records || 0), 0)
        const totalSuccess = recentJobs.reduce((sum, job) => sum + (job.successful_records || 0), 0)
        successRate = totalProcessed > 0 ? (totalSuccess / totalProcessed) * 100 : 0
      }

      setStats({
        totalVoters: totalVoters || 0,
        activeJobs: activeJobs || 0,
        todayExtractions: todayExtractions || 0,
        successRate: Math.round(successRate)
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ECI Data Extraction Portal
          </h1>
          <p className="text-slate-600 mt-1">Extract and manage voter data from Electoral Commission of India</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics Dashboard
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 inline-block mr-2" />
              Excel Upload
            </button>
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'single'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4 inline-block mr-2" />
              Single EPIC
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'jobs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4 inline-block mr-2" />
              Active Jobs
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'recent'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 inline-block mr-2" />
              Recent Extractions
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'upload' && <ExcelUploader onComplete={loadStats} />}
            {activeTab === 'single' && <SingleEpicExtractor onComplete={loadStats} />}
            {activeTab === 'jobs' && <JobsMonitor />}
            {activeTab === 'recent' && <RecentExtractions />}
          </div>
        </div>

        {/* Right Panel - Info */}
        <div className="space-y-6">
          {/* System Status with Real Health Check */}
          <SystemStatus />

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-800">
              <div>
                <strong>1. Upload Excel/CSV</strong>
                <p className="text-blue-700">Upload files containing EPIC numbers. Supports nested folders.</p>
              </div>
              <div>
                <strong>2. Real-time Processing</strong>
                <p className="text-blue-700">Watch live progress with captcha solving and API calls.</p>
              </div>
              <div>
                <strong>3. Duplicate Detection</strong>
                <p className="text-blue-700">Automatically warns if voter data already exists.</p>
              </div>
              <div>
                <strong>4. Error Handling</strong>
                <p className="text-blue-700">Failed extractions are logged with retry attempts.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
