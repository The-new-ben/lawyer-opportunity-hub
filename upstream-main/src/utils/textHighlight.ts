export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function highlightText(text: string, query: string): string {
  const escapedText = escapeHtml(text)
  if (!query) return escapedText
  const pattern = new RegExp(`(${escapeRegExp(query)})`, "gi")
  return escapedText.replace(pattern, "<mark>$1</mark>")
}
