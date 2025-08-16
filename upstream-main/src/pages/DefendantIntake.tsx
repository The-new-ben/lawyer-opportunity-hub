import { useEffect, useState } from 'react'
import SmartIntakePortal from '@/components/court/SmartIntakePortal'
import { supabase } from '@/integrations/supabase/client'

const DefendantIntake = () => {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      if (token) {
        const { data } = await supabase.from('cases').select('id,title,legal_category,notes').eq('invite_token', token).single()
        if (data) {
          const draft = {
            title: data.title,
            summary: data.notes || '',
            jurisdiction: '',
            category: data.legal_category,
            goal: '',
            parties: '',
            evidence: '',
            timeline: ''
          }
          localStorage.setItem('caseDraft', JSON.stringify(draft))
        }
      }
      setReady(true)
    }
    load()
  }, [])
  if (!ready) return null
  return <SmartIntakePortal />
}
export default DefendantIntake
