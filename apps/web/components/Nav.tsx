import Link from "next/link";

export function Nav() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 24px",
        borderBottom: "1px solid #eee"
      }}
    >
      <Link href="/" style={{ fontWeight: 700, textDecoration: "none", color: "inherit" }}>
        Handyman Qatar
      </Link>
      <div style={{ flex: 1 }} />
    </nav>
  );
}


