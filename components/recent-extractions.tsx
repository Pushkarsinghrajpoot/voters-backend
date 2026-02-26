'use client'

import { useState, useEffect } from 'react'
import { FileSpreadsheet, Search, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase, type Voter } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

export function RecentExtractions() {
  const [voters, setVoters] = useState<Voter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadVoters()

    const channel = supabase
      .channel('voters-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'voters' }, () => {
        loadVoters()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadVoters = async () => {
    try {
      const { data, error } = await supabase
        .from('voters')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setVoters(data || [])
    } catch (error) {
      console.error('Error loading voters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadVoters()
      return
    }

    try {
      const { data, error } = await supabase
        .from('voters')
        .select('*')
        .or(`epic_number.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .eq('is_deleted', false)
        .limit(20)

      if (error) throw error
      setVoters(data || [])
    } catch (error) {
      console.error('Error searching voters:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Recent Extractions
        </CardTitle>
        <CardDescription>View and search recently extracted voter data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by EPIC number or name"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {voters.map((voter) => (
            <div key={voter.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{voter.full_name}</h4>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {voter.full_name_l1}
                    </p>
                    <p className="text-sm font-mono text-slate-700 mt-1">
                      EPIC: {voter.epic_number}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-slate-600">
                    {voter.age} years • {voter.gender}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {formatDate(voter.created_at)}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-600">District:</span>
                  <span className="ml-2">{voter.district_value}</span>
                </div>
                <div>
                  <span className="text-slate-600">AC:</span>
                  <span className="ml-2">{voter.ac_number} - {voter.asmbly_name}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-600">Part:</span>
                  <span className="ml-2">{voter.part_number} - {voter.part_name}</span>
                </div>
              </div>
            </div>
          ))}

          {voters.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500">
              <p>No voter records found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
