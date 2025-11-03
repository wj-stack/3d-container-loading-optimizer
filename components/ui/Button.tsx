
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'primary', ...props }) => {
    const baseClasses = "font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
        primary: "bg-cyan-500 hover:bg-cyan-600 text-white focus:ring-cyan-400",
        outline: "bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white focus:ring-cyan-400"
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
        />
    );
};
