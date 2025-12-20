'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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

const riskLevelToVariant = (
  level?: string
): 'high' | 'medium' | 'low' | 'secondary' => {
  switch (level) {
    case 'High':
      return 'high';
    case 'Medium':
      return 'medium';
    case 'Low':
      return 'low';
    default:
      return 'secondary';
  }
};

export default function ContractSelectionModal({
  isOpen,
  onClose,
  onContractsSelected,
  existingIds,
}: ContractSelectionModalProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDbContracts, setSelectedDbContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) fetchContracts();
  }, [isOpen]);

  async function fetchContracts() {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
      toast({
        variant: 'destructive',
        title: 'Error fetching history',
        description: error.message,
      });
      setContracts([]);
    } else {
      setContracts(
        data.map((item: any) => ({
          id: item.id,
          name: item.file_name,
          status: item.status,
          riskLevel: item.risk_level,
          clauses: item.clauses_count,
          analyzedAt: item.analyzed_at,
          highRiskClauses: item.high_risk_clauses_count,
          analysis_data: item.analysis_data,
        }))
      );
    }
    setIsLoading(false);
  }

  const handleDbContractToggle = (contract: Contract) => {
    setSelectedDbContracts((prev) =>
      prev.some((c) => c.id === contract.id)
        ? prev.filter((c) => c.id !== contract.id)
        : [...prev, contract]
    );
  };

  const handleAddSelected = () => {
    if (!selectedDbContracts.length) return;

    const contractsToReturn = selectedDbContracts
      .map((c) => {
        let text = '';
        if (Array.isArray(c.analysis_data)) {
          text = c.analysis_data.map((cl: any) => cl.clauseText).join('\n\n');
        }
        return { id: c.id, name: c.name, text, source: 'DB' as const };
      })
      .filter((c) => c.text);

    onContractsSelected(contractsToReturn);
    onClose();
    setSelectedDbContracts([]);
  };

  const handleFileProcessed = (text: string, fileName: string) => {
    onContractsSelected([
      {
        id: `new-${Date.now()}`,
        name: fileName,
        text,
        source: 'New Upload',
      },
    ]);
    onClose();
  };

  const filteredContracts = contracts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="
          w-full
          max-w-[1100px]
          max-h-[85vh]
          flex
          flex-col
          overflow-hidden
          glass-card
        "
      >
        {/* Header */}
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl font-heading">
            Add Contracts
          </DialogTitle>
          <DialogDescription>
            Select from your history or upload new documents to compare.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <Tabs
          defaultValue="database"
          className="flex flex-col flex-1 overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="database">
              <Database className="mr-2 h-4 w-4" /> Select from Database
            </TabsTrigger>
            <TabsTrigger value="upload">
              <FileUp className="mr-2 h-4 w-4" /> Upload New
            </TabsTrigger>
          </TabsList>

          {/* DATABASE TAB */}
          <TabsContent
            value="database"
            className="flex flex-col flex-1 overflow-hidden mt-4"
          >
            {/* Search */}
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Scrollable List */}
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredContracts.length ? (
                  filteredContracts.map((contract) => (
                    <div
                      key={contract.id}
                      onClick={() => handleDbContractToggle(contract)}
                      data-disabled={existingIds.includes(contract.id)}
                      className="
                        flex items-center gap-4 p-3 rounded-lg border
                        bg-background/50 cursor-pointer
                        hover:bg-white/10 transition
                        data-[disabled=true]:opacity-50
                        data-[disabled=true]:cursor-not-allowed
                      "
                    >
                      <Checkbox
                        checked={
                          selectedDbContracts.some(
                            (c) => c.id === contract.id
                          ) || existingIds.includes(contract.id)
                        }
                        disabled={existingIds.includes(contract.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{contract.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Analyzed on{' '}
                          {format(new Date(contract.analyzedAt), 'PP')}
                        </p>
                      </div>
                      <Badge
                        variant={riskLevelToVariant(contract.riskLevel)}
                      >
                        {contract.riskLevel}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No analyzed contracts found.
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <DialogFooter className="shrink-0 border-t mt-4 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSelected}
                disabled={!selectedDbContracts.length}
              >
                Add {selectedDbContracts.length || ''} Selected
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* UPLOAD TAB */}
          <TabsContent
            value="upload"
            className="flex-1 flex items-center justify-center"
          >
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
