import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

const SelectContext = createContext<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedValue: string | number | null;
  setSelectedValue: (value: string | number) => void;
  displayedValue: React.ReactNode;
  setDisplayedValue: (value: React.ReactNode) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
  selectedValue: null,
  setSelectedValue: () => {},
  displayedValue: null,
  setDisplayedValue: () => {},
});

export const Select: React.FC<{ children: React.ReactNode; value?: string | number; onValueChange?: (value: string) => void; }> = ({ children, value, onValueChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | number | null>(value || null);
    const [displayedValue, setDisplayedValue] = useState<React.ReactNode>(null);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);
    
    useEffect(() => {
        // Find and set the displayed text based on the current selectedValue
        let found = false;
        React.Children.forEach(children, child => {
            if (React.isValidElement(child) && child.type === SelectContent) {
                React.Children.forEach((child.props as any).children, item => {
                    if(React.isValidElement(item) && (item.props as any).value === selectedValue) {
                        setDisplayedValue((item.props as any).children);
                        found = true;
                    }
                });
            }
        });
        if (!found) {
            // Reset if the selected value is not in the options or for the initial placeholder
            setDisplayedValue(null);
        }
    }, [selectedValue, children]);

    const contextValue = {
        isOpen,
        setIsOpen,
        selectedValue,
        setSelectedValue: (val: string | number) => {
            setSelectedValue(val);
            if (onValueChange) onValueChange(String(val));
        },
        displayedValue,
        setDisplayedValue,
    };

    return (
        <SelectContext.Provider value={contextValue}>
            <div className="relative" ref={selectRef}>{children}</div>
        </SelectContext.Provider>
    );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string; id?: string; }> = ({ children, className = '', id }) => {
    const { isOpen, setIsOpen } = useContext(SelectContext);
    return (
        <button
            id={id}
            type="button"
            className={`w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-left text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition flex justify-between items-center ${className}`}
            onClick={() => setIsOpen(!isOpen)}
        >
            {children}
            <svg className={`-mr-1 ml-2 h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>
    );
};

export const SelectValue: React.FC<{ placeholder?: string; }> = ({ placeholder }) => {
    const { displayedValue } = useContext(SelectContext);
    return <>{displayedValue || placeholder}</>;
};

export const SelectContent: React.FC<{ children: React.ReactNode; className?: string; }> = ({ children, className = '' }) => {
    const { isOpen } = useContext(SelectContext);
    if (!isOpen) return null;

    return (
        <div className={`absolute z-10 mt-1 w-full bg-gray-800 shadow-lg rounded-md border border-gray-700 ${className}`}>
            <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {children}
            </ul>
        </div>
    );
};

export const SelectItem: React.FC<{ children: React.ReactNode; value: string | number; className?: string; }> = ({ children, value, className = '' }) => {
    const { setSelectedValue, setIsOpen, setDisplayedValue, selectedValue } = useContext(SelectContext);

    const handleSelect = () => {
        setSelectedValue(value);
        setDisplayedValue(children);
        setIsOpen(false);
    };
    
    const isSelected = selectedValue === value;

    return (
        <li
            className={`text-gray-200 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-cyan-600/50 ${isSelected ? 'bg-cyan-500/30' : ''} ${className}`}
            onClick={handleSelect}
        >
            <span className={`block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>{children}</span>
        </li>
    );
};
