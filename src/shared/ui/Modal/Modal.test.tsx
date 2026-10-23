import { fireEvent, render, screen } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  it('ignores a late close event when the dialog was opened again', () => {
    const onClose = vi.fn()
    render(
      <Modal open title="Nueva tarea" onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).toHaveAttribute('open')

    fireEvent(dialog, new Event('close'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('reports a close when the dialog really closed', () => {
    const onClose = vi.fn()
    render(
      <Modal open title="Nueva tarea" onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { hidden: true })

    dialog.removeAttribute('open')
    fireEvent(dialog, new Event('close'))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
