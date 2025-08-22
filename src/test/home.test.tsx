import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the FORQ title', () => {
    render(<Home />)
    
    const title = screen.getByRole('heading', { name: /forq/i })
    expect(title).toBeInTheDocument()
  })

  it('renders the get started button', () => {
    render(<Home />)

    const button = screen.getByRole('link', { name: /get started/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('href', '/auth/signup')
  })

  it('renders navigation links', () => {
    render(<Home />)

    const discoverLink = screen.getByRole('link', { name: /discover restaurants/i })
    const signInLink = screen.getByRole('link', { name: /sign in/i })

    expect(discoverLink).toBeInTheDocument()
    expect(discoverLink).toHaveAttribute('href', '/discover')
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/auth/signin')
  })
})
