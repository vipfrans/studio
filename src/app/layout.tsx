
"use client";

import React from 'react';
import './globals.css';
import { RobuxProvider } from '@/context/RobuxContext';
import { Navbar } from '@/components/layout/Navbar';
import { LastWinnings } from '@/components/layout/LastWinnings';
import { SnowParticles } from '@/components/effects/SnowParticles';
import { BackgroundMusic } from '@/components/effects/BackgroundMusic';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider, initializeFirebase } from '@/firebase';
import { GlobalAnnouncement } from '@/components/GlobalAnnouncement';
import { MaintenanceOverlay } from '@/components/MaintenanceOverlay';

const { firebaseApp, firestore, auth } = initializeFirebase();

// وضع الصيانة الآن FALSE كما طلبت
const IS_MAINTENANCE = false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>KoroneBet.xyz | Premium Roblox Casino</title>
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230D001A' stroke='%23C899FF' stroke-width='2'/%3E%3Ctext x='16' y='22' fill='%23C899FF' style='font-family: sans-serif; font-weight: 900; font-size: 20px;' text-anchor='middle'%3EK%3C/text%3E%3C/svg%3E" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col overflow-x-hidden">
        {IS_MAINTENANCE && <MaintenanceOverlay />}
        
        <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
          <RobuxProvider>
            {!IS_MAINTENANCE && (
              <>
                <BackgroundMusic />
                <SnowParticles />
                <Navbar />
                <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto">
                  {children}
                </main>
                <GlobalAnnouncement />
                <LastWinnings />
              </>
            )}
            <Toaster />
          </RobuxProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
