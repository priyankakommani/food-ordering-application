import type { Metadata } from 'next';
import './globals.css';
import { ApolloWrapper } from '@/lib/apollo';

export const metadata: Metadata = {
  title: 'Slooze Food Ordering',
  description: 'Role-based food ordering application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>
          {children}
        </ApolloWrapper>
      </body>
    </html>
  );
}
