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

export const queueDispatcher = QueueDisparcher.getInstance({
  defaultDelay: 1000 * 60 * 1, // 1 min
  // defaultDelay: 1000 * 60 * 10 // 10 min
  // defaultDelay: 1000 * 60 * 60 * 1 // 1 hour
  // defaultDelay: 1000 * 60 * 60 * 24 * 1 // 1 day
})
```
