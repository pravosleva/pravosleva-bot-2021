# Notify tools

## FreeDispatcher (Singletone)

```js
// NOTE: Менеджер частоты доставки
// (без таймера, только учет количества + допустимое количество возможных сообщений вне очереди)
import { freeDispatcher } from '~/express-tools/utils/notify-tools/FreeDispatcher'

export const freeDispatcher = new FreeDispatcher({
  defaultOddFree: 5, // NOTE: x сообщений будут доставлены, независимо от временной задержки
})
```

## QueueDisparcher (Singletone)

```js
// NOTE: Персональные очереди для пользователей (с таймером)
import { queueDispatcher } from '~/express-tools/utils/notify-tools/QueueDisparcher'

// NOTE: Персональные очереди для пользователей (с таймером)
export const queueDispatcher = QueueDisparcher.getInstance({
  // NOTE: Время, не чаще которого беспокоить пользователя
  defaultDelay: 1000 * 60 * 30, // 30 min
  
  // NOTE: Количество сообщений в очереди, которые можно отправить подряд по одному
  differentMsgsLimitNumber: 2,
})
```
