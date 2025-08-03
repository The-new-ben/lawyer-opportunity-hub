import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const paymentsData = vi.hoisted(() => [{ id: '1', contract_id: 'c1', amount: 100, payment_type: 'deposit', status: 'pending', created_at: '', updated_at: '' }])

vi.mock('@/integrations/supabase/client', () => {
  const orderMock = vi.fn().mockResolvedValue({ data: paymentsData, error: null })
  const selectMock = vi.fn(() => ({ order: orderMock }))
  const fromMock = vi.fn(() => ({ select: selectMock, order: orderMock }))
  return { supabase: { from: fromMock } }
})

import { usePayments } from '@/hooks/usePayments'

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('usePayments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches payments', async () => {
    const { result } = renderHook(() => usePayments(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.payments).toEqual(paymentsData)
  })
})

