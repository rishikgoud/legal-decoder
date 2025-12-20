'use client';

import React, { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Scale,
  FileX,
  Globe,
  Swords,
  Copyright,
  Handshake,
  Columns,
  Search,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { defineLegalTerm } from '@/ai/flows/define-legal-term';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

type Clause = {
  icon: React.ReactNode;
  title: string;
  simpleExplanation: string;
  standardWording: string;
  implicationsAndRisks: string;
  riskLevel: 'Low' | 'Medium' | 'High';
};

const commonClauses: Clause[] = [
  {
    icon: <Shield className="h-5 w-5 text-primary" />,
    title: 'Indemnification',
    simpleExplanation:
      'A promise by one party to cover the losses of the other party if specific issues arise, often from lawsuits related to the first party\'s actions.',
    standardWording:
      'The "Indemnifying Party" shall indemnify, defend, and hold harmless the "Indemnified Party" from and against any and all claims, losses, damages, liabilities, and expenses, including reasonable attorneys\' fees, arising out of or related to the Indemnifying Party\'s breach of this Agreement.',
    implicationsAndRisks:
      'This is a major risk-shifting clause. If you are the indemnifying party, you could be responsible for significant costs. Pay close attention to the scope: what events trigger indemnification? Is it limited to third-party claims?',
    riskLevel: 'High',
  },
  {
    icon: <Scale className="h-5 w-5 text-primary" />,
    title: 'Limitation of Liability',
    simpleExplanation:
      'This clause sets a cap on the amount of money one party has to pay the other if something goes wrong, often excluding "indirect" or "consequential" damages.',
    standardWording:
      'In no event shall either party\'s aggregate liability arising out of or related to this agreement exceed the total amount paid by you hereunder in the 12 months preceding the last event giving rise to liability. In no event shall either party be liable for any indirect, incidental, special, or consequential damages, including loss of profits, data, or business opportunities.',
    implicationsAndRisks:
      "Crucial for financial risk management. A low cap benefits the party providing the service/product. A high cap or no cap is better for the paying party. The exclusion of 'consequential damages' is standard but can leave you without compensation for business losses.",
    riskLevel: 'High',
  },
  {
    icon: <FileX className="h-5 w-5 text-primary" />,
    title: 'Termination',
    simpleExplanation:
      'Defines how and when the contract can be ended, either for convenience (with notice) or for a serious violation (a "material breach").',
    standardWording:
      'Either party may terminate this Agreement for any reason upon thirty (30) days prior written notice to the other party. This Agreement may be terminated immediately by either party for a material breach by the other party if such breach is not cured within fifteen (15) days of receiving written notice.',
    implicationsAndRisks:
      'Termination for convenience gives flexibility but can create instability. A short "cure period" for breaches gives less time to fix problems. Ensure the conditions for termination are clear and fair for both sides.',
    riskLevel: 'Medium',
  },
  {
    icon: <Globe className="h-5 w-5 text-primary" />,
    title: 'Governing Law & Jurisdiction',
    simpleExplanation:
      "Specifies which state's or country's laws will be used to interpret the contract and where any lawsuit must be filed.",
    standardWording:
      'This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles. The parties consent to the exclusive jurisdiction of the state and federal courts located in Wilmington, Delaware.',
    implicationsAndRisks:
      "This has huge practical implications. If the specified jurisdiction is far from you, litigation can become prohibitively expensive and inconvenient. Always check if it's a favorable or neutral location.",
    riskLevel: 'Medium',
  },
  {
    icon: <Swords className="h-5 w-5 text-primary" />,
    title: 'Force Majeure',
    simpleExplanation:
      'Excuses a party from not performing their contractual duties due to unforeseen, external events beyond their control, like natural disasters or war.',
    standardWording:
      'Neither party shall be liable for any failure to perform its obligations hereunder where such failure results from any cause beyond its reasonable control, including, without limitation, acts of God, war, terrorism, riots, or natural disasters.',
    implicationsAndRisks:
      'This clause is often overlooked until it\'s too late. The list of events should be reviewed. For example, does it include "pandemics" or "cyberattacks"? A broad definition can excuse non-performance too easily.',
    riskLevel: 'Low',
  },
  {
    icon: <Copyright className="h-5 w-5 text-primary" />,
    title: 'Intellectual Property',
    simpleExplanation:
      "Clarifies who owns the creative work (code, designs, branding) generated or used during the contract and how the other party can use it.",
    standardWording:
      'All intellectual property rights in and to the services provided, including any deliverables, shall remain the exclusive property of the Provider. The Client is granted a limited, non-exclusive, non-transferable license to use the deliverables for its internal business purposes only.',
    implicationsAndRisks:
      'Critical for any creative or tech project. If you are paying for work, you need to ensure you own it or have a broad enough license to use it as needed. Look for terms like "work-for-hire" or "assignment of IP".',
    riskLevel: 'High',
  },
  {
    icon: <Handshake className="h-5 w-5 text-primary" />,
    title: 'Confidentiality',
    simpleExplanation:
      'A legally binding promise to keep certain information secret and not share it with third parties.',
    standardWording:
      'Each party (the "Receiving Party") shall keep confidential all non-public information and documentation of the other party (the "Disclosing Party"), marked as confidential or which would reasonably be considered confidential, and shall not use it for any purpose other than the performance of this Agreement.',
    implicationsAndRisks:
      'The definition of "Confidential Information" is key. Is it too broad or too narrow? Also, check the duration—how long must the information be kept secret? Some obligations can survive the termination of the contract for many years.',
    riskLevel: 'Medium',
  },
  {
    icon: <Columns className="h-5 w-5 text-primary" />,
    title: 'Severability',
    simpleExplanation:
      'A safety-net clause. It ensures that if one part of the contract is found to be illegal or invalid by a court, the rest of the contract can still be enforced.',
    standardWording:
      'If any provision of this Agreement is held to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions of this Agreement shall remain in full force and effect.',
    implicationsAndRisks:
      'This is a standard and generally low-risk clause that is beneficial to have. It prevents an entire agreement from being thrown out due to one problematic part.',
    riskLevel: 'Low',
  },
];

type ClauseDetail = Clause | { title: string; simpleExplanation: string; standardWording: string; implicationsAndRisks: string; riskLevel: 'Low' | 'Medium' | 'High'; icon: React.ReactNode };

const ClauseExplorer = () => {
  const [selectedClause, setSelectedClause] = useState<ClauseDetail>(
    commonClauses[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    startTransition(async () => {
      try {
        const result = await defineLegalTerm({ term: searchTerm });
        setSelectedClause({
          ...result,
          title: result.term,
          icon: <Search className="h-5 w-5 text-accent" />,
        });
      } catch (error) {
        console.error('Failed to define legal term:', error);
        toast({
          variant: 'destructive',
          title: 'Search Failed',
          description:
            'Could not retrieve a definition for that term. Please try again.',
        });
      }
    });
  };

  const riskLevelToVariant = (
    level: 'High' | 'Medium' | 'Low'
  ): 'high' | 'medium' | 'low' => {
    return level.toLowerCase() as 'high' | 'medium' | 'low';
  };

  const riskCardClass = {
      High: 'border-red-500/50 bg-red-500/5',
      Medium: 'border-yellow-500/50 bg-yellow-500/5',
      Low: 'border-green-500/50 bg-green-500/5',
  };

  const riskTextClass = {
      High: 'text-red-400',
      Medium: 'text-yellow-400',
      Low: 'text-green-400',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 h-full">
      {/* Left Panel */}
      <Card className="md:col-span-1 lg:col-span-1 glass-card flex flex-col">
        <CardHeader>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search a legal term..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-2 overflow-hidden">
          <ScrollArea className="flex-grow pr-2">
            <div className="space-y-2">
              {commonClauses.map((clause) => (
                <Button
                  key={clause.title}
                  variant="ghost"
                  onClick={() => setSelectedClause(clause)}
                  className={cn(
                    'w-full justify-start p-3 h-auto text-left flex items-center gap-3',
                    selectedClause.title === clause.title && 'bg-primary/10 text-primary'
                  )}
                >
                  {clause.icon}
                  <div className="flex-1">
                    <p className="font-semibold">{clause.title}</p>
                  </div>
                  <Badge variant={riskLevelToVariant(clause.riskLevel)}>{clause.riskLevel}</Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel */}
      <motion.div
        key={selectedClause.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="md:col-span-2 lg:col-span-3"
      >
        <Card className="glass-card h-full">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">{selectedClause.icon}</div>
              <div>
                <CardTitle className="text-3xl font-heading">
                  {selectedClause.title}
                </CardTitle>
                <CardDescription>
                  AI-powered insights into this legal concept.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="explanation" className="w-full">
                <TabsList className="bg-background/80">
                  <TabsTrigger value="explanation">Simple Explanation</TabsTrigger>
                  <TabsTrigger value="wording">Standard Wording</TabsTrigger>
                  <TabsTrigger value="risks">Implications & Risks</TabsTrigger>
                </TabsList>
                <div className="mt-4 p-4 bg-background/50 rounded-lg min-h-[300px]">
                  <TabsContent value="explanation" className="m-0">
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {selectedClause.simpleExplanation}
                    </p>
                  </TabsContent>
                  <TabsContent value="wording" className="m-0">
                    <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground">
                      {selectedClause.standardWording}
                    </blockquote>
                  </TabsContent>
                  <TabsContent value="risks" className="m-0">
                     <Card className={cn(riskCardClass[selectedClause.riskLevel])}>
                        <CardHeader className="flex-row items-center gap-3 space-y-0">
                            <AlertTriangle className={cn("h-5 w-5", riskTextClass[selectedClause.riskLevel])} />
                            <CardTitle className={cn("text-lg", riskTextClass[selectedClause.riskLevel])}>
                                {selectedClause.riskLevel} Risk
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-base text-muted-foreground leading-relaxed">
                            {selectedClause.implicationsAndRisks}
                            </p>
                        </CardContent>
                     </Card>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClauseExplorer;
