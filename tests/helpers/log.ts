export function logIfEnabled(message: string, ...args: unknown[]) {
  if (process.env.SHOW_TEST_VALUES === '1') {
    // eslint-disable-next-line no-console
    console.log(message, ...args)
  }
}
