export const buildRejectedResult = (result: unknown) => ({
  status: 'rejected',
  result: result,
})
