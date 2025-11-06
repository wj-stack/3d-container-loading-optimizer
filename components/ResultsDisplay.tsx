import React from 'react';
import { MultiContainerPackingResult, PackedContainer } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';

interface ResultsDisplayProps {
    result: MultiContainerPackingResult | null;
    selectedIndex: number;
    onSelectionChange: (index: number) => void;
    onAnalyze: (packedContainer: PackedContainer, index: number) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, selectedIndex, onSelectionChange, onAnalyze }) => {
    if (!result) return null;

    const selectedPackedContainer = result.packedContainers[selectedIndex];

    const summary = result.packedContainers.reduce((acc, pc) => {
        const name = pc.container.name;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Packing Results Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Containers Used</h3>
                    {result.packedContainers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                        {Object.entries(summary).map(([name, count]) => (
                             <div key={name} className="p-2 px-3 bg-gray-700/50 rounded-lg text-center">
                                <span className="text-xl font-bold text-cyan-400">{count}x</span>
                                <span className="ml-2 text-white">{name}</span>
                             </div>
                        ))}
                        </div>
                    ) : <p className="text-gray-400">No containers were needed or able to be packed.</p>}
                </div>

                {result.packedContainers.length > 0 && (
                    <div>
                        <div className="border-b border-gray-700 mb-4">
                            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                {result.packedContainers.map((pc, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSelectionChange(index)}
                                    className={`${
                                    index === selectedIndex
                                        ? 'border-cyan-500 text-cyan-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    {pc.container.name} #{index + 1}
                                </button>
                                ))}
                            </nav>
                        </div>
                        
                        {selectedPackedContainer && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                    <div className="p-4 bg-gray-700/50 rounded-lg">
                                        <div className="text-sm text-gray-400">Volume Utilization</div>
                                        <div className="text-2xl font-bold text-cyan-400">{selectedPackedContainer.result.volumeUtilization.toFixed(2)}%</div>
                                    </div>
                                    <div className="p-4 bg-gray-700/50 rounded-lg">
                                        <div className="text-sm text-gray-400">Weight Utilization</div>
                                        <div className="text-2xl font-bold text-green-400">{selectedPackedContainer.result.weightUtilization.toFixed(2)}%</div>
                                    </div>
                                    <div className="p-4 bg-gray-700/50 rounded-lg">
                                        <div className="text-sm text-gray-400">Total Weight</div>
                                        <div className="text-2xl font-bold text-orange-400">{selectedPackedContainer.result.totalWeight.toFixed(2)} kg</div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Loaded Items in this Container</h3>
                                    <div className="bg-gray-800 p-3 rounded-md max-h-48 overflow-y-auto">
                                        <ul className="divide-y divide-gray-700">
                                            {Object.entries(selectedPackedContainer.result.placedCargo.reduce((acc, item) => {
                                                acc[item.name] = (acc[item.name] || 0) + 1;
                                                return acc;
                                            }, {} as Record<string, number>)).map(([name, count]) => (
                                                <li key={name} className="py-2 flex justify-between">
                                                    <span>{name}</span>
                                                    <span className="font-mono text-cyan-300">x{count}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Button variant="outline" onClick={() => onAnalyze(selectedPackedContainer, selectedIndex)} className="w-full sm:w-auto">
                                        Analyze Remaining Space
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {result.unplacedCargo.length > 0 && (
                     <div>
                        <h3 className="font-semibold text-lg mb-2 text-red-400">Unloaded Items (Overall)</h3>
                         <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md max-h-48 overflow-y-auto">
                             <ul className="divide-y divide-red-800/50">
                                {result.unplacedCargo.map(item => (
                                    <li key={item.id} className="py-2 flex justify-between">
                                        <span>{item.name}</span>
                                        <span className="font-mono">x{item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ResultsDisplay;