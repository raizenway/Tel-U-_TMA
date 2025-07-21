import React from 'react';

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: string;
  className?: string;
  id?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  variant,
  className,
  id,
  onClick,
  children,
}) => {
  const variantClass = variant ? `btn-${variant}` : '';
  const combinedClass = `btn-component ${variantClass} ${className || ''}`.trim();

  return (
    <button
      type={type}
      id={id}
      onClick={onClick}
      className={combinedClass}
    >
      {children}
    </button>
  );
};

export default Button;
