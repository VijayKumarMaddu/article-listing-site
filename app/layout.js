export const metadata = {
  title: 'TheInkPress',
  description: 'Independent journalism — depth over speed.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}