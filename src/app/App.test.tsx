import { createMemoryHistory } from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { createAppRouter } from './router'

function renderAt(path: string) {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }))
  render(<App router={router} />)
  return router
}

describe('App', () => {
  it('opens Ahora from the root path', async () => {
    const router = renderAt('/')

    expect(await screen.findByRole('heading', { level: 1, name: 'Ahora' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/ahora')
  })

  it('marks the current view in the navigation and moves between views', async () => {
    const user = userEvent.setup()
    renderAt('/ahora')

    const [sidebar] = await screen.findAllByRole('navigation', { name: 'Vistas' })
    if (!sidebar) {
      throw new Error('Falta la navegación lateral')
    }
    const boardLink = within(sidebar).getByRole('link', { name: 'Tablero' })

    await user.click(boardLink)

    expect(await screen.findByRole('heading', { level: 1, name: 'Tablero' })).toBeInTheDocument()
    expect(boardLink).toHaveAttribute('aria-current', 'page')
  })

  it('applies the theme and mode to the document', async () => {
    renderAt('/ahora')

    await screen.findByRole('heading', { level: 1, name: 'Ahora' })
    expect(document.documentElement).toHaveAttribute('data-theme', 'templo')
    expect(document.documentElement).toHaveAttribute('data-mode', 'dark')
  })

  it('shows a way back for unknown paths', async () => {
    renderAt('/no-existe')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'No está aquí' }),
    ).toBeInTheDocument()
  })
})
