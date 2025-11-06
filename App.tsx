
import React, { useState, useCallback, useMemo } from 'react';
import { Container, CargoItem, MultiContainerPackingResult, PackedContainer } from './types';
import { CONTAINER_PRESETS, INITIAL_CARGO_ITEMS } from './constants';
import ContainerInput from './components/ContainerInput';
import CargoInput from './components/CargoInput';
import QuickAddCargo from './components/QuickAddCargo';
import ResultsDisplay from './components/ResultsDisplay';
import Visualization from './components/Visualization';
import { packIntoMultipleContainers } from './services/packingService';
import { PredefinedCargo } from './predefinedCargo';
import { v4 as uuidv4 } from 'uuid';
import FillerCargoModal from './components/FillerCargoModal';

const App: React.FC = () => {
    // State now holds the quantity for each container type ID
    const [containerQuantities, setContainerQuantities] = useState<Record<string, number>>({ '20GP': 2, '40GP': 1, '40HQ': 1});
    const [cargoItems, setCargoItems] = useState<CargoItem[]>(INITIAL_CARGO_ITEMS);
    const [packingResult, setPackingResult] = useState<MultiContainerPackingResult | null>(null);
    const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // FIX: Changed data structure for fillerAnalysisTarget to use 'packedContainer' property
    // for better clarity and to match usage in the modal component.
    const [fillerAnalysisTarget, setFillerAnalysisTarget] = useState<{ packedContainer: PackedContainer; index: number } | null>(null);

    const hasAvailableContainers = useMemo(() => {
        return Object.values(containerQuantities).some(qty => qty > 0);
    }, [containerQuantities]);

    // Memoize the list of available container types for child components
    const availableContainers = useMemo<Container[]>(() => {
        return Object.keys(containerQuantities)
            .map(id => CONTAINER_PRESETS.find(p => p.id === id))
            .filter((c): c is Container => !!c);
    }, [containerQuantities]);

    const handleCalculate = useCallback(() => {
        setError(null);
        setIsLoading(true);
        setPackingResult(null);
        setSelectedResultIndex(0);

        setTimeout(() => {
            try {
                const containersPool: Container[] = [];
                for (const id in containerQuantities) {
                    const quantity = containerQuantities[id];
                    if (quantity > 0) {
                        const preset = CONTAINER_PRESETS.find(p => p.id === id);
                        if (preset) {
                            for (let i = 0; i < quantity; i++) {
                                // We don't need a unique ID here as the packing service will consume them one by one.
                                containersPool.push(preset);
                            }
                        }
                    }
                }

                if (containersPool.length === 0) {
                    throw new Error("Please select at least one container and set a quantity greater than 0.");
                }
                const result = packIntoMultipleContainers(containersPool, cargoItems);
                setPackingResult(result);
            } catch (e) {
                if (e instanceof Error) {
                    setError(`An error occurred: ${e.message}`);
                } else {
                    setError("An unknown error occurred during calculation.");
                }
            } finally {
                setIsLoading(false);
            }
        }, 50);
    }, [containerQuantities, cargoItems]);

    // FIX: Updated handleQuickAddItem to correctly handle items without a predefined quantity.
    // It now increments the quantity by 1 if the item exists, or adds a new item with a quantity of 1. This resolves the type errors.
    const handleQuickAddItem = useCallback((itemToAdd: PredefinedCargo) => {
        setCargoItems(prevItems => {
            const existingItem = prevItems.find(item => item.name === itemToAdd.name);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === existingItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevItems, { ...itemToAdd, id: uuidv4(), quantity: 1 }];
            }
        });
    }, []);


    const selectedPackedContainer: PackedContainer | null = packingResult?.packedContainers[selectedResultIndex] || null;

    const memoizedVisualization = useMemo(() => {
        if (!selectedPackedContainer) return null;
        return <Visualization container={selectedPackedContainer.container} result={selectedPackedContainer.result} />;
    }, [selectedPackedContainer]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl md:text-2xl font-bold text-cyan-400">
                            3D Container Loading Optimizer
                        </h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="lg:col-span-4 space-y-8">
                        <ContainerInput containerQuantities={containerQuantities} setContainerQuantities={setContainerQuantities} />
                        <QuickAddCargo onAddItem={handleQuickAddItem} />
                        <CargoInput cargoItems={cargoItems} setCargoItems={setCargoItems} availableContainers={availableContainers} />
                        <button
                            onClick={handleCalculate}
                            disabled={isLoading || cargoItems.length === 0 || !hasAvailableContainers}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Calculating...
                                </div>
                            ) : 'Optimize Loading Plan'}
                        </button>
                    </div>

                    {/* Right Column: Visualization and Results */}
                    <div className="lg:col-span-8">
                         <div className="bg-gray-800 rounded-xl shadow-2xl p-2 h-[60vh] lg:h-[calc(100vh-12rem)]">
                           {error && <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center z-10 text-white p-4 rounded-xl"><p>{error}</p></div>}
                           
                           {packingResult && packingResult.packedContainers.length === 0 && !isLoading && (
                                <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10 text-gray-400 p-4 rounded-xl">
                                    <p className="text-center text-lg">Could not pack any items with the selected containers.</p>
                                </div>
                           )}
                           {memoizedVisualization}
                        </div>
                        {/* FIX: Changed data structure for fillerAnalysisTarget to use 'packedContainer' property */}
                        {packingResult && <ResultsDisplay result={packingResult} selectedIndex={selectedResultIndex} onSelectionChange={setSelectedResultIndex} onAnalyze={(container, index) => setFillerAnalysisTarget({ packedContainer: container, index })} />}
                    </div>
                </div>
            </main>
            <FillerCargoModal
                isOpen={!!fillerAnalysisTarget}
                onClose={() => setFillerAnalysisTarget(null)}
                packedContainerData={fillerAnalysisTarget}
            />
        </div>
    );
};

export default App;