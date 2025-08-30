import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, X, CheckCircle } from "lucide-react";
import AnimatedButton from "@/components/ui/animated-button";
import FileUpload from "@/components/ui/file-upload";

interface TransactionFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

const TransactionForm = ({ onSubmit, onCancel, initialData }: TransactionFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    description: initialData?.description || "",
    type: initialData?.type || "",
    category: initialData?.category || "",
    amount: initialData?.amount || "",
    invoiceFile: initialData?.invoiceFile || null,
    taxInvoiceFile: initialData?.taxInvoiceFile || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.type || !formData.amount) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmit?.(formData);
      
      setIsSuccess(true);
      toast({
        title: "Berhasil!",
        description: "Transaksi berhasil disimpan",
      });

      // Reset form after success animation
      setTimeout(() => {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          description: "",
          type: "",
          category: "",
          amount: "",
          invoiceFile: null,
          taxInvoiceFile: null,
        });
        setIsLoading(false);
        setIsSuccess(false);
      }, 1000);
    }, 1500);
  };

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Tambah Transaksi Baru</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full hover:border-primary/50 focus:border-primary transition-colors duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Jenis Transaksi</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="hover:border-primary/50 focus:border-primary transition-colors duration-200">
                  <SelectValue placeholder="Pilih jenis transaksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Pendapatan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Masukkan deskripsi transaksi..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="hover:border-primary/50 focus:border-primary transition-colors duration-200"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="hover:border-primary/50 focus:border-primary transition-colors duration-200">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="penjualan">Penjualan</SelectItem>
                  <SelectItem value="operasional">Operasional</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="gaji">Gaji & Tunjangan</SelectItem>
                  <SelectItem value="pajak">Pajak</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full hover:border-primary/50 focus:border-primary transition-colors duration-200"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Dokumen Pendukung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload
                label="Invoice"
                placeholder="Upload file invoice..."
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={300 * 1024} // 300KB
                value={formData.invoiceFile}
                onChange={(file) => setFormData({ ...formData, invoiceFile: file })}
              />
              
              <FileUpload
                label="Faktur Pajak"
                placeholder="Upload faktur pajak..."
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={300 * 1024} // 300KB
                value={formData.taxInvoiceFile}
                onChange={(file) => setFormData({ ...formData, taxInvoiceFile: file })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <AnimatedButton 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                leftIcon={X}
                animation="scale"
                disabled={isLoading}
              >
                Batal
              </AnimatedButton>
            )}
            <AnimatedButton 
              type="submit" 
              variant={isSuccess ? "success" : "gradient"}
              leftIcon={isSuccess ? CheckCircle : Save}
              animation={isSuccess ? "bounce" : "scale"}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isSuccess ? "Tersimpan!" : "Simpan Transaksi"}
            </AnimatedButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;