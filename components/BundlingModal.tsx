
import React, { useMemo, useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { CargoItem, BundlingConfiguration, Container, Permutation } from '../types';
import { calculateBundlingOptions } from '../services/bundlingService';
import BundlePreview3D from './BundlePreview3D';

interface BundlingModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: CargoItem | null;
    onBundleConfirm: (originalItemId: string, bundledItem: Omit<CargoItem, 'id' | 'quantity'>, itemsUsed: number) => void;
    availableContainers: Container[];
}

const BundlingModal: React.FC<BundlingModalProps> = ({ isOpen, onClose, item, onBundleConfirm, availableContainers }) => {
    const [selectedPermutationIndices, setSelectedPermutationIndices] = useState<Record<string, number>>({});

    const bundlingOptions = useMemo(() => {
        if (!item) return [];
        return calculateBundlingOptions(item, availableContainers);
    }, [item, availableContainers]);
    
    useEffect(() => {
        // When options change, reset the selected indices for each option to the first permutation (index 0)
        if (bundlingOptions.length > 0) {
            const initialIndices = bundlingOptions.reduce((acc, option) => {
                const key = option.baseFactors.join('x');
                acc[key] = 0;
                return acc;
            }, {} as Record<string, number>);
            setSelectedPermutationIndices(initialIndices);
        }
    }, [bundlingOptions]);


    if (!item) return null;

    const handleConfirm = (permutation: Permutation, itemCount: number) => {
        const bundledItem: Omit<CargoItem, 'id' | 'quantity'> = {
            name: `${item.name} (Bundle ${permutation.layout.x}x${permutation.layout.y}x${permutation.layout.z})`,
            length: permutation.finalDims.length,
            width: permutation.finalDims.width,
            height: permutation.finalDims.height,
            weight: item.weight * itemCount,
            isFragile: item.isFragile,
            packaging: 'bundle', // Override packaging to 'bundle'
        };
        onBundleConfirm(item.id, bundledItem, itemCount);
    };

    const handleCycleLayout = (config: BundlingConfiguration) => {
        const key = config.baseFactors.join('x');
        setSelectedPermutationIndices(prev => {
            const currentIndex = prev[key] ?? 0;
            const nextIndex = (currentIndex + 1) % config.permutations.length;
            return { ...prev, [key]: nextIndex };
        });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Create Bundle for "${item.name}" (Qty: ${item.quantity})`}
        >
            {availableContainers.length === 0 && (
                <div className="text-yellow-400 bg-yellow-900/30 p-3 rounded-md mb-4 text-sm border border-yellow-700/50">
                    <p className="font-semibold">Warning: No Containers Selected</p>
                    <p className="text-yellow-500">Bundling options are not being checked against container dimensions and may not fit.</p>
                </div>
            )}
            {bundlingOptions.length > 0 ? (
                <div className="space-y-4">
                    <p className="text-gray-300">Select a configuration to bundle all {item.quantity} items into a single, larger block. This will replace them with one new item in your cargo list.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[65vh] overflow-y-auto pr-2">
                        {bundlingOptions.map((option) => {
                            const key = option.baseFactors.join('x');
                            const currentIndex = selectedPermutationIndices[key] ?? 0;
                            const currentPermutation = option.permutations[currentIndex];
                            
                            if (!currentPermutation) return null; // Should not happen if state is synced

                            return (
                                <div key={key} className="bg-gray-700/50 rounded-lg p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-lg text-cyan-400">
                                                Arrange: {option.baseFactors[0]}&times;{option.baseFactors[1]}&times;{option.baseFactors[2]}
                                            </h3>
                                        </div>
                                        <BundlePreview3D item={item} layout={currentPermutation.layout} />
                                        <div className="mt-3 text-sm space-y-2">
                                           <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-400 whitespace-nowrap">Current Layout:</p>
                                                <div className="flex items-center gap-2 w-full bg-gray-900/40 p-1 rounded-md">
                                                    <span className="flex-grow text-center font-mono">{currentPermutation.layout.x} &times; {currentPermutation.layout.y} &times; {currentPermutation.layout.z}</span>
                                                    <button 
                                                        onClick={() => handleCycleLayout(option)}
                                                        className="p-1.5 text-gray-300 bg-gray-700 hover:bg-cyan-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Cycle Layout"
                                                        aria-label="Cycle through layout orientations"
                                                        disabled={option.permutations.length <= 1}
                                                    >
                                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201-4.752L3.055 9.728a.75.75 0 01-1.06-1.06l4.5-4.5a.75.75 0 011.06 0l4.5 4.5a.75.75 0 11-1.06 1.06l-2.956-2.955a4 4 0 106.201 3.447l-1.488-1.488a.75.75 0 011.06-1.06l3.5 3.5a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 11-1.06-1.06l1.488-1.488z" clipRule="evenodd" />
                                                         </svg>
                                                    </button>
                                                </div>
                                           </div>
                                           <p><span className="font-semibold text-gray-400">New Dimensions:</span> {currentPermutation.finalDims.length} &times; {currentPermutation.finalDims.width} &times; {currentPermutation.finalDims.height} mm</p>
                                           <p><span className="font-semibold text-gray-400">Total Weight:</span> {(item.weight * option.itemCount).toFixed(2)} kg</p>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => handleConfirm(currentPermutation, option.itemCount)} 
                                        className="w-full mt-4"
                                    >
                                        Select Bundle
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-400 py-8">
                    <p>No valid bundling options could be calculated for a quantity of {item.quantity}.</p>
                    {availableContainers.length > 0 && <p className="mt-2 text-sm">This may be because the resulting bundled dimensions would be too large for any of your selected containers.</p>}
                </div>
            )}
        </Modal>
    );
};

export default BundlingModal;
