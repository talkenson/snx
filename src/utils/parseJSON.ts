export const parseJSON = (parseable: string): any => {
  try {
    return JSON.parse(parseable)
  } catch (e) {
    return undefined
  }
}
