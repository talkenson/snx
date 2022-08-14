export const excludeKeys = <
  K extends keyof Partial<T> | string,
  T extends Record<string, unknown>,
>(
  victim: T,
  keysToExclude: K[],
) =>
  Object.fromEntries(
    // @ts-ignore
    Object.entries(victim).filter(entry => !keysToExclude.includes(entry[0])),
  ) as Omit<T, Extract<keyof T, K>>
