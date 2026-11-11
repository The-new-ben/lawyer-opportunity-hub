import { InlineWidget } from 'react-calendly'

export function CalendlyEmbed() {
  const url = import.meta.env.VITE_CALENDLY_URL
  if (!url) return null
  return <InlineWidget url={url} />
}
