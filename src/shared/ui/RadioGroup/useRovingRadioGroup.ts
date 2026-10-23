import { useRef, type KeyboardEvent } from 'react'

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown'])
const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp'])

interface RovingRadioGroupOptions {
  count: number
  selectedIndex: number
  onSelect: (index: number) => void
}

export function useRovingRadioGroup({ count, selectedIndex, onSelect }: RovingRadioGroupOptions) {
  const itemsRef = useRef<(HTMLElement | null)[]>([])
  const focusableIndex = Math.max(selectedIndex, 0)

  const selectAndFocus = (index: number) => {
    const wrappedIndex = (index + count) % count
    onSelect(wrappedIndex)
    itemsRef.current[wrappedIndex]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (NEXT_KEYS.has(event.key)) {
      event.preventDefault()
      selectAndFocus(focusableIndex + 1)
    } else if (PREVIOUS_KEYS.has(event.key)) {
      event.preventDefault()
      selectAndFocus(focusableIndex - 1)
    }
  }

  const getItemProps = (index: number) => ({
    ref: (element: HTMLElement | null) => {
      itemsRef.current[index] = element
    },
    role: 'radio' as const,
    'aria-checked': index === selectedIndex,
    tabIndex: index === focusableIndex ? 0 : -1,
    onClick: () => {
      onSelect(index)
    },
  })

  return { groupProps: { role: 'radiogroup' as const, onKeyDown }, getItemProps }
}
