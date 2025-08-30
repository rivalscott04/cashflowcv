import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "warning" | "gradient";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  animation?: "bounce" | "scale" | "slide" | "shake" | "pulse";
  children: React.ReactNode;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    isLoading = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    animation = "scale",
    children,
    disabled,
    ...props 
  }, ref) => {
    
    const getAnimationClass = () => {
      switch (animation) {
        case "bounce":
          return "hover:animate-bounce";
        case "scale":
          return "hover:scale-105 active:scale-95";
        case "slide":
          return "hover:translate-x-1";
        case "shake":
          return "hover:animate-shake";
        case "pulse":
          return "hover:animate-pulse";
        default:
          return "hover:scale-105 active:scale-95";
      }
    };

    const getVariantStyles = () => {
      switch (variant) {
        case "success":
          return "bg-success hover:bg-success/90 text-success-foreground shadow-lg hover:shadow-success/25";
        case "warning":
          return "bg-warning hover:bg-warning/90 text-warning-foreground shadow-lg hover:shadow-warning/25";
        case "gradient":
          return "bg-gradient-primary hover:opacity-90 text-white shadow-lg hover:shadow-primary/25";
        default:
          return "";
      }
    };

    return (
      <Button
        ref={ref}
        variant={variant === "success" || variant === "warning" || variant === "gradient" ? "default" : variant}
        size={size}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          getAnimationClass(),
          getVariantStyles(),
          "before:absolute before:inset-0 before:bg-white/20 before:rounded-lg",
          "before:scale-0 before:transition-transform before:duration-300",
          "hover:before:scale-100",
          "focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className="relative z-10 flex items-center space-x-2">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            LeftIcon && <LeftIcon className="h-4 w-4" />
          )}
          <span>{children}</span>
          {RightIcon && <RightIcon className="h-4 w-4" />}
        </span>
      </Button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export default AnimatedButton;