import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Error state */
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-lg border px-3 py-2 text-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/30 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${
        error ? "border-red-500" : "border-gray-300"
      } ${className}`.trim()}
      {...props}
    />
  )
);

Input.displayName = "Input";
