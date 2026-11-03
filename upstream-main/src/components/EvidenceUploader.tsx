import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'

interface Props {
  caseId: string
  fieldId: string
}

export function EvidenceUploader({ caseId, fieldId }: Props) {
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('')

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    const path = `${caseId}/${fieldId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('case-files').upload(path, file)
    if (error) return
    const { data: urlData } = supabase.storage.from('case-files').getPublicUrl(path)
    // Store evidence in case_drafts
    console.log('Evidence uploaded:', {
      file: file.name,
      url: urlData.publicUrl,
      hash
    })
    setFileName(file.name)
    setStatus('הועלה')
  }

  return (
    <div className="flex items-center gap-2">
      <Input type="file" onChange={handleChange} />
      {fileName && <span className="text-sm">{fileName} - {status}</span>}
    </div>
  )
}

export default EvidenceUploader

