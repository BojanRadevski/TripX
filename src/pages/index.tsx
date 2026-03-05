import LoginForm from "../components/loginForm";
import { useRouter } from "next/router";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { logout } from "../redux/slices/authSlice";

function BrandPanel() {
  return (
    <div className="brand-panel">
      <svg
        className="brand-panel-grid"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="400" height="600" fill="url(#grid)" />
        <line
          x1="200"
          y1="0"
          x2="0"
          y2="600"
          stroke="#a78bfa"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <line
          x1="200"
          y1="0"
          x2="400"
          y2="600"
          stroke="#a78bfa"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <line
          x1="200"
          y1="0"
          x2="80"
          y2="600"
          stroke="#7c3aed"
          strokeWidth="0.3"
          opacity="0.35"
        />
        <line
          x1="200"
          y1="0"
          x2="320"
          y2="600"
          stroke="#7c3aed"
          strokeWidth="0.3"
          opacity="0.35"
        />
      </svg>

      <div className="brand-panel-orb brand-panel-orb--primary" />
      <div className="brand-panel-orb brand-panel-orb--accent" />

      <svg
        className="brand-panel-svg"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <polygon
          points="200,55 232,87 200,119 168,87"
          fill="none"
          stroke="#c4b5fd"
          strokeWidth="1"
          opacity="0.55"
        />
        <polygon
          points="200,62 225,87 200,112 175,87"
          fill="rgba(124,58,237,0.08)"
        />
        <polygon
          points="318,195 343,225 318,255 293,225"
          fill="none"
          stroke="#ec4899"
          strokeWidth="0.9"
          opacity="0.45"
        />
        <polygon
          points="78,345 103,375 78,405 53,375"
          fill="none"
          stroke="#818cf8"
          strokeWidth="0.9"
          opacity="0.4"
        />
        <path
          d="M115,175 Q148,205 182,242 Q222,275 262,312 Q288,352 312,392"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="1.8"
          strokeDasharray="5,5"
          opacity="0.55"
        />
        <circle cx="115" cy="175" r="4" fill="#7c3aed" opacity="0.9" />
        <circle cx="182" cy="242" r="3" fill="#a78bfa" opacity="0.7" />
        <circle cx="262" cy="312" r="4" fill="#ec4899" opacity="0.8" />
        <circle cx="312" cy="392" r="3" fill="#818cf8" opacity="0.7" />
        <g transform="translate(258,305) rotate(-35)" opacity="0.95">
          <path d="M0,-9 L6,5 L0,3 L-6,5 Z" fill="#fff" />
          <path d="M-9,1 L9,1 L7,4 L-7,4 Z" fill="rgba(255,255,255,0.65)" />
        </g>
      </svg>

      <div className="brand-panel-wordmark">
        <div className="brand-panel-title">TRIPX</div>
        <div className="brand-panel-tagline">Your journey starts here</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-form-side">
          <div className="login-logo">TRIPX</div>

          {isAuthenticated ? (
            <>
              <div className="login-heading">Already logged in</div>
              <div className="login-subheading">
                Go to Destinations or logout.
              </div>
              <div className="login-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => router.push("/destinations")}
                >
                  Go to destinations
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => dispatch(logout())}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="login-heading">Welcome back</div>
              <div className="login-subheading">
                Enter your details to continue
              </div>
              <LoginForm />
            </>
          )}
        </div>

        <div className="login-brand-side">
          <BrandPanel />
        </div>
      </div>
    </div>
  );
}
