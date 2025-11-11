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
      <body>{children}</body>
    </html>
  );
}


