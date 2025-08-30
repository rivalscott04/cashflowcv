import Navbar from "@/components/layout/Navbar";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionTable from "@/components/transactions/TransactionTable";

const Transactions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Kelola Transaksi</h1>
          <p className="text-muted-foreground">Tambah, edit, dan kelola semua transaksi keuangan</p>
        </div>

        <div className="space-y-8">
          <TransactionForm />
          <TransactionTable />
        </div>
      </div>
    </div>
  );
};

export default Transactions;