'use client'

import { Settings as SettingsIcon, Database, Globe, Bell, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Configure system preferences and options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Settings
            </CardTitle>
            <CardDescription>Supabase connection configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Supabase URL</label>
              <Input 
                type="text" 
                value={process.env.NEXT_PUBLIC_SUPABASE_URL}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Connection Status</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Connected</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">Test Connection</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              API Settings
            </CardTitle>
            <CardDescription>Backend API configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Endpoint</label>
              <Input 
                type="text" 
                value={process.env.NEXT_PUBLIC_API_URL}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Retry Attempts</label>
              <Input type="number" defaultValue={5} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Timeout (seconds)</label>
              <Input type="number" defaultValue={30} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              'Extraction completed',
              'Job failed',
              'Duplicate detected',
              'Daily summary',
              'System alerts'
            ].map((notif) => (
              <label key={notif} className="flex items-center justify-between">
                <span className="text-sm">{notif}</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Access control and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Session Timeout (minutes)</label>
              <Input type="number" defaultValue={30} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Two-Factor Authentication</label>
              <div className="mt-2">
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
            </div>
            <Button variant="destructive" className="w-full">Clear Cache & Logout</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Version and build details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Version</p>
              <p className="font-semibold">2.0.0</p>
            </div>
            <div>
              <p className="text-slate-600">Build</p>
              <p className="font-semibold">2026.02.21</p>
            </div>
            <div>
              <p className="text-slate-600">Environment</p>
              <p className="font-semibold">Production</p>
            </div>
            <div>
              <p className="text-slate-600">License</p>
              <p className="font-semibold">Enterprise</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
