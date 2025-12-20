
'use client';

import {useState, useMemo, useEffect} from 'react';
import {useToast} from '@/hooks/use-toast';
import UploadForm from '@/components/upload-form';
import Dashboard from '@/components/dashboard';
import ClausePreview from '@/components/dashboard/clause-preview';
import {DetectAndLabelClausesOutput} from '@/ai/schemas/detect-and-label-clauses-schema';
import {Button} from '@/components/ui/button';
import {FilePlus2, Loader2, ArrowLeft} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {ResponsiveContainer, PieChart, Pie, Cell, Legend} from 'recharts';
import ContractsDataTable from '@/components/dashboard/contracts-data-table';
import {Header} from '@/components/header';
import type {Contract} from '@/lib/types';
import {supabase} from '@/lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';
import {User} from '@supabase/supabase-js';

function DashboardPageComponent() {
  const [analysisResult, setAnalysisResult] =
    useState<DetectAndLabelClausesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'uploader' | 'preview' | 'analysis'
  >('dashboard');
  const [contractText, setContractText] = useState('');
  const [contractFileName, setContractFileName] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);


  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);

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
        
        // After starting the analysis, refetch contracts to show the 'Analyzing' status
        if (user) await fetchContracts(user.id);

        const result = await response.json();

        // Refetch again to get the final status
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
        setCurrentView('dashboard'); // Go back to dashboard on failure
    }

    setIsLoading(false);
  };

  const handleReset = () => {
    setContractText('');
    setContractFileName('');
    setAnalysisResult(null);
    setIsLoading(false);
    setCurrentView('dashboard');
    setSelectedContract(null);
  };

  const handleAnalyzeNew = () => {
    setContractText('');
    setContractFileName('');
    setAnalysisResult(null);
    setCurrentView('uploader');
  };

  const handleViewDetails = (contract: Contract) => {
    if (contract.status === 'Analyzed' && contract.analysis_data && !('error' in contract.analysis_data)) {
        setAnalysisResult(contract.analysis_data as DetectAndLabelClausesOutput);
        // We don't have the original text, so we'll pass an empty string for the chat.
        // This could be improved by storing the text in the DB.
        setContractText('');
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
              <p className="text-lg text-muted-foreground">
                AI is decoding your contract... this may take a moment.
              </p>
            </div>
          </div>
        );
      case 'uploader':
        return <UploadForm onPreview={handlePreview} isLoading={isLoading} />;
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
            onAnalyzeNew={handleAnalyzeNew}
            contracts={contracts || []}
            isLoading={isLoadingContracts}
            onViewDetails={handleViewDetails}
            onDelete={handleDelete}
            onDownloadReport={handleDownloadReport}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-[#0B0C10] to-[#1A1A2E] text-white">
      <Header />
      <main className="flex-1 z-10 py-8 sm:py-12">{renderContent()}</main>
      <footer className="py-6 px-4 md:px-6 text-center text-sm text-muted-foreground z-10 border-t border-white/10 mt-auto">
        <p>
          &copy; {new Date().getFullYear()} Legal Decoder. All Rights Reserved.
          This is not legal advice.
        </p>
      </footer>
    </div>
  );
}

function MainDashboard({
  onAnalyzeNew,
  contracts,
  isLoading,
  onViewDetails,
  onDelete,
  onDownloadReport,
}: {
  onAnalyzeNew: () => void;
  contracts: Contract[];
  isLoading: boolean;
  onViewDetails: (contract: Contract) => void;
  onDelete: (contractId: string) => void;
  onDownloadReport: (contract: Contract) => void;
}) {
  const riskDistribution = useMemo(() => {
    const validContracts = contracts.filter(
      c => c && c.status === 'Analyzed' && c.riskLevel && c.riskLevel !== 'N/A'
    );

    if (validContracts.length === 0) {
      return [];
    }

    const distribution = validContracts.reduce(
      (acc, contract) => {
        const riskKey = contract.riskLevel as 'High' | 'Medium' | 'Low';
        acc[riskKey] = (acc[riskKey] || 0) + 1;
        return acc;
      },
      {} as Record<'High' | 'Medium' | 'Low', number>
    );

    return [
      {name: 'High', value: distribution.High || 0},
      {name: 'Medium', value: distribution.Medium || 0},
      {name: 'Low', value: distribution.Low || 0},
    ].filter(item => item.value > 0);
  }, [contracts]);

  const COLORS = {
    High: 'hsl(var(--risk-high))',
    Medium: 'hsl(var(--risk-medium))',
    Low: 'hsl(var(--risk-low))',
  };

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
        <Button
          onClick={onAnalyzeNew}
          className="bg-primary hover:bg-primary/90 text-primary-foreground group w-full sm:w-auto"
        >
          <FilePlus2 className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
          Analyze New Contract
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ContractsDataTable
            title="Recent Contract Analysis"
            data={contracts}
            isLoading={isLoading}
            onViewDetails={onViewDetails}
            onDelete={onDelete}
            onDownloadReport={onDownloadReport}
          />
        </div>
        <Card className="h-full bg-white/5 border-white/10 glass-card">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-heading !text-white">
              Overall Risk Distribution
            </CardTitle>
            <CardDescription className="!text-muted-foreground">
              Across all analyzed contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full relative">
              {!isLoading && riskDistribution.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                        index,
                      }) => {
                        if (percent === 0) return null;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x =
                          cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y =
                          cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="font-bold text-sm"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.name as keyof typeof COLORS]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value, entry) => (
                        <span className="text-white/80">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {(isLoading || riskDistribution.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <p className="text-muted-foreground text-center px-4">
                      No data yet. Analyze a contract to see the risk
                      distribution.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
