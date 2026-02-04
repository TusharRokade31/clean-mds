import { League_Spartan, Alice } from 'next/font/google'
import "./globals.css";
import GoogleProvider from '@/providers/GoogleProvider';
import ReduxProvider from '@/providers/ReduxProvider';
import ClientLayout from '@/component/ClientLayout';
import Script from 'next/script';


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
      <head>
        <meta
          property="og:url"
          content="https://mydivinestays.com/"
        />
        <meta
          property="og:image"
          content="/favicon.svg"
        />

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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PX80TRPEQF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PX80TRPEQF');
          `}
        </Script>

        <GoogleProvider>
          <ReduxProvider>
            <div className='relative'>
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