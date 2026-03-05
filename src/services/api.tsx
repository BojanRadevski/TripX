import { CountryDestination } from "@/types";

export type ApiError = {
  status?: number;
  message?: string;
};

export async function postLogin(body: { username: string; password: string }) {
  const res = await fetch(
    "https://tripx-test-functions.azurewebsites.net/api/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (res.ok) {
    return await res.json().catch(() => ({}));
  }

  const status = res.status;

  const text = await res.text().catch(() => "");
  const message = text?.trim() || res.statusText || "Request failed";

  const err: ApiError = { status, message };
  throw err;
}

export async function getDestinations(): Promise<CountryDestination[]> {
  const res = await fetch(
    "https://book.tripx.se/wp-json/tripx/v1/destinations",
    {
      method: "GET",
    }
  );

  if (!res.ok) {
    const status = res.status;
    const text = await res.text().catch(() => "");
    const message = text?.trim() || res.statusText || "Request failed";
    throw { status, message };
  }

  return (await res.json()) as CountryDestination[];
}
