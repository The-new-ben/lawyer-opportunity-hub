import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile', () => {
  let listener: ((e: MediaQueryListEvent) => void) | undefined

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: window.innerWidth < 768,
        media: query,
        addEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => {
          listener = l
        },
        removeEventListener: vi.fn(),
      })),
    })
  })

  it('responds to resize events', () => {
    window.innerWidth = 500
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
    window.innerWidth = 1000
    act(() => listener?.({ matches: false } as MediaQueryListEvent))
    expect(result.current).toBe(false)
  })
})
