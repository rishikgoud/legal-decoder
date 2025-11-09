
'use client';

import ClauseExplorer from "@/components/dashboard/clause-explorer";
import { Header } from "@/components/header";
import AuthGuard from "@/components/AuthGuard";

function ClauseExplorerPageComponent() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
             <div className="absolute top-0 -z-10 h-full w-full bg-white dark:bg-slate-950">
                <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(147,51,234,0.5)] opacity-50 blur-[80px]"></div>
            </div>

            <Header />

            <main className="flex-1 container mx-auto max-w-4xl py-8 px-6 sm:px-8 md:px-4 sm:py-12">
                 <div className="text-center space-y-4 mb-8 sm:mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Common Clause Explorer
                    </h2>
                    <p className="text-md sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                        An interactive guide to understanding the most common clauses found in legal contracts. Click on any clause to learn more about its purpose and potential risks.
                    </p>
                </div>
                <ClauseExplorer />
            </main>

            <footer className="py-6 px-4 md:px-6 text-center text-sm text-muted-foreground z-10 border-t">
                 <p>&copy; {new Date().getFullYear()} Legal Decoder. All Rights Reserved. This is not legal advice.</p>
            </footer>
        </div>
    );
}


export default function ClauseExplorerPage() {
    return (
        <AuthGuard>
            <ClauseExplorerPageComponent />
        </AuthGuard>
    )
}
