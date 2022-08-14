export type RepositoryComplexData<
  T extends unknown,
  S extends boolean = true,
> = S extends [true]
  ? { status: S; data: T }
  : S extends [false]
  ? { status: S; error: string }
  : never
