
'use client';
import { Menu, Scale, User as UserIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { LogoutButton } from './LogoutButton';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

const loggedOutLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
];

const loggedInLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard", label: "Analyze" },
  { href: "/compare", label: "Compare" },
  { href: "/clause-explorer", label: "Clause Explorer" },
];

export function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setIsLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, []);

  const closeSheet = () => setIsSheetOpen(false);

  const getInitials = (email: string | undefined) => {
      if (!email) return 'U';
      return email.charAt(0).toUpperCase();
  }

  const navLinks = user ? loggedInLinks : loggedOutLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8 md:px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-heading">
              Legal Decoder
            </h1>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
             <Link 
                key={link.href + link.label} 
                href={link.href} 
                className={cn("text-gray-300 transition-colors hover:text-white", { "text-primary font-semibold": pathname === link.href && link.label !== 'Analyze' })}
             >
               {link.label}
             </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
            {!isLoading && (
              user ? (
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                       <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getInitials(user.email)}</AvatarFallback>
                       </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                       <Link href="/profile"><DropdownMenuItem className="cursor-pointer"><UserIcon className="mr-2"/>Profile</DropdownMenuItem></Link>
                       <Link href="/dashboard"><DropdownMenuItem className="cursor-pointer"><Scale className="mr-2"/>Dashboard</DropdownMenuItem></Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <LogoutButton />
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/login">Get Started</Link>
                </Button>
              )
            )}

            {/* Mobile Navigation */}
            <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-background border-l border-white/20">
                <div className="flex flex-col h-full">
                    <div className="border-b border-white/10 p-4">
                    <Link href="/" className="flex items-center gap-3" onClick={closeSheet}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                        <Scale className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight font-heading">
                        Legal Decoder
                        </h1>
                    </Link>
                    </div>
                    <nav className="flex flex-col gap-4 p-4 mt-4">
                    {navLinks.map((link) => (
                        <Link 
                        key={link.href + link.label} 
                        href={link.href} 
                        className={cn("text-lg text-gray-300 transition-colors hover:text-primary p-2 rounded-md", {"text-primary font-semibold": pathname === link.href})}
                        onClick={closeSheet}
                        >
                        {link.label}
                        </Link>
                    ))}
                    </nav>
                    <div className="mt-auto p-4 border-t border-white/10">
                        {!isLoading && (user ? <LogoutButton /> : <Button asChild className="w-full"><Link href="/login">Login</Link></Button>)}
                    </div>
                </div>
                </SheetContent>
            </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
