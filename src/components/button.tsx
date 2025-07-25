import React from "react";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";

type ButtonType = "button" | "submit" | "reset" | "link";

interface ButtonProps {
  type?: ButtonType;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
  href?: string; // khusus untuk link
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right"| "star";
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  variant = "primary",
  size = "md",
  className,
  id,
  href,
  onClick,
  disabled = false,
  isLoading = false,
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  children,
}) => {
  const variantClassMap: Record<string, string> = {
    primary: "bg-[#263859] text-white",
    secondary: "bg-gray-300 text-gray-800 hover:bg-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    ghost: "bg-transparent text-gray-800 hover:bg-gray-100",
    outline: "border border-gray-300 text-gray-800 bg-transparent hover:bg-gray-100",

  };

  const sizeClassMap: Record<string, string> = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const baseClass = clsx(
    "rounded-md font-medium transition-all duration-200 inline-flex items-center justify-center gap-2",
    variantClassMap[variant],
    sizeClassMap[size],
    {
      "opacity-50 cursor-not-allowed": disabled || isLoading,
      "w-full": fullWidth,
    },
    className
  );

  // Jika type === "link", render <a>
  if (type === "link" && href) {
    return (
      <a
        id={id}
        href={href}
        onClick={disabled ? undefined : onClick}
        className={baseClass}
        aria-disabled={disabled}
      >
        {Icon && iconPosition === "left" && <Icon size={18} />}
        <span>{children}</span>
        {Icon && iconPosition === "right" && <Icon size={18} />}
      </a>
    );
  }

  // Render <button> biasa
  return (
    <button
      type={type as "button" | "submit" | "reset"}
      id={id}
      onClick={disabled || isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
      className={baseClass}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
          />
        </svg>
      )}
      {Icon && iconPosition === "left" && <Icon size={18} />}
      <span>{children}</span>
      {Icon && iconPosition === "right" && <Icon size={18} />}
    </button>
  );
};

export default Button;
