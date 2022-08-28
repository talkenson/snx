export const DUMP_METRICS_DELAY_SEC = (() => {
  const delay = import.meta.env.VITE_DUMP_METRICS_DELAY_SEC
  const parsed = parseInt(delay)
  if (!delay || Number.isNaN(parsed)) {
    console.warn(
      'Environment VITE_DUMP_METRICS_DELAY_SEC key not found or invalid, using',
      1200,
    )
    return 1200
  } else {
    return parsed || 1200
  }
})()
