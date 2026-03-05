import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { fetchDestinations } from "../redux/thunks/destinationsThunks";
import { logout } from "../redux/slices/authSlice";
import toast from "react-hot-toast";

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function SearchIcon() {
  return (
    <svg
      className="search-icon"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    </svg>
  );
}

export default function DestinationsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isAuthenticated, bookingCode, hydrated } = useAppSelector(
    (s) => s.auth
  );
  const { items, status, errorMessage } = useAppSelector((s) => s.destinations);

  const [q, setQ] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) router.replace("/");
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (status === "idle" && items.length === 0) {
      dispatch(fetchDestinations())
        .unwrap()
        .catch(() => toast.error("Failed to load destinations."));
    }
  }, [dispatch, isAuthenticated, items.length, status]);

  const filtered = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;
    return items.filter((country) => {
      const countryHit = normalize(country.name).includes(query);
      const subHit = (country.destinations ?? []).some((d) => {
        if (normalize(d.name).includes(query)) return true;
        return (d.alias ?? []).some((a) => normalize(a).includes(query));
      });
      return countryHit || subHit;
    });
  }, [items, q]);

  if (!hydrated) return null;

  const showEmpty =
    status === "idle" &&
    (items.length === 0 || (q.trim() && filtered.length === 0));

  function onLogout() {
    dispatch(logout());
    router.replace("/");
  }

  if (!isAuthenticated) return null;

  return (
    <div className="destinations-page">
      <header className="destinations-header">
        <h1 className="destinations-header-title">
          <span>Destinations</span>
        </h1>

        <div className="destinations-search-wrap">
          <SearchIcon />
          <input
            className="input"
            placeholder="Search countries, cities…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <button className="btn btn-outline" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="destinations-body">
        {bookingCode && (
          <div className="booking-badge">
            <TicketIcon />
            <span className="booking-badge-label">Booking&nbsp;code</span>
            {bookingCode}
          </div>
        )}

        {status === "loading" && <p className="hint">Loading destinations…</p>}

        {status === "error" && (
          <div className="alert alert-danger">
            {errorMessage || "Failed to load destinations."}
          </div>
        )}

        {showEmpty && (
          <p className="hint">
            {items.length === 0
              ? "No destinations found."
              : "No matches for your search."}
          </p>
        )}

        {status !== "loading" && status !== "error" && filtered.length > 0 && (
          <>
            <div className="results-bar">
              <p className="results-count">
                <strong>{filtered.length}</strong>{" "}
                {filtered.length === 1 ? "country" : "countries"}
                {q.trim() ? " found" : ""}
              </p>
            </div>

            <div className="dest-grid">
              {filtered.map((c) => {
                const destinations = c.destinations ?? [];
                const shown = destinations.slice(0, 4);
                const extra = destinations.length - shown.length;

                return (
                  <div key={c.code || c.slug} className="dest-card">
                    <div className="dest-card-img">
                      <img src={c.thumbnail} alt={c.name} loading="lazy" />
                    </div>

                    <div className="dest-card-body">
                      <div className="dest-card-name">{c.name}</div>
                      <div className="dest-card-meta">
                        <span>{c.countHotels} hotels</span>
                        <span className="dest-card-meta-sep" />
                        <span>{c.countDestinations} destinations</span>
                      </div>

                      {shown.length > 0 && (
                        <div className="dest-card-cities">
                          {shown.map((d) => (
                            <span key={d.name} className="dest-card-city-tag">
                              {d.name}
                            </span>
                          ))}
                          {extra > 0 && (
                            <span className="dest-card-city-tag dest-card-city-tag--more">
                              +{extra} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
