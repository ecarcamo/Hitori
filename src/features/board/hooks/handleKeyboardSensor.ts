import { KeyboardSensor, type KeyboardSensorOptions } from '@dnd-kit/core'
import type { KeyboardEvent } from 'react'

export const DRAG_HANDLE_ATTRIBUTE = 'data-drag-handle'

const [keyboardActivator] = KeyboardSensor.activators

export class HandleKeyboardSensor extends KeyboardSensor {
  static override activators = [
    {
      eventName: 'onKeyDown' as const,
      handler: (
        event: KeyboardEvent,
        options: KeyboardSensorOptions,
        context: Parameters<NonNullable<typeof keyboardActivator>['handler']>[2],
      ) => {
        const { target } = event.nativeEvent
        if (!(target instanceof HTMLElement) || !target.hasAttribute(DRAG_HANDLE_ATTRIBUTE)) {
          return false
        }
        return keyboardActivator?.handler(event, options, context) ?? false
      },
    },
  ]
}
