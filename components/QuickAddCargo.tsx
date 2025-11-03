import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { PREDEFINED_CARGO_LIST, PredefinedCargo } from '../predefinedCargo';

interface QuickAddCargoProps {
    onAddItem: (item: PredefinedCargo) => void;
}

const QuickAddCargo: React.FC<QuickAddCargoProps> = ({ onAddItem }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card>
            <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex justify-between items-center">
                    <CardTitle>Quick Add (S2008 List)</CardTitle>
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </CardHeader>
            {isOpen && (
                <CardContent>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {PREDEFINED_CARGO_LIST.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-md">
                                <div className="text-sm">
                                    <p className="font-semibold text-gray-200">{item.name}</p>
                                    <p className="text-gray-400">{item.length}x{item.width}x{item.height}mm, {item.weight}kg</p>
                                </div>
                                <Button onClick={() => onAddItem(item)} variant="outline" className="py-1 px-3 text-xs">
                                    Add
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default QuickAddCargo;
