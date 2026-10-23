import { render, screen } from '@testing-library/react'
import { WipMeter } from './WipMeter'

describe('WipMeter', () => {
  it('describes the usage against the limit', () => {
    render(<WipMeter used={2} limit={3} />)

    expect(screen.getByRole('img', { name: '2 de 3 en curso' })).toBeInTheDocument()
  })

  it('adds a slot for every task over the limit', () => {
    render(<WipMeter used={4} limit={3} />)

    const meter = screen.getByRole('img', { name: '4 de 3 en curso' })
    expect(meter.querySelectorAll('i')).toHaveLength(4)
  })
})
