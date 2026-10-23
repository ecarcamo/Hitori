import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { createFakeProfileRepository, ONBOARDED_PROFILE } from '@/test/fakes'
import { renderWithProviders } from '@/test/render'
import { OnboardingPage } from './OnboardingPage'

describe('OnboardingPage', () => {
  it('saves the name and timezone and finishes the onboarding', async () => {
    const user = userEvent.setup()
    const profiles = createFakeProfileRepository({
      ...ONBOARDED_PROFILE,
      displayName: null,
      onboardedAt: null,
    })
    const onDone = vi.fn()
    renderWithProviders(
      <Suspense>
        <OnboardingPage profiles={profiles} userId="user-1" onDone={onDone} />
      </Suspense>,
    )

    await user.type(await screen.findByLabelText('¿Cómo te llamamos?'), '  Ana  ')
    await user.selectOptions(screen.getByLabelText('Tu zona horaria'), 'America/Guatemala')
    await user.click(screen.getByRole('button', { name: 'Empezar' }))

    await vi.waitFor(() => {
      expect(onDone).toHaveBeenCalled()
    })
    expect(profiles.updateProfile).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ displayName: 'Ana', timezone: 'America/Guatemala' }),
    )
    const [, changes] = profiles.updateProfile.mock.calls[0] ?? []
    expect(changes?.onboardedAt).toEqual(expect.any(String))
  })
})
