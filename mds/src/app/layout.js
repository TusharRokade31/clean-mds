import { League_Spartan, Alice } from 'next/font/google'
import "./globals.css";
import GoogleProvider from '@/providers/GoogleProvider';
import ReduxProvider from '@/providers/ReduxProvider';
import ClientLayout from '@/component/ClientLayout';
// 1. Import the official GTM component
import { GoogleTagManager } from '@next/third-parties/google'
import { Suspense } from 'react';
import GTMPageTracker from '@/component/GTMPageTracker';

const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-league-spartan',
})

const alice = Alice({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-alice',
})

export const metadata = {
  title: "My Divine Stays",
  description: "My Divine Stays - Manage Your Dharamshala Bookings Effortlessly",
  verification: {
    google: '6dOQ_Zr6CTUViPcsaHuilaECUJVB9n5PchroE-dK_2A',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 2. Replace manual scripts with this component. 
          It handles page view tracking automatically in Next.js. */}
      <GoogleTagManager gtmId="GTM-PB8NB6N4" />
      
      <head>
        <meta property="og:url" content="https://mydivinestays.com/" />
        <meta property="og:image" content="/favicon.svg" />

        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="40x40" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body className={`${leagueSpartan.variable} ${alice.variable} antialiased`}>
        <GoogleProvider>
  <ReduxProvider>
    <div className='relative'>
      <Suspense fallback={null}>
        <GTMPageTracker />   {/* 👈 Add this */}
      </Suspense>
      <ClientLayout>
        {children}
      </ClientLayout>
    </div>
  </ReduxProvider>
</GoogleProvider>
      </body>
    </html>
  );
}