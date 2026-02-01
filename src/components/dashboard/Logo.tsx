export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ENOC Agency"
    >
      <text
        x="0"
        y="24"
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="0.05em"
      >
        ENOC
      </text>
      <text
        x="72"
        y="24"
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
        fontSize="12"
        fontWeight="400"
        letterSpacing="0.15em"
        opacity={0.8}
      >
        AGENCY
      </text>
    </svg>
  );
}
