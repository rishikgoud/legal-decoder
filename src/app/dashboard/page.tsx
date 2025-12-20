
'use client';

import {useState, useMemo, useEffect} from 'react';
import {useToast} from '@/hooks/use-toast';
import {DetectAndLabelClausesOutput} from '@/ai/schemas/detect-and-label-clauses-schema';
import {Button} from '@/components/ui/button';
import {FilePlus2, Loader2, ArrowLeft, UploadCloud, Bot, ShieldAlert, MessageCircle} from 'lucide-react';
import ContractsDataTable from '@/components/dashboard/contracts-data-table';
import {Header} from '@/components/header';
import type {Contract} from '@/lib/types';
import {supabase} from '@/lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';
import {User} from '@supabase/supabase-js';
import * as pdfjsLib from 'pdfjs-dist';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Chat from '@/components/chat';
import AnalysisReport from '@/components/analysis-report';
import { getTranslatedAnalysis, type TranslateAnalysisOutput } from '@/app/actions';


pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

function DashboardPageComponent() {
  const [analysisResult, setAnalysisResult] =
    useState<DetectAndLabelClausesOutput | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'analysis'
  >('dashboard');
  const [contractText, setContractText] = useState('');
  const [contractFileName, setContractFileName] = useState('');
  
  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);

  // State for negotiation modal
  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false);
  const [contractForNegotiation, setContractForNegotiation] = useState<Contract | null>(null);
  const [isNegotiationApproved, setIsNegotiationApproved] = useState(false);
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  // Translation State
  const [translatedAnalysis, setTranslatedAnalysis] = useState<TranslateAnalysisOutput[] | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'hi' | 'te' | 'ta'>('en');

  const processedAnalysis = useMemo(() => {
    if (currentLang === 'en' || !translatedAnalysis || translatedAnalysis.length !== analysisResult?.length) {
      return analysisResult;
    }
    // Merge translation back into the main analysis object
    return analysisResult.map((clause, index) => ({
      ...clause,
      summary: translatedAnalysis[index].translatedSummary,
      riskReason: translatedAnalysis[index].translatedRiskReason,
      recommendation: translatedAnalysis[index].translatedRecommendation,
    }));
  }, [analysisResult, translatedAnalysis, currentLang]);


  async function fetchContracts(userId: string) {
      setIsLoadingContracts(true);
      const {data, error} = await supabase
        .from('contract_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('analyzed_at', {ascending: false});

      if (error) {
        console.error('Error fetching contracts:', error);
        toast({
          variant: 'destructive',
          title: 'Error Fetching History',
          description: 'Could not load your contract analysis history.',
        });
        setContracts([]);
      } else {
        const formattedData = data.map(
          (item: any): Contract => ({
            id: item.id,
            name: item.file_name,
            status: item.status,
            riskLevel: item.risk_level,
            clauses: item.clauses_count,
            analyzedAt: item.analyzed_at,
            highRiskClauses: item.high_risk_clauses_count,
            analysis_data: item.analysis_data,
          })
        );
        setContracts(formattedData);
      }
      setIsLoadingContracts(false);
  }

  useEffect(() => {
    async function fetchUserAndContracts() {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        fetchContracts(user.id);
      } else {
        setIsLoadingContracts(false);
        setContracts([]);
      }
    }

    fetchUserAndContracts();

    const {data: authListener} = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          fetchContracts(currentUser.id);
        } else {
          setContracts([]);
          setIsLoadingContracts(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [toast]);

  const handleStartNewAnalysis = () => {
    setAnalysisResult(null);
    setAnalysisId(null);
    setContractText('');
    setContractFileName('New Contract');
    setIsLoading(false);
    setCurrentView('dashboard');
    // Reset translation state
    setTranslatedAnalysis(null);
    setCurrentLang('en');
     toast({
        title: "Ready for New Analysis",
        description: "The previous report is saved in your dashboard history.",
    });
  }

  const handleLanguageChange = async (lang: 'en' | 'hi' | 'te' | 'ta') => {
    setCurrentLang(lang);
    if (lang === 'en' || !analysisResult) {
      setTranslatedAnalysis(null); // Clear translation if switching back to English
      return;
    }

    setIsTranslating(true);
    try {
      const clausesToTranslate = analysisResult.map(c => ({
        summary: c.summary,
        riskReason: c.riskReason,
        recommendation: c.recommendation,
      }));

      const response = await getTranslatedAnalysis(clausesToTranslate, lang);
      if (response.success && response.data) {
        setTranslatedAnalysis(response.data);
        toast({
          title: "Translation Complete",
          description: `Analysis is now displayed in ${lang}.`,
        });
      } else {
        throw new Error(response.error || 'Translation failed.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
        description: 'Unable to translate at the moment. Showing English version.',
      });
      setCurrentLang('en'); // Revert to English on failure
      setTranslatedAnalysis(null);
    } finally {
      setIsTranslating(false);
    }
  };


  const handleViewDetails = (contract: Contract) => {
    if (contract.status === 'Analyzed' && contract.analysis_data && !('error' in contract.analysis_data)) {
        setAnalysisResult(contract.analysis_data as DetectAndLabelClausesOutput);
        setAnalysisId(contract.id);
        setContractFileName(contract.name);
        
        // Extract original contract text from analysis data
        const fullText = (contract.analysis_data as DetectAndLabelClausesOutput)
          .map(c => c.clauseText)
          .join('\n\n');
        setContractText(fullText);

        setCurrentView('analysis');
    } else {
        toast({
            variant: 'default',
            title: 'Analysis Not Available',
            description: `The analysis for "${contract.name}" is either still processing or resulted in an error.`,
        });
    }
  };

  const handleDelete = async (contractId: string) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to delete a contract.',
        });
        return;
    }
    const response = await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId: contractId, userId: user.id }),
    });

    if (response.ok) {
      toast({
        title: 'Contract Deleted',
        description: 'The analysis has been removed from your history.',
      });
      setContracts(prev => prev.filter(c => c.id !== contractId));
    } else {
      const { error } = await response.json();
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: error || 'Could not delete the contract analysis.',
      });
    }
  };
  
  const handleDownloadReport = (contract: Contract) => {
    if (contract.status === 'Analyzed' && contract.analysis_data && !('error' in contract.analysis_data)) {
      window.open(`/report/${contract.id}`, '_blank');
    } else {
      toast({
          variant: 'default',
          title: 'Report Not Available',
          description: `A report cannot be generated for "${contract.name}" as its analysis is incomplete or failed.`,
      });
    }
  };
  
  const handleStartNegotiation = (contract: Contract) => {
    if (contract.status === 'Analyzed' && contract.analysis_data && !('error' in contract.analysis_data)) {
      setContractForNegotiation(contract);
      setIsNegotiationModalOpen(true);
      setIsNegotiationApproved(false);
    } else {
      toast({
        title: 'Negotiation Not Ready',
        description: 'The negotiation agent requires a complete and successful analysis.',
      });
    }
  };
  
  const confirmAndRunAgent = async () => {
    if (!contractForNegotiation || !user) return;
    setIsAgentRunning(true);
    
    try {
        const fullText = (contractForNegotiation.analysis_data as DetectAndLabelClausesOutput)
          .map(c => c.clauseText)
          .join('\n\n');

        const response = await fetch('/api/supervity/negotiation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractId: contractForNegotiation.id,
            userId: user.id,
            riskLevel: contractForNegotiation.riskLevel,
            analysisData: contractForNegotiation.analysis_data,
            contractText: fullText
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Agent execution failed');
        }

        toast({
          title: 'Negotiation Agent Started',
          description: 'The AI is processing the negotiation workflow. You will be notified upon completion.',
        });
        
    } catch(err: any) {
        toast({
          variant: 'destructive',
          title: 'Agent Failed',
          description: err.message || 'Could not start the negotiation agent.',
        });
    } finally {
        setIsAgentRunning(false);
        setIsNegotiationModalOpen(false);
        setContractForNegotiation(null);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'analysis':
        return processedAnalysis ? (
           <div className="relative">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 mb-8">
                  <Button onClick={handleStartNewAnalysis} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </div>
                <AnalysisReport 
                    analysisResult={processedAnalysis} 
                    contractName={contractFileName} 
                    onStartNew={handleStartNewAnalysis}
                    analysisId={analysisId}
                    onLanguageChange={handleLanguageChange}
                    currentLanguage={currentLang}
                    isTranslating={isTranslating}
                />
                <Dialog>
                  <DialogTrigger asChild>
                      <Button className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl" size="icon">
                          <Bot className="h-8 w-8" />
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl h-[70vh] flex flex-col p-0">
                      <DialogHeader className='p-6 pb-2'>
                          <DialogTitle>Ask AI about this Contract</DialogTitle>
                      </DialogHeader>
                      <Chat contractText={contractText} />
                  </DialogContent>
                </Dialog>
            </div>
        ) : (
          <div className="container mx-auto max-w-4xl py-12 px-6 sm:px-8 md:px-4 flex items-center justify-center h-full">
            <div className="space-y-4 animate-in fade-in duration-500 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-lg text-muted-foreground">
                Loading analysis...
              </p>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <MainDashboard
            contracts={contracts || []}
            isLoading={isLoadingContracts}
            onViewDetails={handleViewDetails}
            onDelete={handleDelete}
            onDownloadReport={handleDownloadReport}
            onStartNegotiation={handleStartNegotiation}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-[#0B0C10] to-[#1A1A2E] text-white">
      <Header />
      <main className="flex-1 z-10 py-8 sm:py-12">{renderContent()}</main>
      
      <AlertDialog open={isNegotiationModalOpen} onOpenChange={setIsNegotiationModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-accent"/>
                Confirm: Start Negotiation Assistant
            </AlertDialogTitle>
            <AlertDialogDescription>
              The AI agent will analyze the contract's risks and draft a negotiation email. This action will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
             <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-yellow-300">Potential Risks Detected</h4>
                        <p className="text-sm text-yellow-400/80">
                            This contract has a risk level of <span className="font-bold">{contractForNegotiation?.riskLevel}</span> with {contractForNegotiation?.highRiskClauses || 'several'} high-impact clauses. The agent will focus on mitigating these points.
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox id="negotiation-approval" checked={isNegotiationApproved} onCheckedChange={(checked) => setIsNegotiationApproved(!!checked)} />
              <Label htmlFor="negotiation-approval" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I understand and approve running the negotiation agent.
              </Label>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={confirmAndRunAgent}
                disabled={!isNegotiationApproved || isAgentRunning}
                className="bg-accent hover:bg-accent/90"
            >
              {isAgentRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Bot className="h-4 w-4 mr-2"/>}
              {isAgentRunning ? 'Running...' : 'Proceed with Agent'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MainDashboard({
  contracts,
  isLoading,
  onViewDetails,
  onDelete,
  onDownloadReport,
  onStartNegotiation,
}: {
  contracts: Contract[];
  isLoading: boolean;
  onViewDetails: (contract: Contract) => void;
  onDelete: (contractId: string) => void;
  onDownloadReport: (contract: Contract) => void;
  onStartNegotiation: (contract: Contract) => void;
}) {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Dashboard</h1>
            <p className="mt-3 text-lg text-muted-foreground">Review and manage your recent contract analyses.</p>
        </div>

        <div className="mt-16">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Analyses</h2>
                <Button variant="link" className="text-primary">View All History</Button>
            </div>
            <ContractsDataTable
                data={contracts}
                isLoading={isLoading}
                onViewDetails={onViewDetails}
                onDelete={onDelete}
                onDownloadReport={onDownloadReport}
                onStartNegotiation={onStartNegotiation}
             />
        </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardPageComponent />
    </AuthGuard>
  );
}
