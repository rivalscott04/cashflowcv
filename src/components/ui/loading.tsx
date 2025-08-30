import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const Loading = ({ 
  size = 'md', 
  text = 'Memuat...', 
  className,
  fullScreen = false 
}: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      fullScreen && 'min-h-screen',
      className
    )}>
      <Loader2 className={cn(
        'animate-spin text-primary',
        sizeClasses[size]
      )} />
      {text && (
        <p className={cn(
          'text-muted-foreground font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton loading components
interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div className={cn(
      'animate-pulse rounded-md bg-muted',
      className
    )} />
  );
};

// Card skeleton for consistent loading states
export const CardSkeleton = () => {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
    </div>
  );
};

// Table skeleton for loading tables
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4 p-4 border-b">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex space-x-4 p-4">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      ))}
    </div>
  );
};

export default Loading;