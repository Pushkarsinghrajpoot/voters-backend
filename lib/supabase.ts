import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Voter = {
  id: string
  epic_number: string
  full_name: string
  full_name_l1: string
  age: number
  gender: string
  part_number: string
  part_name: string
  ac_number: number
  asmbly_name: string
  district_value: string
  state_name: string
  relation_type: string
  relation_name: string
  ps_building_name: string
  created_at: string
  is_deleted: boolean
  raw_response?: any
}

export type ExtractionJob = {
  id: string
  job_name: string
  job_type: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  file_name?: string
  total_records: number
  processed_records: number
  successful_records: number
  failed_records: number
  duplicate_records: number
  started_at?: string
  completed_at?: string
  created_at: string
  metadata?: any
}

export type ExtractionLog = {
  id: string
  job_id: string
  epic_number: string
  status: 'success' | 'failed' | 'duplicate' | 'skipped'
  attempts: number
  error_message?: string
  voter_id?: string
  created_at: string
}
