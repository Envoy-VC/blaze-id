import localFont from 'next/font/local';
import { headers } from 'next/headers';

import { wagmiConfig } from '~/lib/viem';

import type { Metadata } from 'next';
import { cookieToInitialState } from 'wagmi';
import { Web3Provider } from '~/providers';
import '~/styles/globals.css';
import { TRPCReactProvider } from '~/trpc/react';

import { Toaster } from '~/components/ui/sonner';

const sfPro = localFont({
  src: '../../public/SF Pro.ttf',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Create T3 App',
  description: 'Generated by create-t3-app',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(
    wagmiConfig,
    headers().get('cookie')
  );

  return (
    <html lang='en'>
      <body className={`font-sans ${sfPro.variable}`}>
        <TRPCReactProvider>
          <Web3Provider initialState={initialState}>{children}</Web3Provider>
        </TRPCReactProvider>
        <Toaster position='bottom-right' />
      </body>
    </html>
  );
}
