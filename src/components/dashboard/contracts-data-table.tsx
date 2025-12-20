
import {
  MoreHorizontal,
  FileText,
  Trash2,
  Eye,
  Download,
  ShieldAlert,
  Frown,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {Contract} from '@/lib/types';
import {Skeleton} from '@/components/ui/skeleton';
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
import {useState} from 'react';
import {useUser} from '@/firebase/provider';
import ContractCard from './contract-card';

type ContractsDataTableProps = {
  data: Contract[];
  isLoading: boolean;
  onViewDetails: (contract: Contract) => void;
  onDelete: (contractId: string) => void;
  onDownloadReport: (contract: Contract) => void;
  onStartNegotiation?: (contract: Contract) => void;
};

export default function ContractsDataTable({
  data,
  isLoading,
  onViewDetails,
  onDelete,
  onDownloadReport,
  onStartNegotiation
}: ContractsDataTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null
  );
  const {user} = useUser();

  const handleDeleteClick = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contractToDelete) {
      onDelete(contractToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setContractToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({length: 3}).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="h-48 w-full bg-slate-200" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-semibold text-slate-800">
          No contracts analyzed yet
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Get started by analyzing your first contract.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(contract => (
          <ContractCard
            key={contract.id}
            contract={contract}
            onViewDetails={() => onViewDetails(contract)}
            onDownloadReport={() => onDownloadReport(contract)}
            onDelete={() => handleDeleteClick(contract)}
          />
        ))}
      </div>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              analysis for "{contractToDelete?.name}" from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
