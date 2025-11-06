import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { PackedContainer, FillerOption } from '../types';
import { calculateFillerOptions } from '../services/fillerService';
import { PREDEFINED_CARGO_LIST } from '../predefinedCargo';
import FillerPreview3D from './FillerPreview3D';

// FIX: Updated prop type to use 'packedContainer' to align with component's internal variable naming and fix destructuring error.
interface FillerCargoModalProps {
    isOpen: boolean;
    onClose: () => void;
    packedContainerData: { packedContainer: PackedContainer; index: number } | null;
}

const FillerCargoModal: React.FC<FillerCargoModalProps> = ({ isOpen, onClose, packedContainerData }) => {
    const [selectedOption, setSelectedOption] = useState<FillerOption | null>(null);

    const { packedContainer, index } = packedContainerData || {};

    const fillerOptions = useMemo(() => {
        if (!packedContainer) return [];
        return calculateFillerOptions(packedContainer.container, packedContainer.result, PREDEFINED_CARGO_LIST);
    }, [packedContainer]);
    
    useEffect(() => {
        if (isOpen && fillerOptions.length > 0) {
            setSelectedOption(fillerOptions[0]);
        } else if (!isOpen) {
            setSelectedOption(null);
        }
    }, [isOpen, fillerOptions]);

    if (!isOpen || !packedContainer) return null;

    const remainingWeight = (packedContainer.container.maxWeight - packedContainer.result.totalWeight).toFixed(2);

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Analyze Remaining Space for ${packedContainer.container.name} #${index + 1}`}
            className="max-w-6xl"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="max-h-[70vh] overflow-y-auto pr-2 flex flex-col">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-200">Potential Filler Cargo</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Based on remaining space and weight capacity ({remainingWeight} kg), you could potentially add one of the following:
                        </p>
                    </div>
                    {fillerOptions.length > 0 ? (
                        <div className="space-y-3 flex-grow">
                            {fillerOptions.map((option, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setSelectedOption(option)} 
                                    className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${selectedOption === option ? 'border-cyan-500 bg-cyan-900/40' : 'border-transparent bg-gray-700/50 hover:bg-gray-700'}`}
                                >
                                    <p className="font-semibold text-cyan-400">Add {option.quantity}x {option.item.name}</p>
                                    <p className="text-xs text-gray-300">
                                        Adds {option.addedWeight.toFixed(2)} kg, uses an additional {option.addedVolumeUtilization.toFixed(2)}% of container volume.
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center">
                            <p className="text-center text-gray-500 py-8">
                                No suitable filler cargo from the predefined list could be fit into the remaining spaces.
                            </p>
                        </div>
                    )}
                </div>
                <div className="max-h-[70vh] flex flex-col">
                    <h3 className="text-lg font-semibold mb-2 text-gray-200">3D Placement Preview</h3>
                    <div className="flex-grow bg-gray-900/50 rounded-lg relative min-h-[24rem]">
                        {selectedOption ? (
                            <FillerPreview3D
                                container={packedContainer.container}
                                originalPlacedCargo={packedContainer.result.placedCargo}
                                fillerPlacedCargo={selectedOption.placedFillerCargo}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                Select an option to preview
                            </div>
                        )}
                    </div>
                    {selectedOption && (
                         <div className="mt-4 p-4 bg-gray-700/50 rounded-lg text-sm">
                            <h4 className="font-bold text-base mb-2 text-white">Selected Option Details</h4>
                            <div className="space-y-1">
                                <p><span className="font-semibold text-gray-400">Item:</span> {selectedOption.item.name}</p>
                                <p><span className="font-semibold text-gray-400">Dimensions:</span> {selectedOption.item.length}x{selectedOption.item.width}x{selectedOption.item.height} mm</p>
                                <p><span className="font-semibold text-gray-400">Quantity Added:</span> {selectedOption.quantity}</p>
                                <p><span className="font-semibold text-gray-400">Total Added Weight:</span> {selectedOption.addedWeight.toFixed(2)} kg</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default FillerCargoModal;