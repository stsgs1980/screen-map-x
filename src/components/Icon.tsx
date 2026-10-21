import type { IconName } from "../data/types";

/** 12 px field icons (24 viewBox, stroke) */
const PATHS: Record<IconName, React.ReactNode> = {
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5" />
    </>
  ),
  money: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10.5h16M8 3v4M16 3v4" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10.5h18" />
    </>
  ),
  swap: (
    <>
      <path d="M4 8h13M13.5 4 17.5 8l-4 4" />
      <path d="M20 16H7M10.5 12 6.5 16l4 4" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-2-1.6L14 21l-2-1.6L10 21l-2-1.6L6 21z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </>
  ),
  refund: (
    <>
      <polyline points="9 14 4 9 9 4" />
      <path d="M4 9h10a5 5 0 0 1 0 10h-4" />
    </>
  ),
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />,
  text: <path d="M5 6h14M5 12h14M5 18h8" />,
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
