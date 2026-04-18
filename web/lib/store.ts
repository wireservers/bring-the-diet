import { configureStore } from '@reduxjs/toolkit';
import { themeReducer } from './themeSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

store.subscribe(() => {
  const { mode } = store.getState().theme;
  try {
    localStorage.setItem('theme', mode);
  } catch {
    // localStorage unavailable
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
