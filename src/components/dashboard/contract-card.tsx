
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, FileText, Download, Eye, Trash2, Calendar, Bot } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Contract } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

type ContractCardProps = {
  contract: Contract;
  onViewDetails: () => void;
  onDownloadReport: () => void;
  onDelete: () => void;
  onStartNegotiation?: () => void;
};

const riskLevelToVariant = (
  level: string | undefined
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

const getFileIcon = (fileName: string) => {
    if (fileName.includes('.pdf')) {
        return <FileText className="h-6 w-6 text-red-400" />;
    }
    if (fileName.includes('.docx')) {
        return <FileText className="h-6 w-6 text-blue-400" />;
    }
    return <FileText className="h-6 w-6 text-gray-400" />;
}


export default function ContractCard({
  contract,
  onViewDetails,
  onDownloadReport,
  onDelete,
  onStartNegotiation,
}: ContractCardProps) {

  const canStartNegotiation = (contract.riskLevel === 'Medium' || contract.riskLevel === 'High') && contract.status === 'Analyzed';

  return (
    <Card className="glass-card hover:border-primary/50 transition-all duration-300 flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
           {getFileIcon(contract.name)}
          <CardTitle className="text-base font-bold text-foreground leading-snug truncate" title={contract.name}>{contract.name}</CardTitle>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mt-2 -mr-2 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewDetails} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownloadReport} className="cursor-pointer" disabled={contract.status !== 'Analyzed'}>
                    <Download className="mr-2 h-4 w-4" /> Download Report
                </DropdownMenuItem>
                {onStartNegotiation && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onStartNegotiation} className="cursor-pointer text-accent focus:text-accent focus:bg-accent/10" disabled={!canStartNegotiation}>
                            <Bot className="mr-2 h-4 w-4" /> Start Negotiation
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          Analyzed {contract.clauses || 0} clauses. 
          {contract.highRiskClauses ? ` Found ${contract.highRiskClauses} high-risk items.` : ' No major risks found.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-white/5 py-3 px-4">
         <Badge variant={riskLevelToVariant(contract.riskLevel)}>
            {contract.riskLevel || contract.status}
          </Badge>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
             {contract.analyzedAt ? formatDistanceToNow(new Date(contract.analyzedAt), { addSuffix: true }) : 'N/A'}
        </div>
      </CardFooter>
    </Card>
  );
}
