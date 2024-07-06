export const appLog = (...messages: any[]) => {
  console.log(' ', new Date().toISOString().slice(17, -1), ...messages);
};

export const appWarn = (...messages: any[]) => {
  console.warn('', new Date().toISOString().slice(17, -1), ...messages);
};

export const appError = (...messages: any[]) => {
  console.error(new Date().toISOString().slice(17, -1), ...messages);
};
