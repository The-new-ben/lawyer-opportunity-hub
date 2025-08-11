import { LiveKitRoom, VideoConference } from '@livekit/components-react'
import '@livekit/components-styles'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

type Props = { inviteToken: string; hearingId: string; serverUrl: string; recording?: boolean }

export default function HearingRoom({ inviteToken, hearingId, serverUrl, recording }: Props) {
  const [liveKitToken, setLiveKitToken] = useState<string>()
  useEffect(() => {
    let active = true
    async function check() {
      const { data } = await supabase.functions.invoke('hearings', { body: { action: 'join', hearingId, token: inviteToken } })
      if (data?.token && active) setLiveKitToken(data.token)
    }
    check()
    const id = setInterval(check, 3000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [inviteToken, hearingId])
  if (!liveKitToken) return <div className="p-4 text-center">Waiting for host</div>
  return (
    <LiveKitRoom token={liveKitToken} serverUrl={serverUrl}>
      <VideoConference />
    </LiveKitRoom>
  )
}
