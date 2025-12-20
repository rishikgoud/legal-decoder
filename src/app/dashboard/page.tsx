
'use client';

import {useState, useMemo, useEffect} from 'react';
import {useToast} from '@/hooks/use-toast';
import Dashboard from '@/components/dashboard';
import ClausePreview from '@/components/dashboard/clause-preview';
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

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

function DashboardPageComponent() {
  const [analysisResult, setAnalysisResult] =
    useState<DetectAndLabelClausesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'preview' | 'analysis'
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

  const handlePreview = (text: string, fileName: string) => {
    setContractText(text);
    setContractFileName(fileName);
    setCurrentView('preview');
  };

  const handleAnalyze = async () => {
    if (!contractText || !user) return;

    setIsLoading(true);
    setCurrentView('analysis');

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
                fileName: contractFileName,
                contractText: contractText,
            }),
        });
        
        if (user) await fetchContracts(user.id);

        const result = await response.json();

        if (user) await fetchContracts(user.id);

        if (!response.ok) {
            throw new Error(result.error || 'Analysis failed');
        }

        if (result.data?.analysis_data) {
            setAnalysisResult(result.data.analysis_data as DetectAndLabelClausesOutput);
        }

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: error.message || "An unknown error occurred.",
        });
        setAnalysisResult(null);
        setCurrentView('dashboard');
    }

    setIsLoading(false);
  };

  const handleReset = () => {
    setContractText('');
    setContractFileName('');
    setAnalysisResult(null);
    setIsLoading(false);
    setCurrentView('dashboard');
  };

  const handleViewDetails = (contract: Contract) => {
    if (contract.status === 'Analyzed' && contract.analysis_data && !('error' in contract.analysis_data)) {
        setAnalysisResult(contract.analysis_data as DetectAndLabelClausesOutput);
        
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
        return analysisResult ? (
          <div className='relative'>
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
                AI is decoding your contract... this may take a moment.
              </p>
            </div>
          </div>
        );
      case 'preview':
        return (
          <ClausePreview
            contractText={contractText}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        );
      case 'dashboard':
      default:
        return (
          <MainDashboard
            onPreview={handlePreview}
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
  onPreview,
  contracts,
  isLoading,
  onViewDetails,
  onDelete,
  onDownloadReport,
  onStartNegotiation,
}: {
  onPreview: (text: string, fileName: string) => void;
  contracts: Contract[];
  isLoading: boolean;
  onViewDetails: (contract: Contract) => void;
  onDelete: (contractId: string) => void;
  onDownloadReport: (contract: Contract) => void;
  onStartNegotiation: (contract: Contract) => void;
}) {

  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    let extractedText = '';
    
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const content = await page.getTextContent();
          extractedText += content.items.map((item: any) => item.str).join(" ") + '\n';
        }
      } else if (file.type === 'text/plain' || file.name.endsWith('.docx')) {
         if (file.name.endsWith('.docx')) {
            toast({
                title: 'File Type Note',
                description: `Full DOCX support is in progress. For now, text will be extracted but formatting may be lost.`,
            });
         }
        extractedText = await file.text();
      } else {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload a PDF, DOCX, or text file.',
        });
        setIsParsing(false);
        return;
      }
      
      toast({
        title: 'File Content Extracted',
        description: 'The text from your file is ready for preview.',
      });
      onPreview(extractedText, file.name);

    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        variant: 'destructive',
        title: 'File Parsing Failed',
        description: 'Could not extract text. Please paste the text manually.',
      });
    } finally {
      setIsParsing(false);
    }
    
    e.target.value = ''; // Reset file input
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pastedText = e.clipboardData.getData('text');
      onPreview(pastedText, 'pasted_contract.txt');
  };

  const isDisabled = isLoading || isParsing;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Simplify Complex Legal Jargon</h1>
            <p className="mt-3 text-lg text-muted-foreground">Upload your contract or paste specific clauses below to get an instant AI summary and risk analysis.</p>
        </div>

        <div className="glass-card rounded-xl p-6 max-w-4xl mx-auto">
            <Tabs defaultValue="upload">
                <TabsList className="grid w-full grid-cols-2 bg-slate-900/80">
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-6">
                    <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" disabled={isDisabled} />
                    <label htmlFor="file-upload" className="w-full flex items-center justify-center flex-col h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-white/5 hover:border-primary transition-colors group">
                        {isParsing ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />}
                        <p className="mt-4 font-semibold text-foreground">{isParsing ? 'Parsing File...' : 'Drag & drop your file here'}</p>
                        <p className="text-sm text-muted-foreground mt-1">Supported formats: PDF, DOCX (Max 20MB)</p>
                        <Button variant="outline" size="sm" className="mt-4 pointer-events-none bg-transparent">Browse Files</Button>
                    </label>
                    <p className="text-xs text-muted-foreground text-center mt-4">Your documents are encrypted and processed securely.</p>
                </TabsContent>
                <TabsContent value="paste" className="mt-6">
                    <Textarea
                        placeholder="Pasting your contract text here will take you to the preview..."
                        onPaste={handlePaste}
                        className="min-h-[200px] text-sm bg-transparent"
                        disabled={isDisabled}
                    />
                </TabsContent>
            </Tabs>
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
