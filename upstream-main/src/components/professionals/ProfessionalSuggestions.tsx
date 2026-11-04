import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InviteManager } from '@/components/social/InviteManager'
import { supabase } from '@/integrations/supabase/client'

type Professional = {
  profile_id: string
  full_name: string
  role: string
  location: string | null
  specializations: string[]
  rating: number | null
}

interface ProfessionalSuggestionsProps {
  caseId: string
  jurisdiction: string
  specialization: string
  role: string
}

export function ProfessionalSuggestions({ caseId, jurisdiction, specialization, role }: ProfessionalSuggestionsProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Professional | null>(null)

  useEffect(() => {
    if (!jurisdiction || !specialization) return
    setLoading(true)
    supabase.functions.invoke('get-professionals', {
      body: { role, specialization, jurisdiction }
    }).then(({ data }) => {
      setProfessionals(data || [])
    }).finally(() => setLoading(false))
  }, [jurisdiction, specialization, role])

  const invite = async (pro: Professional) => {
    // Update case_drafts with party info
    console.log('Inviting professional:', pro)
    setSelected(pro)
  }

  if (loading) {
    return <p>Loading professionals...</p>
  }

  if (professionals.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Suggested Professionals</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {professionals.map(pro => (
          <Card key={pro.profile_id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{pro.full_name}</span>
                <Badge>{pro.role}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">{pro.location || 'Global'}</div>
              <div className="flex flex-wrap gap-1">
                {pro.specializations.map(s => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
              <Button size="sm" onClick={() => invite(pro)}>Invite</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invitation</DialogTitle>
          </DialogHeader>
          {selected && (
            <InviteManager caseId={caseId} caseTitle={`Case ${caseId}`} onInviteSent={() => setSelected(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
