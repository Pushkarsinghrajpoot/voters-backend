'use client'

import { Download, FileSpreadsheet, FileText, Database } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Export Data</h1>
        <p className="text-slate-600 mt-1">Download voter data in various formats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              Excel Export
            </CardTitle>
            <CardDescription>Export to .xlsx format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              All Voters
            </Button>
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Today's Extractions
            </Button>
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Custom Selection
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              CSV Export
            </CardTitle>
            <CardDescription>Export to .csv format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              All Voters
            </Button>
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              By Ward
            </Button>
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              By AC
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Database Backup
            </CardTitle>
            <CardDescription>Full database export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              SQL Dump
            </Button>
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              JSON Export
            </Button>
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Incremental Backup
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Configure export settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Include Fields</label>
              <div className="space-y-1 text-sm">
                {['Basic Info', 'Relations', 'Location', 'Polling Details', 'Metadata'].map((field) => (
                  <label key={field} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    {field}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="space-y-2">
                <input type="date" className="w-full px-3 py-2 border rounded" />
                <input type="date" className="w-full px-3 py-2 border rounded" />
              </div>
            </div>
          </div>
          <Button className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export with Custom Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
