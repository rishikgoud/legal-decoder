

'use client';

import { useState, useMemo, useEffect } from 'react';
import { analyzeContract } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import UploadForm from '@/components/upload-form';
import Dashboard from '@/components/dashboard';
import ClausePreview from '@/components/dashboard/clause-preview';
import { DetectAndLabelClausesOutput } from '@/ai/schemas/detect-and-label-clauses-schema';
import { Button } from '@/components/ui/button';
import { FilePlus2, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ContractsDataTable from '@/components/dashboard/contracts-data-table';
import { Header } from '@/components/header';
import type { Contract } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';
import { User } from '@supabase/supabase-js';

function DashboardPageComponent() {
  const [analysisResult, setAnalysisResult] = useState<DetectAndLabelClausesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'dashboard' | 'uploader' | 'preview' | 'analysis'>('dashboard');
  const [contractText, setContractText] = useState('');
  const [contractFileName, setContractFileName] = useState('');
  
  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);

  useEffect(() => {
    async function fetchUserAndContracts() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setIsLoadingContracts(false);
        setContracts([]);
        return;
      }

      setIsLoadingContracts(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('id, file_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        toast({
          variant: 'destructive',
          title: 'Error Fetching History',
          description: 'Could not load your contract analysis history.',
        });
        setContracts([]);
      } else {
        const formattedData = data.map((item: any) => ({
          id: item.id,
          name: item.file_name,
          analyzedAt: item.created_at,
        }));
        setContracts(formattedData);
      }
      setIsLoadingContracts(false);
    }

    fetchUserAndContracts();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        fetchUserAndContracts();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [toast]);

  const handlePreview = (text: string, fileName: string) => {
    setContractText(text);
    setContractFileName(fileName);
    setCurrentView('preview');
  };

  const handleAnalyze = async () => {
    if (!contractText || !user) {
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'You must be signed in to analyze contracts.',
        });
      }
      return;
    }

    setIsLoading(true);
    setCurrentView('analysis');
    try {
      const result = await analyzeContract(contractText, contractFileName);
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        // Add the new contract to the top of the list optimistically
        setContracts(prev => [
            {
                id: (Math.random() * 1000).toString(), // temporary id
                name: contractFileName,
                analyzedAt: new Date().toISOString(),
            },
            ...prev
        ]);
      } else {
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: result.error,
        });
        setAnalysisResult(null);
        setCurrentView('uploader');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An Unexpected Error Occurred',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
      setAnalysisResult(null);
      setCurrentView('uploader');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setContractText('');
    setContractFileName('');
    setAnalysisResult(null);
    setIsLoading(false);
    setCurrentView('dashboard');
  };
  
  const handleAnalyzeNew = () => {
    setContractText('');
    setContractFileName('');
    setAnalysisResult(null);
    setCurrentView('uploader');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'analysis':
        return analysisResult ? (
            <div>
              <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 mb-8">
                 <Button onClick={handleReset} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
              </div>
              <Dashboard
                analysisResult={analysisResult}
                contractText={contractText}
              />
            </div>
          ) : (
            <div className="container mx-auto max-w-4xl py-12 px-6 sm:px-8 md:px-4 flex items-center justify-center h-full">
              <div className="space-y-4 animate-in fade-in duration-500 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-lg text-muted-foreground">AI is decoding your contract... this may take a moment.</p>
              </div>
            </div>
          );
      case 'uploader':
        return <UploadForm onPreview={handlePreview} isLoading={isLoading} />;
      case 'preview':
        return <ClausePreview contractText={contractText} onAnalyze={handleAnalyze} isLoading={isLoading} />;
      case 'dashboard':
      default:
        return <MainDashboard onAnalyzeNew={handleAnalyzeNew} contracts={contracts || []} isLoading={isLoadingContracts} />;
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-[#0B0C10] to-[#1A1A2E] text-white">
      <Header />
      <main className="flex-1 z-10 py-8 sm:py-12">
        {renderContent()}
      </main>
      <footer className="py-6 px-4 md:px-6 text-center text-sm text-muted-foreground z-10 border-t border-white/10 mt-auto">
          <p>&copy; {new Date().getFullYear()} Legal Decoder. All Rights Reserved. This is not legal advice.</p>
      </footer>
    </div>
  );
}

function MainDashboard({onAnalyzeNew, contracts, isLoading}: {onAnalyzeNew: () => void; contracts: Contract[], isLoading: boolean}) {

  return (
    <div className="container mx-auto max-w-7xl px-6 sm:px-8 md:px-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Get a quick overview of your contract analyses.
          </p>
        </div>
        <Button onClick={onAnalyzeNew} className="bg-primary hover:bg-primary/90 text-primary-foreground group w-full sm:w-auto">
          <FilePlus2 className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
          Analyze New Contract
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
          <ContractsDataTable title="Recent Contract Analysis" data={contracts} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
    return (
        <AuthGuard>
            <DashboardPageComponent />
        </AuthGuard>
    )
}
