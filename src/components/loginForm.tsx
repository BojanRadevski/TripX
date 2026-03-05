import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { clearLockout } from "../redux/slices/authSlice";
import { loginUser } from "../redux/thunks/authThunks";
import toast from "react-hot-toast";

type FormErrors = {
  username?: string;
  password?: string;
  bookingCode?: string;
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { status, errorType, failedAttempts, lockedUntil, isAuthenticated } =
    useAppSelector((s) => s.auth);

  const [username, setUsername] = useState("tripx");
  const [password, setPassword] = useState("123456");
  const [bookingCode, setBookingCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [now, setNow] = useState(Date.now());
  const suppressErrorToastsRef = useRef(false);

  const isBusy = status === "loading";
  const isLocked = useMemo(
    () => lockedUntil != null && lockedUntil > now,
    [lockedUntil, now]
  );
  const secondsLeft = useMemo(() => {
    if (!lockedUntil) return 0;
    return Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  }, [lockedUntil, now]);

  useEffect(() => {
    if (!lockedUntil) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [lockedUntil]);

  useEffect(() => {
    if (!isLocked) {
      toast.dismiss("lockout");
      return;
    }
    toast.error(`Too many failed attempts. Try again in ${secondsLeft}s.`, {
      id: "lockout",
      duration: Infinity,
    });
  }, [isLocked, secondsLeft]);

  useEffect(() => {
    if (lockedUntil && secondsLeft === 0) {
      suppressErrorToastsRef.current = true;
      toast.dismiss("lockout");
      toast.dismiss();
      dispatch(clearLockout());
      toast.success("You can try again now.");
      setTimeout(() => {
        suppressErrorToastsRef.current = false;
      }, 400);
    }
  }, [dispatch, lockedUntil, secondsLeft]);

  useEffect(() => {
    if (isAuthenticated) router.replace("/destinations");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (suppressErrorToastsRef.current) return;
    if (isLocked) return;
    if (status !== "error") return;
    if (failedAttempts <= 0) return;
    const id = `login-error-${failedAttempts}`;
    if (errorType === "INVALID_CREDENTIALS")
      toast.error("Wrong username or password.", { id });
    else if (errorType === "SERVER_ERROR")
      toast.error("Server issue. Please try again.", { id });
    else toast.error("Network error. Please try again.", { id });
  }, [errorType, failedAttempts, isLocked, status]);

  function validate(next?: {
    username?: string;
    password?: string;
    bookingCode?: string;
  }) {
    const u = (next?.username ?? username).trim();
    const p = next?.password ?? password;
    const b = (next?.bookingCode ?? bookingCode).trim();
    const e: FormErrors = {};
    if (!u) e.username = "Username is required.";
    else if (u.length < 3) e.username = "At least 3 characters.";
    if (!p) e.password = "Password is required.";
    else if (p.length < 6) e.password = "At least 6 characters.";
    if (b) {
      if (b.length < 3) e.bookingCode = "At least 3 characters.";
      else if (b.length > 32) e.bookingCode = "Too long.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Fix the highlighted fields.");
      return;
    }
    if (isBusy) return;
    if (isLocked) {
      toast.error(`Try again in ${secondsLeft}s.`, {
        id: "lockout",
        duration: Infinity,
      });
      return;
    }
    const u = username.trim();
    const b = bookingCode.trim();
    const action = await dispatch(
      loginUser({ username: u, password, bookingCode: b || undefined })
    );
    if (loginUser.fulfilled.match(action)) {
      toast.dismiss("lockout");
      toast.success("Logged in.");
      router.replace("/destinations");
    }
  }

  const disableButton = isBusy || isLocked;
  const tooltipText = useMemo(() => {
    if (isBusy) return "Logging in…";
    if (isLocked) return `Locked. Try again in ${secondsLeft}s.`;
    return "";
  }, [isBusy, isLocked, secondsLeft]);

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="field mb-4">
        <label className="label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className={`input${errors.username ? " input-error" : ""}`}
          value={username}
          onChange={(e) => {
            const v = e.target.value;
            setUsername(v);
            if (errors.username) validate({ username: v });
          }}
          autoComplete="username"
        />
        {errors.username && <p className="hint">{errors.username}</p>}
      </div>

      <div className="field mb-4">
        <label className="label" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            className={`input pr-10${errors.password ? " input-error" : ""}`}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              const v = e.target.value;
              setPassword(v);
              if (errors.password) validate({ password: v });
            }}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            tabIndex={-1}
            className="eye-btn"
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {errors.password && <p className="hint">{errors.password}</p>}
      </div>

      <div className="field mb-4">
        <div className="label-row">
          <label className="label" htmlFor="bookingCode">
            Booking code
          </label>
          <span className="optional-badge">optional</span>
        </div>
        <input
          id="bookingCode"
          className={`input${errors.bookingCode ? " input-error" : ""}`}
          value={bookingCode}
          onChange={(e) => {
            const v = e.target.value;
            setBookingCode(v);
            if (errors.bookingCode) validate({ bookingCode: v });
          }}
          inputMode="text"
        />
        {errors.bookingCode && <p className="hint">{errors.bookingCode}</p>}
      </div>

      {/* Failed attempts dots */}
      {failedAttempts > 0 && !isLocked && (
        <div className="attempt-dots">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`attempt-dot${
                i < failedAttempts ? " attempt-dot--filled" : ""
              }`}
            />
          ))}
          <span className="attempt-count">{failedAttempts}/3</span>
        </div>
      )}

      <div className="tooltip-wrap">
        {disableButton && tooltipText && (
          <div className="tooltip">
            <div className="tooltip-box">{tooltipText}</div>
            <div className="tooltip-arrow" />
          </div>
        )}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={disableButton}
        >
          {isBusy ? "Logging in..." : "Log in"}
        </button>
      </div>
    </form>
  );
}
