import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEFAULT_APPEARANCE } from '../domain/appearance'
import { useAppearanceStore } from '../state/appearanceStore'
import { AppearancePage } from './AppearancePage'

describe('AppearancePage', () => {
  beforeEach(() => {
    useAppearanceStore.setState(DEFAULT_APPEARANCE)
  })

  it('selects a theme and remembers it', async () => {
    const user = userEvent.setup()
    render(<AppearancePage />)

    expect(screen.getByRole('radio', { name: /Templo/ })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: /Acero/ }))

    expect(screen.getByRole('radio', { name: /Acero/ })).toBeChecked()
    expect(useAppearanceStore.getState().theme).toBe('acero')
    expect(localStorage.getItem('hitori.appearance')).toContain('"theme":"acero"')
  })

  it('lets the mode follow the system', async () => {
    const user = userEvent.setup()
    render(<AppearancePage />)

    await user.click(screen.getByRole('radio', { name: 'Según el sistema' }))

    expect(useAppearanceStore.getState().mode).toBe('system')
  })
})
