const createUseBeforeExit = () => {
  const callbackCollection: Array<() => any | Promise<any>> = []
  const addBeforeExitHook = (callback: () => any | Promise<any>) => {
    const id = callbackCollection.push(callback)
    return () => {
      delete callbackCollection[id]
    }
  }

  const deleteBeforeExitHook = (callback: () => any) => {
    callbackCollection.filter(cb => cb !== callback)
  }

  return { addBeforeExitHook, deleteBeforeExitHook, callbackCollection }
}

export const { addBeforeExitHook, deleteBeforeExitHook, callbackCollection } =
  createUseBeforeExit()
