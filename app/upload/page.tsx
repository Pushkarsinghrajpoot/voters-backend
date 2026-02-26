'use client'

import { ExcelUploader } from '@/components/excel-uploader'

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Upload & Extract</h1>
        <p className="text-slate-600 mt-1">Upload Excel/CSV files or folders for bulk EPIC extraction</p>
      </div>

      <ExcelUploader onComplete={() => {}} />
    </div>
  )
}
