import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'IncidentMind AI — AI-Powered Incident Response',
  description:
    'IncidentMind AI: Your AI incident responder that learns from every failure using Hindsight persistent memory.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-text-primary antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#131f35',
              color: '#e2e8f0',
              border: '1px solid #1e3a5f',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#131f35',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#131f35',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
