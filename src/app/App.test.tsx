import { render, screen } from '@testing-library/react'
import { App } from '@/app/App'

describe('App', () => {
  it('shows the brand name and tagline', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Hitori' })).toBeInTheDocument()
    expect(screen.getByText('Tu tablero, a tu ritmo.')).toBeInTheDocument()
  })
})
