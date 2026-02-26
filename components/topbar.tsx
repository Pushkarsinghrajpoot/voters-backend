'use client'

import { useState, useEffect } from 'react'
import { Bell, User, Search, Menu, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function TopBar() {
  const [notifications, setNotifications] = useState(3)
  const [darkMode, setDarkMode] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Quick search by EPIC number or name..."
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">
        {/* Current Time */}
        <div className="text-sm text-slate-600 hidden md:block" suppressHydrationWarning>
          {time.toLocaleTimeString()}
        </div>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDarkMode(!darkMode)}
          className="text-slate-600"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative text-slate-600">
          <Bell className="w-4 h-4" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notifications}
            </span>
          )}
        </Button>

        {/* User Profile */}
        <Button variant="ghost" size="sm" className="gap-2 text-slate-700">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </Button>
      </div>
    </div>
  )
}
