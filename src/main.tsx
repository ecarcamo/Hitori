import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { createSupabaseAuthRepository } from '@/features/auth'
import { createSupabaseCategoryRepository } from '@/features/categories'
import { createSupabaseProfileRepository } from '@/features/profile'
import { createSupabaseTaskRepository } from '@/features/tasks'
import { readSupabaseConfig } from '@/shared/lib/env'
import { createSupabaseClient } from '@/shared/lib/supabase'
import '@/shared/styles/global.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('No se encontró el elemento #root')
}

const supabase = createSupabaseClient(readSupabaseConfig(import.meta.env))

createRoot(rootElement).render(
  <StrictMode>
    <App
      dependencies={{
        auth: createSupabaseAuthRepository(supabase),
        profiles: createSupabaseProfileRepository(supabase),
        categories: createSupabaseCategoryRepository(supabase),
        tasks: createSupabaseTaskRepository(supabase),
      }}
    />
  </StrictMode>,
)
