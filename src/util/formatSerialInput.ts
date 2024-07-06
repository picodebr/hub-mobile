export const convertStringToHex = (str: string, separator = '') =>
  str
    .split('')
    .map(e => e.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
    .join(separator);

export const formatSerialInput = (input: string) =>
  input
    .split('\n')
    .map(e =>
      e.startsWith('>>') || !e ? e : `<< ${convertStringToHex(`${e}`, ' ')}`,
    )
    .filter(e => e)
    .join('\n');
