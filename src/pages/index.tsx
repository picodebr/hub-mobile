import React from 'react';
import {NativeRouter, Route, Routes} from 'react-router-native';
import {ThemeProvider} from 'styled-components';
import {themes} from '../styles/themes';
import {Code} from './code';
import {NoInternet} from './noInternet';

export const App: React.FC = () => (
  <ThemeProvider theme={themes.light}>
    <NativeRouter>
      <Routes>
        <Route path="/" element={<Code />} />
        <Route path="no-internet" element={<NoInternet />} />
      </Routes>
    </NativeRouter>
  </ThemeProvider>
);
