import { useMutation } from '@tanstack/react-query'
import { useState, type SubmitEvent } from 'react'
import { useDisclosure } from '@/shared/lib/useDisclosure'
import { Button, ComingSoonDialog, Divider, TextField } from '@/shared/ui'
import { authErrorMessage } from '../domain/authError'
import { isValidEmail, normalizeEmail } from '../domain/credentials'
import { IS_GOOGLE_SIGN_IN_AVAILABLE } from '../domain/providers'
import type { AuthRepository } from '../repositories/authRepository'
import { GoogleMark } from './GoogleMark'
import styles from './SignInPage.module.css'

interface EmailStepProps {
  auth: AuthRepository
  redirectPath: string
  initialEmail: string
  onCodeSent: (email: string) => void
}

export function EmailStep({ auth, redirectPath, initialEmail, onCodeSent }: EmailStepProps) {
  const [email, setEmail] = useState(initialEmail)
  const [fieldError, setFieldError] = useState<string>()
  const sendCode = useMutation({
    mutationFn: (value: string) => auth.sendSignInCode(value),
    onSuccess: (_, value) => {
      onCodeSent(value)
    },
  })
  const continueWithGoogle = useMutation({ mutationFn: () => auth.signInWithGoogle(redirectPath) })
  const googleComingSoon = useDisclosure()
  const requestError = sendCode.error ?? continueWithGoogle.error

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = normalizeEmail(email)
    if (!isValidEmail(normalized)) {
      setFieldError('Escribe un correo válido, por ejemplo ana@correo.com.')
      return
    }
    setFieldError(undefined)
    sendCode.mutate(normalized)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Tu correo"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="ana@correo.com"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value)
        }}
        hint="Te mandamos un código de 6 dígitos. Sin contraseñas."
        error={fieldError}
      />
      <Button type="submit" variant="accent" size="lg" disabled={sendCode.isPending}>
        {sendCode.isPending ? 'Enviando…' : 'Recibir código'}
      </Button>
      <Divider label="o" />
      <Button
        size="lg"
        disabled={continueWithGoogle.isPending}
        onClick={() => {
          if (IS_GOOGLE_SIGN_IN_AVAILABLE) {
            continueWithGoogle.mutate()
          } else {
            googleComingSoon.open()
          }
        }}
      >
        <GoogleMark />
        Continuar con Google
      </Button>
      {requestError ? (
        <p className={styles.error} role="alert">
          {authErrorMessage(requestError)}
        </p>
      ) : null}
      <ComingSoonDialog
        open={googleComingSoon.isOpen}
        title="Entrar con Google llega pronto"
        description="Por ahora entra con tu correo: te mandamos un código de 6 dígitos y listo, sin contraseñas."
        actionLabel="Usar mi correo"
        onClose={googleComingSoon.close}
      />
    </form>
  )
}
