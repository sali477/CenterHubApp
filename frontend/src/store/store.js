import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import centerReducer from './slices/centerSlice.js';
import courseReducer from './slices/courseSlice.js';
import notificationReducer from './slices/notificationSlice.js';
import uiReducer from './slices/uiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    centers: centerReducer,
    courses: courseReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
});
