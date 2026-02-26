'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Upload, 
  Search, 
  Clock, 
  FileText, 
  Settings, 
  BarChart3, 
  Database,
  Users,
  Download,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

const menuItems = [
  { 
    title: 'Dashboard', 
    icon: Home, 
    href: '/',
    description: 'Overview & Statistics'
  },
  { 
    title: 'Upload Data', 
    icon: Upload, 
    href: '/upload',
    description: 'Bulk extraction from Excel'
  },
  { 
    title: 'Search', 
    icon: Search, 
    href: '/search',
    description: 'Find voters by EPIC'
  },
  { 
    title: 'Active Jobs', 
    icon: Clock, 
    href: '/jobs',
    description: 'Monitor extractions'
  },
  { 
    title: 'Voters Database', 
    icon: Database, 
    href: '/voters',
    description: 'Browse all records'
  },
  { 
    title: 'Analytics', 
    icon: BarChart3, 
    href: '/analytics',
    description: 'Charts & insights'
  },
  { 
    title: 'Reports', 
    icon: FileText, 
    href: '/reports',
    description: 'Generate reports'
  },
  { 
    title: 'Export', 
    icon: Download, 
    href: '/export',
    description: 'Download data'
  },
  { 
    title: 'Logs', 
    icon: FileSpreadsheet, 
    href: '/logs',
    description: 'Extraction history'
  },
  { 
    title: 'Settings', 
    icon: Settings, 
    href: '/settings',
    description: 'Configuration'
  },
]

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div 
      className={cn(
        "h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                ECI Portal
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Data Extraction</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                  title={collapsed ? item.title : ''}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive && "text-white"
                  )} />
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 group-hover:text-slate-300 truncate">
                        {item.description}
                      </p>
                    </div>
                  )}
                  {isActive && !collapsed && (
                    <div className="w-1 h-8 bg-white rounded-full" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        {!collapsed ? (
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">System Online</span>
            </div>
            <p className="text-xs text-slate-400">
              Version 2.0.0
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <Activity className="w-5 h-5 text-green-400" />
          </div>
        )}
      </div>
    </div>
  )
}
