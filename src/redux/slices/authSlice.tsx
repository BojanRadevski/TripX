import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loginUser } from "../thunks/authThunks";
import type { LoginErrorType } from "../../types/index";

interface AuthState {
  isAuthenticated: boolean;
  bookingCode: string | null;
  hydrated: boolean;
  status: "idle" | "loading" | "error";
  errorType: LoginErrorType | null;

  failedAttempts: number;
  lockedUntil: number | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  bookingCode: null,
  hydrated: false,

  status: "idle",
  errorType: null,

  failedAttempts: 0,
  lockedUntil: null,
};

const STORAGE_KEY = "tripx_auth_v1";

function saveToStorage(state: AuthState) {
  if (typeof window === "undefined") return;
  const data = {
    isAuthenticated: state.isAuthenticated,
    bookingCode: state.bookingCode,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function readFromStorage(): {
  isAuthenticated: boolean;
  bookingCode: string | null;
} | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return {
      isAuthenticated: Boolean(parsed?.isAuthenticated),
      bookingCode: parsed?.bookingCode ?? null,
    };
  } catch {
    return null;
  }
}

function clearStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromStorage(state) {
      const data = readFromStorage();
      state.hydrated = true;
      if (!data) return;
      state.isAuthenticated = data.isAuthenticated;
      state.bookingCode = data.bookingCode;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.bookingCode = null;

      state.status = "idle";
      state.errorType = null;

      state.failedAttempts = 0;
      state.lockedUntil = null;

      clearStorage();
    },
    clearLockout(state) {
      state.lockedUntil = null;
      state.failedAttempts = 0;
      state.status = "idle";
      state.errorType = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.errorType = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;

        const payload = action.payload as { bookingCode?: string };
        state.bookingCode = payload.bookingCode ?? null;

        state.status = "idle";
        state.errorType = null;

        state.failedAttempts = 0;
        state.lockedUntil = null;

        saveToStorage(state);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "error";
        state.errorType = (action.payload as LoginErrorType) ?? "NETWORK_ERROR";

        state.failedAttempts += 1;

        if (state.failedAttempts >= 3) {
          state.lockedUntil = Date.now() + 30_000;
        }
      });
  },
});

export const { hydrateFromStorage, logout, clearLockout } = authSlice.actions;
export default authSlice.reducer;
