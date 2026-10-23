import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createFakeAuthRepository } from '@/test/fakes'
import { renderWithProviders } from '@/test/render'
import { AuthError } from '../domain/authError'
import { SignInPage } from './SignInPage'

function setup() {
  const user = userEvent.setup()
  const auth = createFakeAuthRepository(null)
  const onSignedIn = vi.fn()
  renderWithProviders(<SignInPage auth={auth} redirectPath="/tablero" onSignedIn={onSignedIn} />)
  return { user, auth, onSignedIn }
}

describe('SignInPage', () => {
  it('signs in with an emailed code', async () => {
    const { user, auth, onSignedIn } = setup()

    await user.type(screen.getByLabelText('Tu correo'), '  Ana@Hitori.test ')
    await user.click(screen.getByRole('button', { name: 'Recibir código' }))

    expect(auth.sendSignInCode).toHaveBeenCalledWith('ana@hitori.test')
    expect(await screen.findByText('ana@hitori.test')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Código'), '123456')

    expect(auth.verifySignInCode).toHaveBeenCalledWith('ana@hitori.test', '123456')
    await vi.waitFor(() => {
      expect(onSignedIn).toHaveBeenCalled()
    })
  })

  it('asks for a valid email before sending anything', async () => {
    const { user, auth } = setup()

    await user.type(screen.getByLabelText('Tu correo'), 'ana')
    await user.click(screen.getByRole('button', { name: 'Recibir código' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Escribe un correo válido')
    expect(auth.sendSignInCode).not.toHaveBeenCalled()
  })

  it('explains a wrong code and lets the user try again', async () => {
    const { user, auth, onSignedIn } = setup()
    auth.verifySignInCode.mockRejectedValueOnce(new AuthError('invalid_code'))

    await user.type(screen.getByLabelText('Tu correo'), 'ana@hitori.test')
    await user.click(screen.getByRole('button', { name: 'Recibir código' }))
    await user.type(await screen.findByLabelText('Código'), '000000')

    expect(await screen.findByRole('alert')).toHaveTextContent('El código no es correcto')
    expect(onSignedIn).not.toHaveBeenCalled()
  })

  it('only accepts digits in the code', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('Tu correo'), 'ana@hitori.test')
    await user.click(screen.getByRole('button', { name: 'Recibir código' }))
    const codeInput = await screen.findByLabelText('Código')
    await user.type(codeInput, '12a-3')

    expect(codeInput).toHaveValue('123')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()
  })

  it('starts the Google flow toward the requested page', async () => {
    const { user, auth } = setup()

    await user.click(screen.getByRole('button', { name: 'Continuar con Google' }))

    expect(auth.signInWithGoogle).toHaveBeenCalledWith('/tablero')
  })
})
