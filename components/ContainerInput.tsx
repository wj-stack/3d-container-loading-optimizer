import React from 'react';
import { CONTAINER_PRESETS } from '../constants';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Label } from './ui/Label';
import { Input } from './ui/Input';


interface ContainerInputProps {
    containerQuantities: Record<string, number>;
    setContainerQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const ContainerInput: React.FC<ContainerInputProps> = ({ containerQuantities, setContainerQuantities }) => {

    const handleQuantityChange = (id: string, quantity: number) => {
        const newQuantities = { ...containerQuantities };
        if (quantity > 0) {
            newQuantities[id] = quantity;
        } else {
            delete newQuantities[id]; // Remove from map if quantity is 0 or less
        }
        setContainerQuantities(newQuantities);
    };

    const handleToggle = (id: string) => {
        const newQuantities = { ...containerQuantities };
        if (newQuantities[id]) {
            delete newQuantities[id];
        } else {
            newQuantities[id] = 1; // Default to 1 when toggled on
        }
        setContainerQuantities(newQuantities);
    };


    // Filter out the 'custom' preset as it's not selectable from the list
    const selectablePresets = CONTAINER_PRESETS.filter(p => p.id !== 'custom');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Available Containers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label>Set the quantity for each container type:</Label>
                    <div className="mt-2 space-y-3 rounded-md bg-gray-700/50 p-3">
                    {selectablePresets.map(preset => {
                        const isSelected = !!containerQuantities[preset.id];
                        return (
                        <div key={preset.id} className="grid grid-cols-12 items-center gap-x-3">
                            <div className="col-span-1">
                                <input
                                    id={preset.id}
                                    name="container-type"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-400 text-cyan-600 focus:ring-cyan-600 bg-gray-800"
                                    checked={isSelected}
                                    onChange={() => handleToggle(preset.id)}
                                />
                            </div>
                            <div className="col-span-8">
                                <Label htmlFor={preset.id} className="!mb-0 text-gray-200 truncate">
                                    {preset.name} <span className="text-gray-400 text-xs">({preset.length}x{preset.width}x{preset.height})</span>
                                </Label>
                            </div>
                            <div className="col-span-3">
                                <Input
                                    type="number"
                                    min="0"
                                    id={`quantity-${preset.id}`}
                                    value={containerQuantities[preset.id] || 0}
                                    onChange={(e) => handleQuantityChange(preset.id, parseInt(e.target.value, 10))}
                                    className="w-full h-8 text-center"
                                    disabled={!isSelected}
                                />
                            </div>
                        </div>
                    )})}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ContainerInput;