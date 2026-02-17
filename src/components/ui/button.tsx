import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** @default "button" */
  type?: "button" | "submit" | "reset";
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-black text-white hover:bg-gray-800 active:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-50 disabled:text-gray-400",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", type = "button", className = "", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-black/30 focus:ring-offset-2 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    />
  )
);

Button.displayName = "Button";
