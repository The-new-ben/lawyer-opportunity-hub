import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import HearingRoom from '@/components/court/HearingRoom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HearingJoin() {
  const [params] = useSearchParams();
  const [hearingId, setHearingId] = useState(params.get('hearingId') || '');
  const [inviteToken, setInviteToken] = useState(params.get('token') || '');
  const [serverUrl, setServerUrl] = useState(params.get('serverUrl') || '');
  const [recording, setRecording] = useState(false);

  const canJoin = hearingId && inviteToken && serverUrl;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {!canJoin ? (
          <Card>
            <CardHeader>
              <CardTitle>Join Hearing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Hearing ID" value={hearingId} onChange={e => setHearingId(e.target.value)} />
              <Input placeholder="Invite Token" value={inviteToken} onChange={e => setInviteToken(e.target.value)} />
              <Input placeholder="LiveKit Server URL (wss://...)" value={serverUrl} onChange={e => setServerUrl(e.target.value)} />
              <Button disabled={!canJoin} onClick={() => { /* rely on state to re-render */ }}>Start</Button>
              <p className="text-sm text-muted-foreground">Tip: You can also open with URL parameters: /hearing/join?hearingId=...&token=...&serverUrl=wss://...</p>
            </CardContent>
          </Card>
        ) : (
          <HearingRoom inviteToken={inviteToken} hearingId={hearingId} serverUrl={serverUrl} recording={recording} />
        )}
      </div>
    </div>
  );
}
