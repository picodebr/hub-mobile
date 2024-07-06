const light = {
  name: 'light',
  colors: {
    primary: '#038BB6',
    primaryLight: '#02A7DB',
    background: '#fff',
    backgroundMedium: '#bbb',
    text: '#4D565C',
    textLight: '#707070',
    textDark: '#333333',
  },
};

export type Theme = typeof light;

export const themes = {
  light,
};
