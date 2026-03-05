import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchDestinations } from "../thunks/destinationsThunks";
import type { CountryDestination } from "../../types";

type DestinationsState = {
  items: CountryDestination[];
  status: "idle" | "loading" | "error";
  errorMessage: string | null;
};

const initialState: DestinationsState = {
  items: [],
  status: "idle",
  errorMessage: null,
};

const destinationsSlice = createSlice({
  name: "destinations",
  initialState,
  reducers: {
    clearDestinations(state) {
      state.items = [];
      state.status = "idle";
      state.errorMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDestinations.pending, (state) => {
        state.status = "loading";
        state.errorMessage = null;
      })
      .addCase(
        fetchDestinations.fulfilled,
        (state, action: PayloadAction<CountryDestination[]>) => {
          state.items = action.payload ?? [];
          state.status = "idle";
          state.errorMessage = null;
        }
      )
      .addCase(fetchDestinations.rejected, (state, action) => {
        state.status = "error";
        state.errorMessage =
          (action.error?.message as string) || "Failed to load destinations.";
      });
  },
});

export const { clearDestinations } = destinationsSlice.actions;
export default destinationsSlice.reducer;
