'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VotersTable } from '@/components/voters-table'
import { supabase } from '@/lib/supabase'

export default function VotersPage() {
  const [voters, setVoters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadVoters()
  }, [])

  const loadVoters = async () => {
    setLoading(true)
    try {
      const { data, error, count } = await supabase
        .from('voters')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      
      const formattedVoters = (data || []).map(v => ({
        epicNumber: v.epic_number,
        status: 'success',
        data: {
          fullName: v.full_name,
          fullNameL1: v.full_name_l1,
          age: v.age,
          gender: v.gender,
          relationType: v.relation_type,
          relativeFullName: v.relative_full_name,
          partNumber: v.part_number,
          partName: v.part_name,
          acNumber: v.ac_number,
          asmblyName: v.asmbly_name,
        }
      }))

      setVoters(formattedVoters)
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading voters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadVoters()
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('voters')
        .select('*')
        .or(`epic_number.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .eq('is_deleted', false)
        .limit(50)

      if (error) throw error

      const formattedVoters = (data || []).map(v => ({
        epicNumber: v.epic_number,
        status: 'success',
        data: {
          fullName: v.full_name,
          age: v.age,
          gender: v.gender,
          partNumber: v.part_number,
          partName: v.part_name,
        }
      }))

      setVoters(formattedVoters)
    } catch (error) {
      console.error('Error searching voters:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Voters Database</h1>
          <p className="text-slate-600 mt-1">Browse all extracted voter records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadVoters}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Voters ({totalCount.toLocaleString()})</span>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by EPIC or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 w-80"
                />
              </div>
              <Button size="sm" onClick={handleSearch}>
                Search
              </Button>
              <Button size="sm" variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-400" />
              <p className="text-slate-600 mt-2">Loading voters...</p>
            </div>
          ) : voters.length > 0 ? (
            <VotersTable voters={voters} />
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>No voters found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
