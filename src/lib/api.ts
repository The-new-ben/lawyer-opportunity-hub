export async function handleResponse(res: Response): Promise<any> {
  if (res.status === 204) return undefined
  const contentType = res.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    const text = await res.clone().text()
    if (!text) return undefined
    return res.json()
  }
  const text = await res.text()
  return text || undefined
}

export async function apiRequest(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<any> {
  const res = await fetch(input, init)
  if (!res.ok) throw new Error(res.statusText)
  return handleResponse(res)
}

export const addCourtReminder = async (payload: {
  caseId: string
  remindAt: string
  notes?: string
}) => {
  return apiRequest("/api/court-reminder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
}

export const uploadCourtDocument = async (payload: {
  caseId: string
  documentUrl: string
  description?: string
}) => {
  return apiRequest("/api/court-document-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
}
