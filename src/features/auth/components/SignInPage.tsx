import * as m from 'motion/react-m'
import { useState } from 'react'
import { BrandMark } from '@/shared/ui'
import type { AuthRepository } from '../repositories/authRepository'
import { CodeStep } from './CodeStep'
import { EmailStep } from './EmailStep'
import styles from './SignInPage.module.css'

type SignInStep = { kind: 'email' } | { kind: 'code'; email: string }

const STEP_ENTRANCE = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 380, damping: 32 },
} as const

interface SignInPageProps {
  auth: AuthRepository
  redirectPath: string
  onSignedIn: () => void
}

export function SignInPage({ auth, redirectPath, onSignedIn }: SignInPageProps) {
  const [step, setStep] = useState<SignInStep>({ kind: 'email' })
  const [lastEmail, setLastEmail] = useState('')

  return (
    <main className={styles.screen}>
      <div className={styles.panel}>
        <header className={styles.brand}>
          <BrandMark size="lg" />
          <h1 className={styles.title}>Hitori</h1>
          <p className={styles.tagline}>Tu tablero, a tu ritmo.</p>
        </header>
        <m.div key={step.kind} {...STEP_ENTRANCE}>
          {step.kind === 'email' ? (
            <EmailStep
              auth={auth}
              redirectPath={redirectPath}
              initialEmail={lastEmail}
              onCodeSent={(email) => {
                setLastEmail(email)
                setStep({ kind: 'code', email })
              }}
            />
          ) : (
            <CodeStep
              auth={auth}
              email={step.email}
              onVerified={onSignedIn}
              onChangeEmail={() => {
                setStep({ kind: 'email' })
              }}
            />
          )}
        </m.div>
      </div>
    </main>
  )
}
