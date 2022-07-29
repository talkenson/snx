export const parseJSON = (parseable: string): ReturnType<typeof JSON.parse> => {
  try {
    return JSON.parse(parseable)
  } catch (e) {
    return undefined
  }
}
