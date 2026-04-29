export const metadata = {
  title: 'TheInkPress',
  description: 'Independent journalism — depth over speed.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
