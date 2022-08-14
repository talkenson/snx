export const exists = <T>(
  undefinableOrNullable: T | undefined | null,
): undefinableOrNullable is T =>
  undefinableOrNullable !== undefined && undefinableOrNullable !== null
