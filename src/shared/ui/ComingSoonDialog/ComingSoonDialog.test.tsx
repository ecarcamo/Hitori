import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComingSoonDialog } from './ComingSoonDialog'

describe('ComingSoonDialog', () => {
  it('explains what is coming and closes with its action', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <ComingSoonDialog
        open
        title="Entrar con Google llega pronto"
        description="Por ahora entra con tu correo."
        actionLabel="Usar mi correo"
        onClose={onClose}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Entrar con Google llega pronto' })
    expect(dialog).toHaveAccessibleDescription('Por ahora entra con tu correo.')

    await user.click(screen.getByRole('button', { name: 'Usar mi correo' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('stays hidden while closed', () => {
    render(<ComingSoonDialog open={false} title="Pronto" description="Pronto" onClose={vi.fn()} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
