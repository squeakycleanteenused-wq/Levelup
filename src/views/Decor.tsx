import type { Season } from "../theme";

/** Hooajaline kaunistus lehe lõpus. Sügisel küünal (vilkuv leek) ja kõrvitsad. */
export default function Decor({ season }: { season: Season }) {
  if (season !== "autumn") return null;
  const pumpkin = (w: number) => (
    <svg width={w} height={w * 0.85} viewBox="0 0 80 68" aria-hidden>
      <ellipse cx="22" cy="40" rx="20" ry="24" fill="#e8741a" />
      <ellipse cx="58" cy="40" rx="20" ry="24" fill="#e8741a" />
      <ellipse cx="40" cy="40" rx="20" ry="26" fill="#f08a2c" />
      <path d="M40 14 q0 -8 6 -10" stroke="#4d7c0f" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M40 16 v48 M28 20 q-6 22 0 42 M52 20 q6 22 0 42" stroke="#c2570f" strokeWidth="2" fill="none" />
    </svg>
  );
  return (
    <div className="decor" aria-hidden>
      {pumpkin(64)}
      <svg width="34" height="84" viewBox="0 0 34 84">
        <rect x="9" y="30" width="16" height="50" rx="3" fill="#fff4dc" stroke="#e5d3b0" />
        <path d="M17 30 v-5" stroke="#3b2412" strokeWidth="2" />
        <g className="flame">
          <path d="M17 6 q9 10 0 19 q-9 -9 0 -19z" fill="#fbbf24" />
          <path d="M17 13 q4 5 0 10 q-4 -5 0 -10z" fill="#fff7d6" />
        </g>
      </svg>
      {pumpkin(44)}
    </div>
  );
}
