'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../lib/store';
import { ThemeSync } from './ThemeSync';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeSync />
      {children}
    </Provider>
  );
}
