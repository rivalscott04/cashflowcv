import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import DeleteConfirmation from "@/components/ui/delete-confirmation";
import { useToast } from "@/hooks/use-toast";
import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions";

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "income" | "expense";
  category: string;
  amount: number;
}

interface TransactionTableProps {
  onEdit?: (transaction: Transaction) => void;
}

const TransactionTable = ({ onEdit }: TransactionTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: transactions, isLoading, isError, error } = useTransactions();
  const deleteTransactionMutation = useDeleteTransaction();

  // Sample data
  const sampleTransactions: Transaction[] = [
    {
      id: "1",
      date: "2025-08-30",
      description: "Invoice Client A - Website Development",
      type: "income",
      category: "penjualan",
      amount: 15000000
    },
    {
      id: "2",
      date: "2025-08-29",
      description: "Bayar Hosting Server",
      type: "expense",
      category: "operasional",
      amount: 500000
    },
    {
      id: "3",
      date: "2025-08-28",
      description: "Facebook Ads Campaign",
      type: "expense",
      category: "marketing",
      amount: 2000000
    },
    {
      id: "4",
      date: "2025-08-27",
      description: "Konsultasi Project B",
      type: "income",
      category: "penjualan",
      amount: 5000000
    }
  ];

  const filteredTransactions = transactions?.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    deleteTransactionMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil dihapus",
        });
        setDeletingId(null);
      },
      onError: () => {
        setDeletingId(null);
      }
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <CardTitle>Daftar Transaksi</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 hover:border-primary/50 focus:border-primary transition-colors duration-200"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tanggal</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Deskripsi</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Kategori</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Jenis</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Jumlah</th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Memuat transaksi...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="text-error">
                      <p>Gagal memuat transaksi</p>
                      <p className="text-sm text-muted-foreground mt-1">{error?.message}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {searchTerm ? "Tidak ada transaksi yang sesuai dengan pencarian" : "Belum ada transaksi"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <tr 
                    key={transaction.id} 
                    className="border-b border-border/50 hover:bg-muted/30 transition-all duration-200 hover:scale-[1.01] animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-foreground">{transaction.description}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm text-muted-foreground capitalize">{transaction.category}</span>
                    </td>
                    <td className="py-3 px-2">
                      <Badge 
                        variant={transaction.type === "income" ? "default" : "secondary"}
                        className={
                          transaction.type === "income" 
                            ? "bg-success text-success-foreground" 
                            : "bg-error text-error-foreground"
                        }
                      >
                        {transaction.type === "income" ? "Pendapatan" : "Pengeluaran"}
                      </Badge>
                    </td>
                    <td className={`py-3 px-2 text-right font-semibold ${
                      transaction.type === "income" ? "text-success" : "text-error"
                    }`}>
                      {transaction.type === "expense" ? "- " : "+ "}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit?.(transaction)}
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110 group"
                        >
                          <Edit className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                        </Button>
                        <DeleteConfirmation
                          onConfirm={() => handleDelete(transaction.id)}
                          title="Hapus Transaksi"
                          description={`Apakah Anda yakin ingin menghapus transaksi "${transaction.description}"? Tindakan ini tidak dapat dibatalkan.`}
                          isLoading={deletingId === transaction.id || deleteTransactionMutation.isPending}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          

        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionTable;