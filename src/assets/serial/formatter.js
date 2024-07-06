const fs = require('fs');

const hexStringToUnicodeString = str =>
  str
    .split('')
    .map((e, i, a) => (i % 2 === 0 ? `${e}${a[i + 1]}` : ''))
    .filter(e => e)
    .map(e => String.fromCharCode(parseInt(e, 16)))
    .join('');

const main = async () => {
  const source = await fs.promises.readFile('logs/serial.log');

  const sourceHex = [];
  source.forEach(e =>
    sourceHex.push(e.toString(16).toUpperCase().padStart(2, '0')),
  );

  const linesHex = sourceHex
    .join('')
    .split('583E0D') // 'X>\n'
    .join('5820') // 'X '
    .split('3C31303A') // '<10:'
    .filter(e => e)
    .map(e => `31303A${e}`);

  const formattedHex = linesHex.map(l => {
    const [time, operation, ...rest] = l.split('20');

    const timestamp = hexStringToUnicodeString(time);
    const op = hexStringToUnicodeString(operation);

    const hexCodes = rest.join('20');

    const hexCodesPair = hexCodes
      .split('')
      .map((c, i, a) => (i % 2 === 0 ? c + a[i + 1] : ''))
      .filter(e => e);

    const parsedCode = hexCodesPair.join(' ');

    return `${timestamp} ${op} ${parsedCode}`;
  });

  const requestResponse = formattedHex
    .map((l, i, a) => (i % 2 === 0 ? `${l}\n${a[i + 1]}\n` : ''))
    .filter(e => e)
    .join('\n');

  await fs.promises.writeFile('logs/serial.formatted.log', requestResponse);
};

main();
