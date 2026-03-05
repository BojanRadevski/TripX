export type LoginErrorType =
  | "INVALID_CREDENTIALS"
  | "SERVER_ERROR"
  | "NETWORK_ERROR";

export interface LoginPayload {
  username: string;
  password: string;
  bookingCode?: string;
}

export interface LoginResponse {
  bookingCode?: string;
}

export interface SubDestination {
  name: string;
  slug: string;
  code: string;
  thumbnail: string;
  countHotels: number;
  alias?: string[];
}

export interface CountryDestination {
  name: string;
  slug: string;
  code: string;
  thumbnail: string;
  countHotels: number;
  countDestinations: number;
  destinations: SubDestination[];
}
