import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { SegmentedControl } from './SegmentedControl'

const OPTIONS = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Según el sistema' },
] as const

type Mode = (typeof OPTIONS)[number]['value']

function ControlledSegmented() {
  const [value, setValue] = useState<Mode>('dark')
  return <SegmentedControl label="Modo" options={OPTIONS} value={value} onChange={setValue} />
}

describe('SegmentedControl', () => {
  it('marks the selected option and selects another on click', async () => {
    const user = userEvent.setup()
    render(<ControlledSegmented />)

    expect(screen.getByRole('radio', { name: 'Oscuro' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: 'Claro' }))

    expect(screen.getByRole('radio', { name: 'Claro' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Oscuro' })).not.toBeChecked()
  })

  it('moves the selection with the arrow keys and wraps around', async () => {
    const user = userEvent.setup()
    render(<ControlledSegmented />)

    await user.click(screen.getByRole('radio', { name: 'Oscuro' }))
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Según el sistema' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Según el sistema' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Claro' })).toBeChecked()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: 'Según el sistema' })).toBeChecked()
  })

  it('keeps only the selected option in the tab order', () => {
    render(<ControlledSegmented />)

    const tabbable = screen.getAllByRole('radio').filter((radio) => radio.tabIndex === 0)
    expect(tabbable).toHaveLength(1)
    expect(tabbable[0]).toHaveAccessibleName('Oscuro')
  })
})
