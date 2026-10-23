import type { ReactNode } from 'react'
import { PageHeader, SegmentedControl, type SegmentedOption } from '@/shared/ui'
import type { ModePreference } from '../domain/appearance'
import { useAppearanceStore } from '../state/appearanceStore'
import styles from './AppearancePage.module.css'
import { CategoryTonesPreview } from './CategoryTonesPreview'
import { ThemePicker } from './ThemePicker'

const MODE_OPTIONS: readonly SegmentedOption<ModePreference>[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Según el sistema' },
]

interface SettingRowProps {
  title: string
  description: string
  children: ReactNode
}

function SettingRow({ title, description, children }: SettingRowProps) {
  return (
    <section className={styles.row}>
      <div>
        <h2 className={styles.rowTitle}>{title}</h2>
        <p className={styles.rowDescription}>{description}</p>
      </div>
      <div>{children}</div>
    </section>
  )
}

export function AppearancePage() {
  const mode = useAppearanceStore((state) => state.mode)
  const setMode = useAppearanceStore((state) => state.setMode)

  return (
    <>
      <PageHeader
        title="Apariencia"
        description="Elige un tema. Todos tienen versión clara y oscura, y Hitori cuida que todo se lea en las dos."
      />
      <div className={styles.settings}>
        <SettingRow
          title="Modo"
          description="«Según el sistema» cambia solo cuando tu teléfono o tu compu cambian."
        >
          <SegmentedControl label="Modo" options={MODE_OPTIONS} value={mode} onChange={setMode} />
        </SettingRow>
        <SettingRow title="Tema" description="Cada tarjeta muestra el tema en oscuro y en claro.">
          <ThemePicker />
        </SettingRow>
        <SettingRow
          title="Tonos para categorías"
          description="Tus categorías usan uno de estos 8 tonos. Cambian de matiz con el tema y siempre se distinguen del fondo."
        >
          <CategoryTonesPreview />
        </SettingRow>
      </div>
    </>
  )
}
