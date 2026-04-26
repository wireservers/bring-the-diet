'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../lib/store';
import { AuthProviderWrapper } from './AuthProviderWrapper';
import { ThemeSync } from './ThemeSync';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProviderWrapper>
        <ThemeSync />
        {children}
      </AuthProviderWrapper>
    </Provider>
  );
}
