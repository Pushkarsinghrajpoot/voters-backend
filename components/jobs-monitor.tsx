'use client'

import { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800'
    case 'in_progress': return 'bg-blue-100 text-blue-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'failed': return 'bg-red-100 text-red-800'
    default: return 'bg-slate-100 text-slate-800'
  }
}

export function JobsMonitor() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadJobs()

    // Set up polling every 3 seconds for real-time updates
    const interval = setInterval(loadJobs, 3000)

    // Also subscribe to real-time changes
    const subscription = supabase
      .channel('extraction_jobs_monitor')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'extraction_jobs' },
        (payload) => {
          console.log('Job changed:', payload)
          loadJobs()
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [])

  const loadJobs = async () => {
    try {
      setError(null)
      console.log('Loading jobs from database...')
      
      // Load both active and recent completed jobs
      const { data: activeJobs, error: activeError } = await supabase
        .from('extraction_jobs')
        .select('*')
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false })

      const { data: recentJobs, error: recentError } = await supabase
        .from('extraction_jobs')
        .select('*')
        .in('status', ['completed', 'failed'])
        .order('completed_at', { ascending: false })
        .limit(5)

      if (activeError) {
        console.error('Error loading active jobs:', activeError)
        setError('Failed to load active jobs')
      }
      
      if (recentError) {
        console.error('Error loading recent jobs:', recentError)
      }

      const allJobs = [...(activeJobs || []), ...(recentJobs || [])]
      console.log('Loaded jobs:', allJobs.length)
      setJobs(allJobs)
      setLoading(false)
    } catch (err) {
      console.error('Error in loadJobs:', err)
      setError('Failed to connect to database')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Jobs Monitor
            </div>
            <Button size="sm" variant="outline" onClick={loadJobs}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            <p className="ml-3 text-slate-600">Loading jobs...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Jobs
            </div>
            <Button size="sm" variant="outline" onClick={loadJobs}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeJobs = jobs.filter(j => j.status === 'pending' || j.status === 'in_progress')
  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed')

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Jobs Monitor
            </div>
            <Button size="sm" variant="outline" onClick={loadJobs}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-500 py-8">No extraction jobs found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Jobs Monitor
        </CardTitle>
        <CardDescription>Monitor real-time extraction progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeJobs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Active Jobs ({activeJobs.length})
            </h3>
            <div className="space-y-4">
              {activeJobs.map((job) => {
                const progress = job.total_records > 0 
                  ? (job.processed_records / job.total_records) * 100 
                  : 0

                return (
                  <div key={job.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{job.job_name}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {formatDate(job.created_at)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(job.status)}`}>
                        {job.status === 'in_progress' && <Loader2 className="w-3 h-3 inline-block animate-spin mr-1" />}
                        {job.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium">
                    {job.processed_records} / {job.total_records} ({progress.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>{job.successful_records} success</span>
                </div>
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-4 h-4" />
                  <span>{job.failed_records} failed</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-700">
                  <Clock className="w-4 h-4" />
                  <span>{job.duplicate_records} duplicates</span>
                </div>
              </div>
            </div>
          )
              })}
            </div>
          </div>
        )}
        
        {completedJobs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Completed ({completedJobs.length})</h3>
            <div className="space-y-3">
              {completedJobs.map((job) => (
                <div key={job.id} className="p-3 bg-slate-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">Job #{job.id?.substring(0, 8)}</span>
                    <div className="flex items-center gap-2">
                      {job.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        job.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">
                    {job.successful_records || 0} success, {job.failed_records || 0} failed
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatDate(job.completed_at || job.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
