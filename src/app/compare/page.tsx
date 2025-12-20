
'use client';

import { useState, useMemo } from 'react';
import { compareContractsMulti } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, GitCompareArrows, X, FileText, PlusCircle } from 'lucide-react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { MultiCompareContractsOutput } from '@/ai/schemas/compare-contracts-schema';
import { motion } from 'framer-motion';
import AuthGuard from '@/components/AuthGuard';
import ContractSelectionModal from '@/components/contract-selection-modal';
import ComparisonResults from '@/components/comparison-results';

type SelectedContract = {
  id: string;
  name: string;
  text: string;
  source: 'DB' | 'New Upload';
};

function ComparePageComponent() {
    const [selectedContracts, setSelectedContracts] = useState<SelectedContract[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [results, setResults] = useState<MultiCompareContractsOutput | null>(null);
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

        setIsLoading(true);
        setResults(null);
        try {
            const response = await compareContractsMulti(selectedContracts);
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
                        Select multiple documents from your history or upload new ones to highlight key differences.
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
                    <Card className="glass-card max-w-4xl mx-auto">
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
                        <ComparisonResults results={results} />
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
