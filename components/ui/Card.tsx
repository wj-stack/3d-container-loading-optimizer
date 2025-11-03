
import React from 'react';

// FIX: Updated Card components to accept standard HTML attributes (e.g., onClick)
// by extending props with React.HTMLAttributes. This makes them more flexible and
// fixes the type error when using onClick on CardHeader in QuickAddCargo.tsx.
export const Card: React.FC<{ children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`bg-gray-800 rounded-xl shadow-lg ${className}`} {...props}>
        {children}
    </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`p-4 sm:p-6 border-b border-gray-700 ${className}`} {...props}>
        {children}
    </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
    <h2 className={`text-lg font-semibold text-white ${className}`} {...props}>
        {children}
    </h2>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`p-4 sm:p-6 ${className}`} {...props}>
        {children}
    </div>
);
