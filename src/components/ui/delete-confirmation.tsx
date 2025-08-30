import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteConfirmationProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  triggerClassName?: string;
  isLoading?: boolean;
}

const DeleteConfirmation = ({ 
  onConfirm, 
  title = "Hapus Transaksi", 
  description = "Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.",
  triggerClassName,
  isLoading = false
}: DeleteConfirmationProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "h-8 w-8 p-0 group relative overflow-hidden cursor-pointer",
            "hover:bg-error/10 hover:text-error transition-all duration-200",
            "hover:scale-110 active:scale-95",
            "before:absolute before:inset-0 before:bg-error/20 before:rounded-full",
            "before:scale-0 before:transition-transform before:duration-300",
            "hover:before:scale-100",
            triggerClassName
          )}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4 relative z-10 transition-transform duration-200 group-hover:rotate-12" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="animate-scale-in">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-error/10 rounded-full animate-bounce-in">
              <AlertTriangle className="h-6 w-6 text-error" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-muted-foreground mt-3">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:scale-105 transition-transform duration-200">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-error hover:bg-error/90 text-error-foreground hover:scale-105 active:scale-95 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menghapus...</span>
              </div>
            ) : (
              "Hapus"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmation;