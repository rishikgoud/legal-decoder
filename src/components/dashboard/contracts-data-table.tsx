
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {MoreHorizontal, Loader2, FileText, AlertTriangle, ShieldCheck, BarChart, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import { format } from 'date-fns';
import { Contract } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ContractsDataTableProps = {
  title: string;
  data: Contract[];
  isLoading: boolean;
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

const RiskIcon = ({ level }: { level: Contract['riskLevel'] }) => {
    switch (level) {
        case 'High': return <AlertTriangle className="h-4 w-4" />;
        case 'Medium': return <AlertTriangle className="h-4 w-4" />;
        case 'Low': return <ShieldCheck className="h-4 w-4" />;
        default: return null;
    }
}

export default function ContractsDataTable({
  title,
  data,
  isLoading,
}: ContractsDataTableProps) {
  return (
    <Card className="bg-white/5 border-white/10 glass-card">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-heading !text-white">{title}</CardTitle>
        <CardDescription className="!text-muted-foreground">
          A list of your recently analyzed contracts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={`skeleton-${i}`} className="h-24 w-full bg-white/10" />
                ))}
            </div>
        )}
        {!isLoading && data && data.length > 0 && (
            <div className="space-y-4">
            {data.map(contract => (
              <Card key={contract.id} className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors group">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className='flex-1 overflow-hidden'>
                    <div className="flex items-center gap-3">
                         <FileText className="w-5 h-5 text-primary flex-shrink-0"/>
                         <h3 className="font-bold text-md sm:text-lg text-white truncate">{contract.name}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Badge variant={riskLevelToVariant(contract.riskLevel)} className="flex items-center gap-1.5 py-1 px-2.5 text-xs">
                                <RiskIcon level={contract.riskLevel} />
                                {contract.riskLevel} Risk
                            </Badge>
                        </div>
                         <div className="flex items-center gap-1.5">
                            <BarChart className="w-4 h-4" /> {contract.clauses} Clauses
                         </div>
                         {contract.highRiskClauses !== undefined && contract.highRiskClauses > 0 && (
                             <div className="flex items-center gap-1.5 text-risk-high">
                                 <AlertTriangle className="w-4 h-4" /> {contract.highRiskClauses} High-Risk
                             </div>
                         )}
                         <div className="hidden sm:flex items-center gap-1.5">
                             <Calendar className="w-4 h-4" /> {contract.analyzedAt ? format(new Date(contract.analyzedAt), 'PP') : 'N/A'}
                         </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/10 h-8 w-8 sm:h-9 sm:w-9">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border-white/20">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Download Report</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 focus:text-red-400">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
        )}
         {!isLoading && (!data || data.length === 0) && (
              <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-white">No contracts analyzed yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Get started by analyzing your first contract.</p>
              </div>
        )}
      </CardContent>
    </Card>
  );
}
