
"use client";

import type {Metadata} from 'next';
import './globals.css';
import { RobuxProvider } from '@/context/RobuxContext';
import { Navbar } from '@/components/layout/Navbar';
import { LastWinnings } from '@/components/layout/LastWinnings';
import { SnowParticles } from '@/components/effects/SnowParticles';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider, initializeFirebase } from '@/firebase';
import { GlobalAnnouncement } from '@/components/GlobalAnnouncement';

const { firebaseApp, firestore, auth } = initializeFirebase();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col overflow-x-hidden">
        <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
          <RobuxProvider>
            <SnowParticles />
            <Navbar />
            <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto">
              {children}
            </main>
            <GlobalAnnouncement />
            <LastWinnings />
            <Toaster />
          </RobuxProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
