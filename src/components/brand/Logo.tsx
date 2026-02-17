import Link from "next/link";

export type LogoSize = "sm" | "md";

const sizeClasses: Record<LogoSize, { wrapper: string; text: string }> = {
  sm: { wrapper: "gap-1.5", text: "text-base" },
  md: { wrapper: "gap-2", text: "text-2xl sm:text-3xl" },
};

function LeafIcon({ size }: { size: LogoSize }) {
  const dim = size === "sm" ? 24 : 32;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="flex-shrink-0"
    >
      <path
        d="M16 4C10 10 6 18 6 24c0 2 1.5 4 4 4 6 0 10-4 16-10 0-6-4-12-10-14z"
        fill="#166534"
      />
      <path
        d="M16 4v20c0 2 1.5 4 4 4"
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface LogoProps {
  size?: LogoSize;
  /** @default true - wrap in Link to home */
  link?: boolean;
}

export function Logo({ size = "md", link = true }: LogoProps) {
  const { wrapper, text } = sizeClasses[size];

  const content = (
    <>
      <LeafIcon size={size} />
      <span className={`font-semibold text-green-800 ${text}`}>B Market</span>
    </>
  );

  if (link) {
    return (
      <Link
        href="/"
        className={`inline-flex items-center ${wrapper} focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:ring-offset-2 rounded`}
      >
        {content}
      </Link>
    );
  }

  return <div className={`inline-flex items-center ${wrapper}`}>{content}</div>;
}
