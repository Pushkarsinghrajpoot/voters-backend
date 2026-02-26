'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, User, MapPin, Users, Calendar, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface VoterData {
  epicNumber: string
  status: 'loading' | 'success' | 'failed' | 'duplicate'
  data?: any
  timestamp?: Date
}

interface VoterCarouselProps {
  voters: VoterData[]
}

export function VoterCarousel({ voters }: VoterCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    console.log('Carousel voters updated:', voters.length, 'voters')
  }, [voters])

  useEffect(() => {
    if (!autoPlay || voters.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % voters.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [autoPlay, voters.length])

  const goToNext = () => {
    setAutoPlay(false)
    setCurrentIndex((prev) => (prev + 1) % voters.length)
  }

  const goToPrevious = () => {
    setAutoPlay(false)
    setCurrentIndex((prev) => (prev - 1 + voters.length) % voters.length)
  }

  if (voters.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">Waiting for extraction results...</p>
      </div>
    )
  }

  const currentVoter = voters[currentIndex]
  
  console.log('Rendering voter card:', currentIndex, currentVoter)

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / voters.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-600 font-medium">
          {currentIndex + 1} / {voters.length}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {voters.map((voter, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <VoterCard voter={voter} />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            className="ml-2 bg-white/90 hover:bg-white shadow-lg"
            disabled={voters.length <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="mr-2 bg-white/90 hover:bg-white shadow-lg"
            disabled={voters.length <= 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center gap-1.5 mt-3">
        {voters.slice(0, Math.min(10, voters.length)).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setAutoPlay(false)
              setCurrentIndex(index)
            }}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex 
                ? 'w-6 bg-blue-600' 
                : 'w-1.5 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
        {voters.length > 10 && (
          <span className="text-xs text-slate-500">+{voters.length - 10}</span>
        )}
      </div>
    </div>
  )
}

function VoterCard({ voter }: { voter: VoterData }) {
  console.log('Rendering VoterCard:', voter.epicNumber, voter.status, voter.data)
  
  if (voter.status === 'loading') {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <div>
            <p className="text-lg font-semibold text-slate-900">Extracting Data...</p>
            <p className="text-sm text-slate-600 font-mono mt-1">{voter.epicNumber}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (voter.status === 'failed') {
    return (
      <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
        <div className="text-center py-4">
          <p className="text-lg font-semibold text-red-900">Extraction Failed</p>
          <p className="text-sm text-red-600 font-mono mt-1">{voter.epicNumber}</p>
          <p className="text-xs text-red-500 mt-2">Unable to fetch data from ECI portal</p>
        </div>
      </Card>
    )
  }

  if (!voter.data) return null

  const data = voter.data

  return (
    <Card className={`p-6 ${
      voter.status === 'duplicate' 
        ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
        : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
    }`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              voter.status === 'duplicate' ? 'bg-yellow-200' : 'bg-green-200'
            }`}>
              <User className={`w-6 h-6 ${
                voter.status === 'duplicate' ? 'text-yellow-700' : 'text-green-700'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{data.fullName}</h3>
              {data.fullNameL1 && (
                <p className="text-sm text-slate-600">{data.fullNameL1}</p>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            voter.status === 'duplicate' 
              ? 'bg-yellow-200 text-yellow-800'
              : 'bg-green-200 text-green-800'
          }`}>
            {voter.status === 'duplicate' ? 'Duplicate' : 'New'}
          </span>
        </div>

        {/* EPIC Number */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">EPIC Number</p>
          <p className="font-mono font-semibold text-slate-900">{voter.epicNumber}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 text-center">
            <Calendar className="w-4 h-4 text-slate-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Age</p>
            <p className="font-semibold text-slate-900">{data.age}</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <Users className="w-4 h-4 text-slate-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Gender</p>
            <p className="font-semibold text-slate-900">{data.gender}</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <MapPin className="w-4 h-4 text-slate-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Part</p>
            <p className="font-semibold text-slate-900">{data.partNumber}</p>
          </div>
        </div>

        {/* Relation */}
        {data.relationType && data.relativeFullName && (
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">{data.relationType}</p>
            <p className="font-medium text-slate-900">{data.relativeFullName}</p>
            {data.relativeFullNameL1 && (
              <p className="text-xs text-slate-600 mt-0.5">{data.relativeFullNameL1}</p>
            )}
          </div>
        )}

        {/* Location */}
        <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-2">
          <div>
            <p className="text-xs text-slate-500">Assembly Constituency</p>
            <p className="font-medium text-slate-900 text-sm">{data.acNumber} - {data.asmblyName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Part Name</p>
            <p className="font-medium text-slate-900 text-sm">{data.partName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">District</p>
            <p className="font-medium text-slate-900 text-sm">{data.districtValue}</p>
          </div>
        </div>

        {/* Polling Station */}
        {data.psbuildingName && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-600 font-medium mb-1">Polling Station</p>
            <p className="text-sm text-slate-900">{data.psbuildingName}</p>
            {data.psRoomDetails && (
              <p className="text-xs text-slate-600 mt-1">{data.psRoomDetails}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
