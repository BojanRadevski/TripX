import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  LoginPayload,
  LoginResponse,
  LoginErrorType,
} from "../../types/index";
import { postLogin } from "../../services/api";

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: LoginErrorType }
>("auth/loginUser", async (payload, thunkApi) => {
  try {
    await postLogin({ username: payload.username, password: payload.password });
    return { bookingCode: payload.bookingCode };
  } catch (err: any) {
    const status = err?.status;

    if (status === 401 || status === 403)
      return thunkApi.rejectWithValue("INVALID_CREDENTIALS");
    if (typeof status === "number" && status >= 500)
      return thunkApi.rejectWithValue("SERVER_ERROR");

    return thunkApi.rejectWithValue("NETWORK_ERROR");
  }
});
