'use client'

import { SingleEpicExtractor } from '@/components/single-epic-extractor'
import { RecentExtractions } from '@/components/recent-extractions'

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Search Voters</h1>
        <p className="text-slate-600 mt-1">Find and extract voter data by EPIC number</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SingleEpicExtractor onComplete={() => {}} />
        <RecentExtractions />
      </div>
    </div>
  )
}
