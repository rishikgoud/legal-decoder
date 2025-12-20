
'use client';

import { useState, useMemo } from 'react';
import { compareTwoContracts } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, GitCompareArrows, ShieldAlert, ShieldCheck, X, FileText, PlusCircle } from 'lucide-react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CompareContractsOutput, RiskDifferenceSchema } from '@/ai/schemas/compare-contracts-schema';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import ComparisonSummaryCard from '@/components/comparison-summary-card';
import { DetectAndLabelClausesOutput } from '@/ai/schemas/detect-and-label-clauses-schema';
import AuthGuard from '@/components/AuthGuard';
import type { Contract } from '@/lib/types';
import ContractSelectionModal from '@/components/contract-selection-modal';

type ComparisonResultsData = {
    comparison: CompareContractsOutput;
    analysisA: DetectAndLabelClausesOutput;
    analysisB: DetectAndLabelClausesOutput;
};

type SelectedContract = {
  id: string;
  name: string;
  text: string;
  source: 'DB' | 'New Upload';
};

const RiskIcon = ({ level }: { level: string }) => {
    switch (level) {
        case 'High': return <ShieldAlert className="h-4 w-4 text-red-500" />;
        case 'Medium': return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
        case 'Low': return <ShieldCheck className="h-4 w-4 text-green-500" />;
        default: return null;
    }
}

const riskLevelToVariant = (level: string): 'high' | 'medium' | 'low' | 'secondary' => {
  switch (level) {
    case 'High': return 'high';
    case 'Medium': return 'medium';
    case 'Low': return 'low';
    default: return 'secondary';
  }
};


