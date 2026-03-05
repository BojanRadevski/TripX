import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDestinations } from "../../services/api";
import { CountryDestination } from "@/types";

export const fetchDestinations = createAsyncThunk<CountryDestination[]>(
  "destinations/fetchDestinations",
  async () => {
    return await getDestinations();
  }
);
