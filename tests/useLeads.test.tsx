import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const leadsData = vi.hoisted(() => [{ id: '1', status: 'new', customer_name: 'Test', customer_phone: '123', urgency_level: 'high', created_at: '', updated_at: '', customer_email: '', case_description: '', legal_category: '', visibility_level: '', source: '', preferred_location: '', estimated_budget: null }])
var insertMock: any

vi.mock('@/integrations/supabase/client', () => {
  const orderMock = vi.fn().mockResolvedValue({ data: leadsData, error: null })
  const selectMock = vi.fn(() => ({ order: orderMock }))
  const singleMock = vi.fn().mockResolvedValue({ data: leadsData[0], error: null })
  const selectAfterInsertMock = vi.fn(() => ({ single: singleMock }))
  insertMock = vi.fn(() => ({ select: selectAfterInsertMock }))
  const fromMock = vi.fn(() => ({ select: selectMock, order: orderMock, insert: insertMock }))
  const invokeMock = vi.fn().mockResolvedValue({ data: null, error: null })
  return { supabase: { from: fromMock, functions: { invoke: invokeMock } } }
})
vi.mock('@/lib/aiService', () => ({ classifyLead: vi.fn().mockResolvedValue('{}') }))
vi.mock('@/lib/whatsappService', () => ({ sendWhatsAppTextMessage: vi.fn().mockResolvedValue(undefined) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { useLeads } from '@/hooks/useLeads'

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useLeads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches leads', async () => {
    const { result } = renderHook(() => useLeads(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.leads).toEqual(leadsData)
  })

  it('adds a lead', async () => {
    const { result } = renderHook(() => useLeads(), { wrapper })
    await act(async () => {
      await result.current.addLead.mutateAsync({ customer_name: 'New', customer_phone: '555' })
    })
    expect(insertMock).toHaveBeenCalled()
  })
})

