

import React, { useState } from 'react';
import { CargoItem, PackagingType, Container } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Button } from './ui/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/Select';
import BundlingModal from './BundlingModal';


interface CargoInputProps {
    cargoItems: CargoItem[];
    setCargoItems: React.Dispatch<React.SetStateAction<CargoItem[]>>;
    availableContainers: Container[];
}

const CargoInput: React.FC<CargoInputProps> = ({ cargoItems, setCargoItems, availableContainers }) => {
    const [bundlingItem, setBundlingItem] = useState<CargoItem | null>(null);

    const handleAddItem = () => {
        const newItem: CargoItem = {
            id: uuidv4(),
            name: `Item ${cargoItems.length + 1}`,
            length: 1000,
            width: 1000,
            height: 1000,
            weight: 100,
            quantity: 1,
            isFragile: false,
            packaging: 'other',
        };
        setCargoItems([...cargoItems, newItem]);
    };

    const handleRemoveItem = (id: string) => {
        setCargoItems(cargoItems.filter(item => item.id !== id));
    };

    const handleItemChange = (id: string, field: keyof CargoItem, value: string | number | boolean) => {
        setCargoItems(cargoItems.map(item => {
            if (item.id === id) {
                // Ensure quantity is not negative
                if (field === 'quantity' && typeof value === 'number' && value < 0) {
                    return { ...item, [field]: 0 };
                }
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleBundleConfirm = (originalItemId: string, bundledItem: Omit<CargoItem, 'id' | 'quantity'>, itemsUsed: number) => {
        setCargoItems(prevItems => {
            const originalItem = prevItems.find(item => item.id === originalItemId);
            if (!originalItem) return prevItems;

            const remainingQuantity = originalItem.quantity - itemsUsed;

            const newBundledItem: CargoItem = {
                ...bundledItem,
                id: uuidv4(),
                quantity: 1,
            };
            
            const updatedItems = prevItems.filter(item => item.id !== originalItemId);
            updatedItems.push(newBundledItem);

            if (remainingQuantity > 0) {
                 updatedItems.push({
                    ...originalItem,
                    quantity: remainingQuantity,
                 });
            }

            return updatedItems;
        });
        setBundlingItem(null);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Cargo Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {cargoItems.map((item, index) => (
                            <div key={item.id} className="p-4 bg-gray-700/50 rounded-lg space-y-3 relative">
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label="Remove item"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <div>
                                    <Label htmlFor={`name-${index}`}>Name/SKU</Label>
                                    <Input type="text" id={`name-${index}`} value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label htmlFor={`length-${index}`}>L (mm)</Label>
                                        <Input type="number" id={`length-${index}`} value={item.length} onChange={e => handleItemChange(item.id, 'length', Number(e.target.value))} />
                                    </div>
                                    <div>
                                        <Label htmlFor={`width-${index}`}>W (mm)</Label>
                                        <Input type="number" id={`width-${index}`} value={item.width} onChange={e => handleItemChange(item.id, 'width', Number(e.target.value))} />
                                    </div>
                                    <div>
                                        <Label htmlFor={`height-${index}`}>H (mm)</Label>
                                        <Input type="number" id={`height-${index}`} value={item.height} onChange={e => handleItemChange(item.id, 'height', Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor={`weight-${index}`}>Weight (kg)</Label>
                                        <Input type="number" id={`weight-${index}`} value={item.weight} onChange={e => handleItemChange(item.id, 'weight', Number(e.target.value))} />
                                    </div>
                                    <div className="relative">
                                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                                        <Input type="number" id={`quantity-${index}`} value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))} />
                                        {item.quantity > 1 && (
                                            <button
                                                onClick={() => setBundlingItem(item)}
                                                className="absolute right-1 bottom-1.5 p-1 text-gray-400 hover:text-cyan-400 transition-colors rounded-md bg-gray-800/50 hover:bg-gray-700"
                                                title="Bundle Items"
                                                aria-label="Bundle items"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor={`packaging-${index}`}>Packaging</Label>
                                    <Select value={item.packaging} onValueChange={(value) => handleItemChange(item.id, 'packaging', value)}>
                                        <SelectTrigger id={`packaging-${index}`}>
                                            <SelectValue placeholder="Select packaging type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="carton">Carton</SelectItem>
                                            <SelectItem value="wooden_box">Wooden Box</SelectItem>
                                            <SelectItem value="pallet">Pallet</SelectItem>
                                            <SelectItem value="bundle">Bundle</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input type="checkbox" id={`isFragile-${index}`} checked={item.isFragile} onChange={e => handleItemChange(item.id, 'isFragile', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                                    <Label htmlFor={`isFragile-${index}`} className="!mt-0">Fragile / Do not stack on top</Label>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleAddItem} variant="outline" className="w-full">
                        Add Cargo Item
                    </Button>
                </CardContent>
            </Card>
            <BundlingModal 
                isOpen={!!bundlingItem}
                onClose={() => setBundlingItem(null)}
                item={bundlingItem}
                onBundleConfirm={handleBundleConfirm}
                availableContainers={availableContainers}
            />
        </>
    );
};

export default CargoInput;