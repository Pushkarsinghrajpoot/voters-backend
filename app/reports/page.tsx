'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      // Get today's extractions
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: todayCount } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Get this week's extractions
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { count: weekCount } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      // Get gender counts
      const { count: maleCount } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .eq('gender', 'M')

      const { count: femaleCount } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .eq('gender', 'F')

      // Get age stats
      const { data: agesData } = await supabase
        .from('voters')
        .select('age')
        .not('age', 'is', null)

      setReports([
        { 
          title: 'Daily Extraction Report', 
          description: `${todayCount || 0} voters extracted today`,
          date: new Date().toLocaleDateString(),
          status: 'ready',
          count: todayCount
        },
        { 
          title: 'Weekly Summary', 
          description: `${weekCount || 0} voters extracted this week`,
          date: 'Last 7 days',
          status: 'ready',
          count: weekCount
        },
        { 
          title: 'Gender Distribution', 
          description: `Male: ${maleCount || 0}, Female: ${femaleCount || 0}`,
          date: new Date().toLocaleDateString(),
          status: 'ready',
          count: (maleCount || 0) + (femaleCount || 0)
        },
        { 
          title: 'Age Group Analysis', 
          description: `${agesData?.length || 0} voters with age data`,
          date: new Date().toLocaleDateString(),
          status: 'ready',
          count: agesData?.length || 0
        },
      ])
    } catch (error) {
      console.error('Error loading reports:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-1">Generate and download data reports</p>
        </div>
        <Button className="gap-2">
          <FileText className="w-4 h-4" />
          Create Custom Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {report.title}
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {report.date}
                </div>
                <div className="flex gap-2">
                  {report.status === 'ready' ? (
                    <>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Excel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Generating...
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Pre-configured report formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Ward-wise Summary', 'Family Trees', 'Duplicate Records', 'Failed Extractions', 'Quality Audit', 'Custom Query'].map((template, index) => (
              <Button key={index} variant="outline" className="h-20 flex flex-col gap-1">
                <FileText className="w-5 h-5" />
                <span className="text-sm">{template}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
