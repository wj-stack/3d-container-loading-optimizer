
import React from 'react';
import { CargoItem, PackagingType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Button } from './ui/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/Select';


interface CargoInputProps {
    cargoItems: CargoItem[];
    setCargoItems: React.Dispatch<React.SetStateAction<CargoItem[]>>;
}

const CargoInput: React.FC<CargoInputProps> = ({ cargoItems, setCargoItems }) => {

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
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cargo Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
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
                                <div>
                                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                                    <Input type="number" id={`quantity-${index}`} value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))} />
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
    );
};

export default CargoInput;
