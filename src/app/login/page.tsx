
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Scale } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

   useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push('/');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            router.push('/');
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, [router]);


  const handleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.message,
        });
    } else {
        toast({
            title: 'Login Successful',
            description: 'Redirecting to the homepage...',
        });
        router.push('/');
        router.refresh(); 
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#0B0C10] to-[#1A1A2E] p-4 text-white">
        <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <Scale className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-heading">
                    Legal Decoder
                </h1>
            </Link>
        </div>
      <Card className="w-full max-w-md space-y-4 p-2 sm:p-6 border-white/20 rounded-xl glass-card">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold font-heading">Welcome Back</CardTitle>
            <CardDescription className="!text-muted-foreground pt-2">Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Input 
                className="h-12 bg-white/5 border-white/20 text-base"
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isLoading}
            />
            <Input 
                type="password" 
                className="h-12 bg-white/5 border-white/20 text-base"
                placeholder="Password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={isLoading}
            />
            <Button onClick={handleLogin} disabled={isLoading || !email || !password} className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
            </Button>
             <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign Up
              </Link>
            </p>
        </CardContent>
      </Card>
       <footer className="py-6 px-4 md:px-6 text-center text-sm text-muted-foreground z-10 absolute bottom-0">
         <p>&copy; {new Date().getFullYear()} Legal Decoder. All Rights Reserved. This is not legal advice.</p>
      </footer>
    </div>
  );
}
