'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../lib/store';
import { AuthProviderWrapper } from './AuthProviderWrapper';
import { ThemeSync } from './ThemeSync';
import { AuthGate } from './AuthGate';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProviderWrapper>
        <ThemeSync />
        <AuthGate>{children}</AuthGate>
      </AuthProviderWrapper>
    </Provider>
  );
}
