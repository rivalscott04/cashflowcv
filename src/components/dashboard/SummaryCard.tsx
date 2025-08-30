import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  variant: "income" | "expense" | "profit";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const SummaryCard = ({ title, amount, icon: Icon, variant, trend }: SummaryCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "income":
        return "border-success/20 bg-success-background";
      case "expense":
        return "border-error/20 bg-error-background";
      case "profit":
        return "border-primary/20 bg-gradient-card";
      default:
        return "";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "income":
        return "text-success bg-success/10";
      case "expense":
        return "text-error bg-error/10";
      case "profit":
        return "text-primary bg-primary/10";
      default:
        return "";
    }
  };

  return (
    <Card className={cn("shadow-card transition-all duration-300 hover:shadow-floating hover:scale-105 cursor-pointer group animate-fade-in", getVariantStyles())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-full transition-transform duration-200 group-hover:rotate-12", getIconStyles())}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{formatCurrency(amount)}</div>
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            trend.isPositive ? "text-success" : "text-error"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}% dari bulan lalu
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;