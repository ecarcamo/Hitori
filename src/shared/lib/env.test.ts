import { readSupabaseConfig } from './env'

describe('readSupabaseConfig', () => {
  it('reads the Supabase settings', () => {
    expect(
      readSupabaseConfig({
        VITE_SUPABASE_URL: 'http://127.0.0.1:55321',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_x',
      }),
    ).toEqual({ url: 'http://127.0.0.1:55321', publishableKey: 'sb_publishable_x' })
  })

  it('fails loudly when a setting is missing', () => {
    expect(() => readSupabaseConfig({ VITE_SUPABASE_URL: 'no-es-url' })).toThrow(
      /VITE_SUPABASE_URL/,
    )
  })
})
