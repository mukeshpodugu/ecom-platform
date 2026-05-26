import '@/styles/globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToastManager from '@/components/ToastManager';
import ChatWidget from '@/components/ChatWidget';

export const metadata = {
  title: 'Apex E-Commerce | Premium Marketplace',
  description: 'Shop top quality products, laptops, wearables, apparel with instant shipping and secure payments.',
  keywords: 'ecommerce, shopping, tech gadgets, fashion, active wear, invoice pdf, analytics',
  authors: [{ name: 'Apex Team' }]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Providers>
          <Header />
          <main style={{ flexGrow: 1, minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
          <Footer />
          <ToastManager />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