function ComparisonResults({ results, contractAName, contractBName }: { results: ComparisonResultsData, contractAName: string, contractBName: string }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const { riskDistributionA, riskDistributionB } = useMemo(() => {
    const formatDistribution = (analysis: DetectAndLabelClausesOutput | undefined) => {
        if (!analysis) return [];
        
        const dist = analysis.reduce((acc, clause) => {
            acc[clause.riskLevel] = (acc[clause.riskLevel] || 0) + 1;
            return acc;
        }, {} as Record<'High' | 'Medium' | 'Low', number>);

        return Object.entries(dist)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0);
    };

    return {
      riskDistributionA: formatDistribution(results.analysisA),
      riskDistributionB: formatDistribution(results.analysisB),
    };
  }, [results.analysisA, results.analysisB]);
  
  const contractAData = {
    name: "Contract A",
    fileName: contractAName,
    summary: results.comparison.summaryA || "No summary available for Contract A.",
    riskDistribution: riskDistributionA,
  };

  const contractBData = {
    name: "Contract B",
    fileName: contractBName,
    summary: results.comparison.summaryB || "No summary available for Contract B.",
    riskDistribution: riskDistributionB,
  };


  return (
    <motion.div 
      className="mt-8 sm:mt-12 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
         <div className="text-left mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">AI Summary of Differences</h2>
            <p className="text-muted-foreground mt-2 max-w-full text-sm sm:text-base text-center">
              {results.comparison.summaryDiff || 'A comparative overview highlighting key distinctions and risk levels.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ComparisonSummaryCard {...contractAData} />
            <ComparisonSummaryCard {...contractBData} />
          </div>
      </motion.div>

      {results.comparison.riskDifferences && results.comparison.riskDifferences.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-heading">Risk Profile Changes</CardTitle>
              <CardDescription>Clauses that exist in both contracts but have different risk assessments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.comparison.riskDifferences.map((diff: RiskDifferenceSchema, index: number) => (
                  <div key={index} className="p-4 sm:p-6 border border-border rounded-lg bg-secondary/50">
                    <p className="font-semibold text-md sm:text-lg mb-4 text-foreground">{diff.clause}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
                      <div className="text-left p-4 rounded-md bg-background/50">
                        <p className="text-sm text-muted-foreground mb-2">Contract A</p>
                         <Badge variant={riskLevelToVariant(diff.contractA_risk)} className="flex items-center gap-1.5 w-fit mb-3">
                            <RiskIcon level={diff.contractA_risk} />
                            {diff.contractA_risk} Risk
                        </Badge>
                        <p className="text-sm text-muted-foreground">{diff.contractA_reason}</p>
                      </div>
                      <div className="text-left p-4 rounded-md bg-background/50">
                        <p className="text-sm text-muted-foreground mb-2">Contract B</p>
                        <Badge variant={riskLevelToVariant(diff.contractB_risk)} className="flex items-center gap-1.5 w-fit mb-3">
                            <RiskIcon level={diff.contractB_risk} />
                            {diff.contractB_risk} Risk
                        </Badge>
                        <p className="text-sm text-muted-foreground">{diff.contractB_reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}


function ComparePageComponent() {
    const [selectedContracts, setSelectedContracts] = useState<SelectedContract[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [results, setResults] = useState<ComparisonResultsData | null>(null);
    const { toast } = useToast();

    const handleCompare = async () => {
        if (selectedContracts.length < 2) {
            toast({
                variant: 'destructive',
                title: 'Not Enough Contracts',
                description: 'Please select at least two contracts to compare.',
            });
            return;
        }

        // For now, we only compare the first two contracts as per existing logic
        const [contractOne, contractTwo] = selectedContracts;

        setIsLoading(true);
        setResults(null);
        try {
            const response = await compareTwoContracts(contractOne.text, contractTwo.text);
            if (response.success && response.data) {
                setResults(response.data);
                 toast({
                    title: 'Comparison Complete!',
                    description: 'The analysis report is ready below.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Comparison Failed',
                    description: response.error || 'Could not compare contracts.',
                });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'An Unexpected Error Occurred',
                description: error instanceof Error ? error.message : 'Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const addContracts = (contracts: SelectedContract[]) => {
      setSelectedContracts(prev => {
        const newContracts = contracts.filter(c => !prev.some(pc => pc.id === c.id));
        return [...prev, ...newContracts].slice(0, 5); // Limit to 5 contracts
      });
    };

    const removeContract = (id: string) => {
      setSelectedContracts(prev => prev.filter(c => c.id !== id));
    };

    const handleReset = () => {
        setSelectedContracts([]);
        setResults(null);
        setIsLoading(false);
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-[#0B0C10] to-[#1A1A2E] text-white">
            <Header />

            <main className="flex-1 container mx-auto max-w-7xl py-8 sm:py-12 px-6 sm:px-8 md:px-4">
                <div className="text-center space-y-4 mb-8 sm:mb-12 animate-in fade-in duration-500">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Compare Contracts
                    </h2>
                    <p className="text-md sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                        Select at least two documents from your history or upload new ones to highlight key differences.
                    </p>
                </div>

                <ContractSelectionModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onContractsSelected={addContracts}
                    existingIds={selectedContracts.map(c => c.id)}
                />

                {!results && (
                  <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-2xl font-heading">Selected Contracts</CardTitle>
                        <CardDescription>Add up to 5 contracts to compare.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          {selectedContracts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No contracts selected yet.</p>
                            </div>
                          ) : (
                            selectedContracts.map((contract) => (
                              <div key={contract.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg animate-in fade-in duration-300">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                  <span className="truncate font-medium">{contract.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => removeContract(contract.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          )}
                          
                          {selectedContracts.length < 5 && (
                            <Button variant="outline" className="w-full border-dashed" onClick={() => setIsModalOpen(true)}>
                              <PlusCircle className="mr-2 h-4 w-4"/>
                              Add Contract
                            </Button>
                          )}
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-center mt-8">
                        <Button
                            size="lg"
                            onClick={handleCompare}
                            disabled={isLoading || selectedContracts.length < 2}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Comparing...
                                </>
                            ) : (
                                <>
                                    <GitCompareArrows className="mr-2 h-5 w-5" />
                                    Compare {selectedContracts.length > 1 ? selectedContracts.length : ''} Contracts
                                </>
                            )}
                        </Button>
                    </div>
                  </motion.div>
                )}

                {isLoading && (
                    <div className="text-center mt-12">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                        <p className="text-muted-foreground mt-4">AI is analyzing the differences. This may take a moment...</p>
                    </div>
                )}

                {results && !isLoading && (
                    <>
                        <ComparisonResults results={results} contractAName={selectedContracts[0]?.name || 'Contract A'} contractBName={selectedContracts[1]?.name || 'Contract B'} />
                        <div className="flex justify-center mt-12">
                            <Button onClick={handleReset} variant="outline" size="lg">
                                Compare New Contracts
                            </Button>
                        </div>
                    </>
                )}

            </main>
             <footer className="py-6 px-4 md:px-6 text-center text-sm text-muted-foreground z-10 border-t border-white/10 mt-auto">
                 <p>&copy; {new Date().getFullYear()} Legal Decoder. All Rights Reserved. This is not legal advice.</p>
            </footer>
        </div>
    );
}

export default function ComparePage() {
    return (
        <AuthGuard>
            <ComparePageComponent />
        </AuthGuard>
    )
}
