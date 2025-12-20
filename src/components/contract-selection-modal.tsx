
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import type { Contract } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, FileUp, Database } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import UploadFormMinimal from './upload-form-minimal';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';

type SelectedContract = {
  id: string;
  name: string;
  text: string;
  source: 'DB' | 'New Upload';
};

type ContractSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onContractsSelected: (contracts: SelectedContract[]) => void;
  existingIds: string[];
};

const riskLevelToVariant = (level: string | undefined): 'high' | 'medium' | 'low' | 'secondary' => {
  switch (level) {
    case 'High': return 'high';
    case 'Medium': return 'medium';
    case 'Low': return 'low';
    default: return 'secondary';
  }
};

export default function ContractSelectionModal({ isOpen, onClose, onContractsSelected, existingIds }: ContractSelectionModalProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDbContracts, setSelectedDbContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchContracts();
    }
  }, [isOpen]);

  async function fetchContracts() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated' });
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('contract_analyses')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'Analyzed')
      .order('analyzed_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching history', description: error.message });
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
    setIsLoading(false);
  }

  const handleDbContractToggle = (contract: Contract) => {
    setSelectedDbContracts(prev =>
      prev.some(c => c.id === contract.id)
        ? prev.filter(c => c.id !== contract.id)
        : [...prev, contract]
    );
  };
  
  const handleAddSelected = () => {
    if (selectedDbContracts.length === 0) return;
    
    const contractsToReturn = selectedDbContracts.map(c => {
      // Re-constitute the contract text from analysis_data if possible.
      // This is a simplified version. A better approach would be to store original text.
      let text = '';
      if (c.analysis_data && !('error' in c.analysis_data)) {
        text = c.analysis_data.map(clause => clause.clauseText).join('\n\n');
      }

      return {
        id: c.id,
        name: c.name,
        text,
        source: 'DB' as const,
      };
    }).filter(c => c.text); // Only add contracts where we could get text

    if(contractsToReturn.length < selectedDbContracts.length) {
        toast({
            variant: 'destructive',
            title: 'Missing Text',
            description: 'Could not extract text for some selected contracts. Only valid contracts were added.'
        })
    }

    onContractsSelected(contractsToReturn);
    onClose();
    setSelectedDbContracts([]);
  };

  const handleFileProcessed = (text: string, fileName: string) => {
    const newContract: SelectedContract = {
      id: `new-${Date.now()}`,
      name: fileName,
      text,
      source: 'New Upload'
    };
    onContractsSelected([newContract]);
    onClose();
  };

  const filteredContracts = contracts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md sm:max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">Add Contracts</DialogTitle>
          <DialogDescription>Select from your history or upload new documents to compare.</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="database" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="database"><Database className="mr-2 h-4 w-4"/> Select from Database</TabsTrigger>
            <TabsTrigger value="upload"><FileUp className="mr-2 h-4 w-4"/> Upload New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="database" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 pr-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredContracts.length > 0 ? (
                  filteredContracts.map(contract => (
                    <div
                      key={contract.id}
                      onClick={() => handleDbContractToggle(contract)}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border bg-background/50 cursor-pointer hover:bg-white/10 transition-colors data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed"
                      data-disabled={existingIds.includes(contract.id)}
                    >
                      <Checkbox
                        checked={selectedDbContracts.some(c => c.id === contract.id) || existingIds.includes(contract.id)}
                        disabled={existingIds.includes(contract.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium truncate">{contract.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Analyzed on {format(new Date(contract.analyzedAt), 'PP')}
                        </p>
                      </div>
                      <Badge variant={riskLevelToVariant(contract.riskLevel)}>
                        {contract.riskLevel}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No analyzed contracts found.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
             <DialogFooter className="pt-4 border-t border-border mt-auto">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleAddSelected} disabled={selectedDbContracts.length === 0}>
                Add {selectedDbContracts.length > 0 ? selectedDbContracts.length : ''} Selected
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="upload" className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
                 <UploadFormMinimal 
                    title=""
                    onFileProcessed={handleFileProcessed}
                    isDisabled={false}
                    currentFile={null}
                />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
