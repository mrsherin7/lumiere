import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { CartProvider } from '@/providers/CartProvider';
import { WishlistProvider } from '@/providers/WishlistProvider';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: {
    default: 'Lumière — Premium Tech & Digital Accessories',
    template: '%s | Lumière',
  },
  description:
    'Curated digital accessories for the modern workspace. High-fidelity audio, precision keyboards, ergonomic mice, and smart wearables.',
  keywords: ['tech accessories', 'headphones', 'earpods', 'smartwatch', 'mechanical keyboard', 'ergonomic mouse', 'digital electronics'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Lumière',
    title: 'Lumière — Premium Tech & Digital Accessories',
    description: 'Curated digital accessories for the modern workspace.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumière — Premium Tech & Digital Accessories',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                {children}
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
