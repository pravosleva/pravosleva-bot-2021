class DebounceSingletone {
  private static instance: DebounceSingletone
  penging: boolean

  constructor() {
    this.penging = false
  }
  public static getInstance(): DebounceSingletone {
    if (!DebounceSingletone.instance)
      DebounceSingletone.instance = new DebounceSingletone()

    return DebounceSingletone.instance
  }

  // public call(cb: () => void, ms: number) {}
}

export const debounceInstance = DebounceSingletone.getInstance()
