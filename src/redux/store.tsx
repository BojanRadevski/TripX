import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import destinationsReducer from "./slices/destinationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    destinations: destinationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
