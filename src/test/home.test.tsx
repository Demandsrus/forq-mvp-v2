import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the FORQ title', () => {
    render(<Home />)
    
    const title = screen.getByRole('heading', { name: /forq/i })
    expect(title).toBeInTheDocument()
  })

  it('renders the start journey button', () => {
    render(<Home />)
    
    const button = screen.getByRole('link', { name: /start your food journey/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('href', '/quiz')
  })

  it('renders navigation links', () => {
    render(<Home />)
    
    const chatLink = screen.getByRole('link', { name: /chat with ai/i })
    const accountLink = screen.getByRole('link', { name: /account/i })
    
    expect(chatLink).toBeInTheDocument()
    expect(accountLink).toBeInTheDocument()
  })
})
