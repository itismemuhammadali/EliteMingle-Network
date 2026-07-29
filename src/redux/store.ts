import { configureStore } from '@reduxjs/toolkit';
import roleReducer from './roleSlice';

export const store = configureStore({
  // Keep Redux root state as { user, admin }
  reducer: roleReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

