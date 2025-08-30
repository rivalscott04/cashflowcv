import React from "react";
import { Input } from "./input";
import { formatNumber, parseFormattedNumber } from "@/utils/formatters";

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, 'type' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder = "0", className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formattedValue = formatNumber(inputValue);
      onChange(formattedValue);
    };

    const handleBlur = () => {
      // Ensure the value is properly formatted on blur
      if (value) {
        const formattedValue = formatNumber(value);
        onChange(formattedValue);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
