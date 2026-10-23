import { createMemoryHistory } from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AuthSession } from '@/features/auth'
import type { Profile } from '@/features/profile'
import {
  createFakeAuthRepository,
  createFakeCategoryRepository,
  createFakeProfileRepository,
  ONBOARDED_PROFILE,
  TEST_SESSION,
} from '@/test/fakes'
import { App } from './App'

interface RenderOptions {
  session?: AuthSession | null
  profile?: Profile
}

function renderAt(
  path: string,
  { session = TEST_SESSION, profile = ONBOARDED_PROFILE }: RenderOptions = {},
) {
  const history = createMemoryHistory({ initialEntries: [path] })
  const auth = createFakeAuthRepository(session)
  const profiles = createFakeProfileRepository(profile)
  const categories = createFakeCategoryRepository()
  render(<App dependencies={{ auth, profiles, categories }} history={history} />)
  return { history, auth, profiles }
}

describe('App', () => {
  it('sends visitors without a session to sign in and remembers where they were going', async () => {
    const { history } = renderAt('/tablero', { session: null })

    expect(await screen.findByRole('heading', { level: 1, name: 'Hitori' })).toBeInTheDocument()
    expect(history.location.pathname).toBe('/entrar')
    expect(history.location.search).toContain('redirect=%2Ftablero')
  })

  it('opens Ahora from the root path when signed in', async () => {
    const { history } = renderAt('/')

    expect(await screen.findByRole('heading', { level: 1, name: 'Ahora' })).toBeInTheDocument()
    expect(history.location.pathname).toBe('/ahora')
  })

  it('asks new users to finish the onboarding first', async () => {
    const { history } = renderAt('/ahora', { profile: { ...ONBOARDED_PROFILE, onboardedAt: null } })

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Te damos la bienvenida' }),
    ).toBeInTheDocument()
    expect(history.location.pathname).toBe('/bienvenida')
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

  it('signs out from the account page', async () => {
    const user = userEvent.setup()
    const { history, auth } = renderAt('/ajustes/cuenta')

    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

    expect(auth.signOut).toHaveBeenCalled()
    expect(await screen.findByRole('heading', { level: 1, name: 'Hitori' })).toBeInTheDocument()
    expect(history.location.pathname).toBe('/entrar')
  })

  it('tells that creating tasks is coming soon', async () => {
    const user = userEvent.setup()
    renderAt('/ahora')

    const [newTaskButton] = await screen.findAllByRole('button', { name: 'Nueva tarea' })
    if (!newTaskButton) {
      throw new Error('Falta el botón de nueva tarea')
    }
    await user.click(newTaskButton)

    expect(screen.getByRole('dialog', { name: 'Crear tareas llega pronto' })).toBeInTheDocument()
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
