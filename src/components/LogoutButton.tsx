
'use client';

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export function LogoutButton() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
    });
    router.push('/');
    router.refresh();
  };

  return (
    <DropdownMenuItem
      onClick={handleLogout}
      className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Logout</span>
    </DropdownMenuItem>
  );
}
