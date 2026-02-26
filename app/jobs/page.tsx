'use client'

import { JobsMonitor } from '@/components/jobs-monitor'

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Active Jobs</h1>
        <p className="text-slate-600 mt-1">Monitor ongoing extraction jobs in real-time</p>
      </div>

      <JobsMonitor />
    </div>
  )
}
