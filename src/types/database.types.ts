export type RepositoryComplexData<T, S extends boolean = true> = S extends [
  true,
]
  ? { status: S; data: T }
  : S extends [false]
  ? { status: S; error: string }
  : never
