import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

interface ChartData {
  month: string;
  income: number;
  expense: number;
}

interface RevenueChartProps {
  data?: ChartData[];
  isLoading?: boolean;
}

const RevenueChart = ({ data, isLoading }: RevenueChartProps) => {
  // Transform data for chart
  const chartData = data?.map(item => ({
    name: item.month,
    pendapatan: item.income,
    pengeluaran: item.expense
  })) || [];

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold mb-4">Grafik Pendapatan & Pengeluaran</h3>
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Memuat data grafik...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold mb-4">Grafik Pendapatan & Pengeluaran</h3>
        <div className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">Tidak ada data untuk ditampilkan</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-6">
      <h3 className="text-lg font-semibold mb-4">Grafik Pendapatan & Pengeluaran</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            className="text-muted-foreground"
          />
          <YAxis 
            tickFormatter={formatCurrency}
            className="text-muted-foreground"
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), '']}
            labelClassName="text-foreground"
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="pendapatan" 
            stroke="hsl(var(--success))" 
            strokeWidth={2}
            name="Pendapatan"
          />
          <Line 
            type="monotone" 
            dataKey="pengeluaran" 
            stroke="hsl(var(--destructive))" 
            strokeWidth={2}
            name="Pengeluaran"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;