const operation = <const>['RX', 'TX'];
type Operation = typeof operation[number];

export const formatLogData = (data: string, op: Operation) => {
  const now = new Date();
  const hours = `${now.getHours().toString().padStart(2, '0')}`;
  const minutes = `${now.getMinutes().toString().padStart(2, '0')}`;
  const seconds = `${now.getSeconds().toString().padStart(2, '0')}`;
  const milliseconds = `${now.getMilliseconds().toString().padStart(3, '0')}`;
  const timestamp = `${hours}:${minutes}:${seconds}.${milliseconds}`;

  const formattedData = data
    .split('')
    .map((s, i, a) => (i % 2 === 0 ? `${s}${a[i + 1]}` : ''))
    .filter(e => e)
    .join(' ');

  return `${timestamp} ${op} ${formattedData}`;
};
