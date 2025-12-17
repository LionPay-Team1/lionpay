import React from 'react';
import { Loader2 } from 'lucide-react';
// Note: clsx is not installed in management, just using template literals for now to be safe or assuming simple classes.
// Wait, I didn't install clsx. I'll stick to simple strings or install it. 
// Actually, `lionpay-app` had it. `lionpay-management` I only installed router/axios.
// I'll stick to vanilla CSS classes as per plan but use a helper if complex. 
// I'll just use className string for now.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled, 
  ...props 
}: ButtonProps) {
  const baseClass = "btn";
  const variantClass = `btn-${variant}`;
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${className}`} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="spinner" size={16} />}
      {children}
    </button>
  );
}
