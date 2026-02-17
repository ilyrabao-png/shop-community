import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white overflow-hidden ${className}`.trim()}
      {...props}
    />
  );
}

export interface CardImageProps extends HTMLAttributes<HTMLDivElement> {}

export function CardImage({ className = "", ...props }: CardImageProps) {
  return (
    <div
      className={`aspect-square w-full bg-gray-100 relative overflow-hidden ${className}`.trim()}
      {...props}
    />
  );
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function CardBody({ className = "", ...props }: CardBodyProps) {
  return <div className={`p-4 space-y-1 ${className}`.trim()} {...props} />;
}
