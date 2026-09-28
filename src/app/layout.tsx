import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "منيو رياحين الإسكندرية | الرقمي التفاعلي",
  description: "القائمة الرقمية التفاعلية لمطعم ومقهى رياحين الإسكندرية",
  manifest: '/manifest.json?v=2',
  icons: {
    icon: '/icon-192-v2.png',
    apple: '/icon-512-v2.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'رياحين المنيو',
  },
};

export const viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className="h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW failed', err);
                  });
                });
              }
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && (event.reason.stack?.includes('chrome-extension') || event.reason.message?.includes('MetaMask'))) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              });
              window.addEventListener('error', function(event) {
                if (event.filename && event.filename.includes('chrome-extension')) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              });
            `,
          }}
        />


      </head>
      <body className="min-h-full flex flex-col font-body bg-pearl-white text-soft-charcoal">
        {children}
      </body>
    </html>
  );
}
