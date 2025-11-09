
'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function ProfilePageComponent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Error fetching user:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not fetch user profile.',
            })
            router.push('/login');
        } else {
            setUser(data.user);
        }
        setIsLoading(false);
    }
    fetchUser();
  }, [router, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
    });
    router.push('/');
  };

  if (isLoading) {
      return (
           <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#0B0C10] to-[#1A1A2E] text-white">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground">Loading Profile...</p>
            </div>
      )
  }

  if (!user) return null; // Should be handled by AuthGuard but as a fallback

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-[#0B0C10] to-[#1A1A2E] text-white">
        <Header />
        <main className="flex-1 container mx-auto max-w-2xl py-12 px-6 sm:px-8 md:px-4 sm:py-24">
             <Card className="w-full glass-card">
                <CardHeader>
                    <CardTitle className="text-3xl font-heading">Your Profile</CardTitle>
                    <CardDescription>Manage your account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2 text-lg">
                        <p><span className="font-semibold text-muted-foreground">Email:</span> <span className="font-mono text-primary">{user.email}</span></p>
                        <p><span className="font-semibold text-muted-foreground">User ID:</span> <span className="font-mono text-sm text-muted-foreground">{user.id}</span></p>
                         <p><span className="font-semibold text-muted-foreground">Joined:</span> <span className="text-foreground">{new Date(user.created_at).toLocaleDateString()}</span></p>
                    </div>
                    
                    <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full sm:w-auto"
                    >
                    Logout
                    </Button>
                </CardContent>
            </Card>
        </main>
         <footer className="py-6 px-4 md:px-6 text-center text-sm text-muted-foreground z-10 border-t border-white/10 mt-auto">
            <p>&copy; {new Date().getFullYear()} Legal Decoder. All Rights Reserved. This is not legal advice.</p>
        </footer>
    </div>
  );
}


export default function ProfilePage() {
    return (
        <AuthGuard>
            <ProfilePageComponent />
        </AuthGuard>
    )
}
