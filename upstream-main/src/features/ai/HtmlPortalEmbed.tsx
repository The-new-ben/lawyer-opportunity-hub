// src/features/ai/HtmlPortalEmbed.tsx
import React from 'react';

export default function HtmlPortalEmbed() {
  return (
    <iframe
      title="Legacy GPT-OSS Portal"
      src="/legacy-portal.html"
      className="w-full rounded border"
      style={{ height: '720px' }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
