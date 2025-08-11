import { render, fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'

vi.mock('next-themes', () => ({ useTheme: vi.fn() }))

describe('ThemeToggle', () => {
  it('switches theme', () => {
    const setTheme = vi.fn()
    vi.mocked(useTheme).mockReturnValue({ theme: 'light', setTheme })
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
