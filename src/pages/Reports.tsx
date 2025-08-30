import { FileText, Download, TrendingUp, Calculator, Settings, FileSpreadsheet, TrendingDown, DollarSign, Database, Loader2 } from "lucide-react";
 import { useState } from "react";
 import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedButton from "@/components/ui/animated-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";
import { useReportsData } from "@/hooks/useReports";

const Reports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [showKopDialog, setShowKopDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [companyHeader, setCompanyHeader] = useState({
    companyName: '',
    address: '',
    phone: '',
    email: ''
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  const { summary, reports, isLoading, isError, error } = useReportsData();
  
  // Icon mapping untuk laporan
  const getReportIcon = (type: string) => {
    switch (type) {
      case 'profit-loss': return TrendingUp;
      case 'balance-sheet': return Calculator;
      case 'cash-flow': return FileText;
      case 'tax-report': return FileText;
      default: return FileText;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleDownloadPDF = (reportType: string) => {
    setSelectedReport(reportType);
    setShowKopDialog(true);
  };

  const handleQuickDownloadPDF = async (reportType: string) => {
    try {
      setLoading(`pdf-${reportType}`);
      
      // Use default date range (current month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];
      
      // Call API to generate PDF (will use company header from settings)
      const pdfBlob = await api.reports.generatePDF(
        reportType,
        startDate,
        endDate,
        null // Let backend use saved company header settings
      );
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Berhasil",
        description: `Laporan ${reportType} berhasil didownload sebagai PDF`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mendownload laporan PDF",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const generatePDFWithKop = async () => {
    try {
      setLoading(`pdf-${selectedReport}`);
      
      // Validate date range
      if (!dateRange.startDate || !dateRange.endDate) {
        toast({
          title: "Error",
          description: "Mohon pilih periode laporan",
          variant: "destructive"
        });
        return;
      }
      
      // Call API to generate PDF with company header
      const pdfBlob = await api.reports.generatePDF(
        selectedReport,
        dateRange.startDate,
        dateRange.endDate,
        companyHeader.companyName ? companyHeader : null
      );
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedReport}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setShowKopDialog(false);
      toast({
        title: "Berhasil",
        description: `Laporan ${selectedReport} berhasil didownload sebagai PDF`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mendownload laporan PDF",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleExportExcel = async (reportType: string) => {
    try {
      setLoading(`excel-${reportType}`);
      
      // Simulate API call for Excel generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock Excel download
      const csvContent = `Laporan ${reportType}\nTanggal,Deskripsi,Jumlah\n2025-01-01,Pendapatan,1000000\n2025-01-02,Pengeluaran,-500000`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Berhasil",
        description: `Laporan ${reportType} berhasil diexport sebagai Excel`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengexport laporan Excel",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateAllReports = async () => {
    try {
      setLoading('generate-all');
      
      // Simulate generating all reports
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Berhasil",
        description: "Semua laporan berhasil digenerate",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengenerate laporan",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Laporan Keuangan</h1>
          <p className="text-muted-foreground">Export dan analisis laporan keuangan untuk keperluan pajak dan bisnis</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            // Loading state for summary cards
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-8 bg-muted animate-pulse rounded w-32"></div>
                    </div>
                    <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : isError ? (
            <Card className="shadow-card col-span-3">
              <CardContent className="p-6 text-center">
                <p className="text-error">Gagal memuat ringkasan laporan</p>
                <p className="text-sm text-muted-foreground mt-1">{error?.message}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="shadow-card bg-success-background border-success/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-success font-medium">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-success">{formatCurrency(summary.data?.totalIncome || 0)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-error-background border-error/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-error font-medium">Total Pengeluaran</p>
                      <p className="text-2xl font-bold text-error">{formatCurrency(summary.data?.totalExpense || 0)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-error rotate-180" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary font-medium">Laba Bersih</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(summary.data?.netProfit || 0)}</p>
                    </div>
                    <Calculator className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Reports List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.isLoading ? (
            // Loading state for reports
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 bg-muted animate-pulse rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-5 bg-muted animate-pulse rounded w-32"></div>
                        <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 w-12 bg-muted animate-pulse rounded-full"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted animate-pulse rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-muted animate-pulse rounded flex-1"></div>
                    <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
                    <div className="h-8 bg-muted animate-pulse rounded flex-1"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : reports.isError ? (
            <Card className="shadow-card col-span-2">
              <CardContent className="p-6 text-center">
                <p className="text-error">Gagal memuat daftar laporan</p>
                <p className="text-sm text-muted-foreground mt-1">{reports.error?.message}</p>
              </CardContent>
            </Card>
          ) : reports.data && reports.data.length > 0 ? (
            reports.data.map((report, index) => {
              const ReportIcon = getReportIcon(report.type);
              return (
                <Card 
                  key={report.id} 
                  className="shadow-card hover:shadow-floating transition-all duration-300 hover:scale-105 animate-fade-in group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:rotate-12 transition-transform duration-200">
                          <ReportIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{report.period}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={report.status === "ready" ? "default" : "secondary"}
                        className={report.status === "ready" ? "bg-success text-success-foreground" : ""}
                      >
                        {report.status === "ready" ? "Siap" : "Diproses"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                    <div className="flex space-x-2">
                      <div className="flex gap-2 flex-1">
                        <AnimatedButton 
                          size="sm" 
                          variant="gradient"
                          leftIcon={Download}
                          animation="scale"
                          disabled={report.status !== "ready" || loading === `pdf-${report.title}`}
                          className="flex-1"
                          onClick={() => handleQuickDownloadPDF(report.title)}
                        >
                          {loading === `pdf-${report.title}` ? "Generating..." : "Download PDF"}
                        </AnimatedButton>
                        <AnimatedButton 
                          size="sm" 
                          variant="outline" 
                          animation="scale"
                          disabled={report.status !== "ready" || loading === `pdf-${report.title}`}
                          onClick={() => handleDownloadPDF(report.title)}
                        >
                          <Settings className="h-4 w-4" />
                        </AnimatedButton>
                      </div>
                      <AnimatedButton 
                         size="sm" 
                         variant="outline" 
                         leftIcon={FileSpreadsheet}
                         animation="scale"
                         disabled={report.status !== "ready" || loading === `excel-${report.title}`}
                         className="flex-1 hover:border-primary hover:text-primary"
                         onClick={() => handleExportExcel(report.title)}
                       >
                         {loading === `excel-${report.title}` ? "Exporting..." : "Export Excel"}
                       </AnimatedButton>
                     </div>
                   </CardContent>
                 </Card>
               );
             })
           ) : (
             <Card className="shadow-card col-span-2">
               <CardContent className="p-6 text-center">
                 <p className="text-muted-foreground">Tidak ada laporan tersedia</p>
               </CardContent>
             </Card>
           )}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card mt-8">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatedButton 
                variant="gradient"
                animation="bounce"
                className="h-16"
                disabled={loading === 'generate-all'}
                onClick={handleGenerateAllReports}
              >
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm">{loading === 'generate-all' ? 'Generating...' : 'Generate Semua Laporan'}</span>
                </div>
              </AnimatedButton>
              <AnimatedButton 
                variant="outline" 
                animation="scale"
                className="h-16 hover:border-primary hover:text-primary"
              >
                <div className="text-center">
                  <Calculator className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm">Hitung Pajak Bulanan</span>
                </div>
              </AnimatedButton>
              <AnimatedButton 
                variant="outline" 
                animation="scale"
                className="h-16 hover:border-primary hover:text-primary"
              >
                <div className="text-center">
                  <Download className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm">Backup Data</span>
                </div>
              </AnimatedButton>
            </div>
          </CardContent>
        </Card>

        {/* Company Header Dialog */}
        <Dialog open={showKopDialog} onOpenChange={setShowKopDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Pengaturan Kop Laporan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nama Perusahaan (Opsional)</Label>
                <Input
                  id="companyName"
                  value={companyHeader.companyName}
                  onChange={(e) => setCompanyHeader(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="PT. Contoh Perusahaan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat (Opsional)</Label>
                <Input
                  id="address"
                  value={companyHeader.address}
                  onChange={(e) => setCompanyHeader(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Jl. Contoh No. 123"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon (Opsional)</Label>
                  <Input
                    id="phone"
                    value={companyHeader.phone}
                    onChange={(e) => setCompanyHeader(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="021-123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Opsional)</Label>
                  <Input
                    id="email"
                    value={companyHeader.email}
                    onChange={(e) => setCompanyHeader(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="info@contoh.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal Mulai *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Akhir *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowKopDialog(false)}
                  className="flex-1 cursor-pointer"
                >
                  Batal
                </Button>
                <AnimatedButton 
                  onClick={generatePDFWithKop}
                  disabled={loading === `pdf-${selectedReport}`}
                  className="flex-1"
                >
                  {loading === `pdf-${selectedReport}` ? 'Generating...' : 'Download PDF'}
                </AnimatedButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Reports;