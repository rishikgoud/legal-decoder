
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
import { MoreHorizontal, FileText, Download, Eye, Trash2, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Contract } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

type ContractCardProps = {
  contract: Contract;
  onViewDetails: () => void;
  onDownloadReport: () => void;
  onDelete: () => void;
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
        return <FileText className="h-6 w-6 text-red-500" />;
    }
    if (fileName.includes('.docx')) {
        return <FileText className="h-6 w-6 text-blue-500" />;
    }
    return <FileText className="h-6 w-6 text-gray-500" />;
}


export default function ContractCard({
  contract,
  onViewDetails,
  onDownloadReport,
  onDelete,
}: ContractCardProps) {
  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
        <div className="flex-1">
          <div className="flex items-center gap-3">
             {getFileIcon(contract.name)}
            <CardTitle className="text-base font-bold text-slate-800 leading-snug truncate">{contract.name}</CardTitle>
          </div>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mt-2 -mr-2">
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewDetails} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownloadReport} className="cursor-pointer">
                    <Download className="mr-2 h-4 w-4" /> Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500 cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <p className="text-sm text-slate-600 line-clamp-2">
          Analyzed {contract.clauses || 0} clauses. 
          {contract.highRiskClauses ? ` Found ${contract.highRiskClauses} high-risk items.` : ' No major risks found.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-slate-50/50 py-3 px-4">
         <Badge variant={riskLevelToVariant(contract.riskLevel)}>
            {contract.riskLevel || contract.status}
          </Badge>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
             {contract.analyzedAt ? formatDistanceToNow(new Date(contract.analyzedAt), { addSuffix: true }) : 'N/A'}
        </div>
      </CardFooter>
    </Card>
  );
}
