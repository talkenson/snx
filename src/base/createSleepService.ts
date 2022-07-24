export const createSleepService = () => {
  let undoSleep: CallableFunction = () => undefined
  const sleep = (ms: number) =>
    new Promise(res => {
      undoSleep = () => res(undefined)
      setTimeout(undoSleep, ms)
    })

  return { startSleep: sleep, stopSleep: () => undoSleep() }
}
