import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-[#374151] bg-[#111827] px-3 py-1 text-sm text-[#f9fafb] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#6b7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:border-[#f59e0b] disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
