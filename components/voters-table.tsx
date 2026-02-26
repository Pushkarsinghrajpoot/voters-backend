'use client'

import { User, Calendar, MapPin, Users as UsersIcon } from 'lucide-react'

interface VotersTableProps {
  voters: any[]
}

export function VotersTable({ voters }: VotersTableProps) {
  if (voters.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-300">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">EPIC</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Age</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Gender</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Relation</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Part</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">AC</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
          </tr>
        </thead>
        <tbody>
          {voters.map((voter, index) => (
            <tr 
              key={index}
              className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                voter.status === 'loading' ? 'animate-pulse bg-blue-50' :
                voter.status === 'duplicate' ? 'bg-yellow-50/50' :
                voter.status === 'failed' ? 'bg-red-50/50' :
                'bg-green-50/30'
              }`}
            >
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-slate-900">{voter.epicNumber}</span>
              </td>
              <td className="px-4 py-3">
                {voter.status === 'loading' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                    <span className="text-sm text-slate-600">Extracting...</span>
                  </div>
                ) : voter.data ? (
                  <div>
                    <p className="font-medium text-sm text-slate-900">{voter.data.fullName}</p>
                    {voter.data.fullNameL1 && (
                      <p className="text-xs text-slate-600">{voter.data.fullNameL1}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-red-600">Failed</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-slate-700">{voter.data?.age || '-'}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-slate-700">{voter.data?.gender || '-'}</span>
              </td>
              <td className="px-4 py-3">
                {voter.data?.relationType && voter.data?.relativeFullName ? (
                  <div className="text-xs">
                    <span className="text-slate-600">{voter.data.relationType} of</span>
                    <p className="text-slate-900 font-medium">{voter.data.relativeFullName}</p>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                {voter.data?.partNumber ? (
                  <div className="text-xs">
                    <p className="font-mono text-slate-900">{voter.data.partNumber}</p>
                    <p className="text-slate-600">{voter.data.partName}</p>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                {voter.data?.acNumber ? (
                  <div className="text-xs">
                    <p className="font-mono text-slate-900">{voter.data.acNumber}</p>
                    <p className="text-slate-600">{voter.data.asmblyName}</p>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  voter.status === 'loading' ? 'bg-blue-200 text-blue-800' :
                  voter.status === 'success' ? 'bg-green-200 text-green-800' :
                  voter.status === 'duplicate' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {voter.status === 'loading' ? 'Loading' :
                   voter.status === 'success' ? 'Success' :
                   voter.status === 'duplicate' ? 'Duplicate' :
                   'Failed'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
