function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  color,
  size = 22,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-1 ring-black/5"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        fontSize: Math.max(9, size * 0.4),
      }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
