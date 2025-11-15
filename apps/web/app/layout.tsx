export const metadata = {
  title: "Handyman Qatar",
  description: "Marketplace for home services in Qatar"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* eslint-disable-next-line @next/next/no-head-element */}
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        {/* @ts-expect-error Server Component import */}
        <Header />
        <div style={{ padding: 24 }}>{children}</div>
      </body>
    </html>
  );
}

// Server wrapper to render the client Nav without hydration warnings for inline styles
function Header() {
  // Import inside to avoid Next complaining about client component at root
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Nav } = require("../components/Nav.tsx");
  return <Nav />;
}


