'use client';

import AuthGuard from '@/components/AuthGuard';
import ClauseExplorer from '@/components/dashboard/clause-explorer';
import { Header } from '@/components/header';

function ClauseExplorerPageComponent() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-[#0B0C10] to-[#1A1A2E] text-white">
      <Header />

      <main className="flex-1 container mx-auto max-w-7xl py-8 px-4 sm:px-6 md:px-8 sm:py-12">
        <div className="text-center space-y-4 mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Legal Clause Explorer
          </h2>
          <p className="text-md sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Your interactive guide to understanding complex legal terminology.
            Search for a term or explore common clauses.
          </p>
        </div>
        <ClauseExplorer />
      </main>

      <footer className="py-6 px-4 md:px-6 text-center text-sm text-muted-foreground z-10 border-t border-white/10 mt-auto">
        <p>
          &copy; {new Date().getFullYear()} Legal Decoder. All Rights Reserved.
          This is not legal advice.
        </p>
      </footer>
    </div>
  );
}

export default function ClauseExplorerPage() {
  return (
    <AuthGuard>
      <ClauseExplorerPageComponent />
    </AuthGuard>
  );
}
