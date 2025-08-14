import { useState } from 'react';
import { uploadToSignedUrl } from '@/services/evidence';

interface EvidenceUploaderProps {
  signedUrl: string;
}

export function EvidenceUploader({ signedUrl }: EvidenceUploaderProps) {
  const [error, setError] = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadToSignedUrl(signedUrl, file);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleChange} />
      {error && <p>{error}</p>}
    </div>
  );
}

export default EvidenceUploader;
