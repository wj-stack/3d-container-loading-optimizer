import { Container, CargoItem, PackingResult, PlacedCargo, Space, MultiContainerPackingResult, PackedContainer, PackagingType } from '../types';
import { CARGO_COLORS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// A single item with its original properties, for packing purposes
interface Box {
    id: string; // Original CargoItem ID
    instanceId: string; // Unique ID for this specific box instance
    name: string;
    length: number;
    width: number;
    height: number;
    weight: number;
    isFragile: boolean;
    packaging: PackagingType;
    volume: number;
}

// This function now serves as a helper for single-container packing logic
export function pack(container: Container, boxesToPack: Box[], colorMap: Map<string, string>): PackingResult {
    const placedCargo: PlacedCargo[] = [];
    let totalWeight = 0;
    let spaces: Space[] = [{
        x: 0, y: 0, z: 0,
        length: container.length, width: container.width, height: container.height,
        supportingSurface: null // The container floor supports everything
    }];

    const packSetOfBoxes = (boxes: Box[]) => {
        for (const box of boxes) {
            if (totalWeight + box.weight > container.maxWeight) {
                continue;
            }

            let bestFit: { space: Space; spaceIndex: number; score: number } | null = null;

            // Find the best possible space for the current box based on a scoring system
            for (let i = 0; i < spaces.length; i++) {
                const s = spaces[i];

                // Rule: Carton can only be stacked on another carton. Not applicable for container floor.
                if (box.packaging === 'carton' && s.supportingSurface && s.supportingSurface.packaging !== 'carton') {
                    continue;
                }

                // Check if box fits in the current space
                if (box.length <= s.length && box.width <= s.width && box.height <= s.height) {
                    
                    // --- SCORING LOGIC FOR CLUSTERING ---
                    // Base score prefers positions that are lower, more to the front, and more to the left.
                    // We use a large constant and subtract to give higher scores to better positions.
                    let score = 1000000000 - (s.z * 10000 + s.y * 100 + s.x);

                    // Bonus for placing on top of an identical item (stacking)
                    if (s.supportingSurface && s.supportingSurface.itemId === box.id) {
                        score += 3000000000; // Strong preference for stacking
                    }

                    // Bonus for being adjacent to an identical item on the same level
                    const isAdjacent = placedCargo.some(p =>
                        p.id === box.id && p.z === s.z && (
                           (p.x + p.length === s.x && p.y === s.y && p.height >= box.height) || // right neighbor
                           (p.y + p.width === s.y && p.x === s.x && p.height >= box.height)    // back neighbor
                        )
                    );
                    
                    if (isAdjacent) {
                        score += 1500000000; // Good preference for horizontal clustering
                    }
                    // --- END OF SCORING LOGIC ---
                    
                    if (!bestFit || score > bestFit.score) {
                        bestFit = { space: s, spaceIndex: i, score: score };
                    }
                }
            }
            
            if (bestFit) {
                const space = bestFit.space;
                
                placedCargo.push({
                    ...box, x: space.x, y: space.y, z: space.z,
                    color: colorMap.get(box.id) || '#ffffff'
                });
                totalWeight += box.weight;

                spaces.splice(bestFit.spaceIndex, 1);
                
                const placedBoxSurface = { itemId: box.id, length: box.length, width: box.width, packaging: box.packaging };

                // Create new space to the right
                if (space.length - box.length > 0) {
                    spaces.push({ x: space.x + box.length, y: space.y, z: space.z, length: space.length - box.length, width: space.width, height: space.height, supportingSurface: space.supportingSurface });
                }
                // Create new space to the back
                if (space.width - box.width > 0) {
                    spaces.push({ x: space.x, y: space.y + box.width, z: space.z, length: box.length, width: space.width - box.width, height: space.height, supportingSurface: space.supportingSurface });
                }
                // Create new space on top (if not fragile)
                if (!box.isFragile && space.height - box.height > 0) {
                    spaces.push({ x: space.x, y: space.y, z: space.z + box.height, length: box.length, width: box.width, height: space.height - box.height, supportingSurface: placedBoxSurface });
                }
            }
        }
    };
    
    // Pack sturdy items first, then fragile ones, to ensure fragile items are placed higher up.
    const sturdyBoxes = boxesToPack.filter(b => !b.isFragile);
    const fragileBoxes = boxesToPack.filter(b => b.isFragile);

    packSetOfBoxes(sturdyBoxes);
    packSetOfBoxes(fragileBoxes);

    const containerVolume = container.length * container.width * container.height;
    const placedVolume = placedCargo.reduce((sum, p) => sum + (p.length * p.width * p.height), 0);
    
    const volumeUtilization = containerVolume > 0 ? (placedVolume / containerVolume) * 100 : 0;
    const weightUtilization = container.maxWeight > 0 ? (totalWeight / container.maxWeight) * 100 : 0;

    return {
        placedCargo,
        unplacedCargo: [], // This will be calculated at the multi-container level
        volumeUtilization: isFinite(volumeUtilization) ? volumeUtilization : 0,
        weightUtilization: isFinite(weightUtilization) ? weightUtilization : 0,
        totalWeight,
        remainingSpaces: spaces,
    };
}


// New primary function for multi-container optimization
export function packIntoMultipleContainers(containersInPool: Container[], cargoItems: CargoItem[]): MultiContainerPackingResult {
    const colorMap = new Map<string, string>();
    cargoItems.forEach((item, index) => {
        colorMap.set(item.id, CARGO_COLORS[index % CARGO_COLORS.length]);
    });

    let allBoxes: Box[] = [];
    cargoItems.forEach(item => {
        if (item.quantity > 0 && item.length > 0 && item.width > 0 && item.height > 0) {
            for (let i = 0; i < item.quantity; i++) {
                allBoxes.push({
                    ...item,
                    instanceId: uuidv4(),
                    volume: item.length * item.width * item.height
                });
            }
        }
    });
    
    // Heuristic: Sort all boxes by largest dimension, then volume.
    const sortBoxes = (a: Box, b: Box) => {
        const aMax = Math.max(a.length, a.width, a.height);
        const bMax = Math.max(b.length, b.width, b.height);
        if (bMax !== aMax) return bMax - aMax;
        return b.volume - a.volume;
    };
    allBoxes.sort(sortBoxes);

    const packedContainers: PackedContainer[] = [];
    let remainingBoxes = [...allBoxes];
    let remainingContainerPool = [...containersInPool];

    while(remainingBoxes.length > 0 && remainingContainerPool.length > 0) {
        let bestPackResult: PackingResult | null = null;
        let bestContainer: Container | null = null;
        let bestContainerIndex = -1;
        let bestUtilization = -1;

        // Find the best container from the remaining pool for the current set of items
        remainingContainerPool.forEach((container, index) => {
            const testResult = pack(container, remainingBoxes, colorMap);
            const containerVolume = container.length * container.width * container.height;

            if (containerVolume > 0 && testResult.placedCargo.length > 0) {
                const packedVolume = testResult.placedCargo.reduce((sum, p) => sum + (p.length * p.width * p.height), 0);
                const utilization = packedVolume / containerVolume;
                
                // Prefer the container that gives the best volume utilization
                if (utilization > bestUtilization) {
                    bestUtilization = utilization;
                    bestPackResult = testResult;
                    bestContainer = container;
                    bestContainerIndex = index;
                }
            }
        });

        if (bestPackResult && bestContainer && bestContainerIndex > -1) {
            packedContainers.push({ container: bestContainer, result: bestPackResult });

            // Remove the used container from the pool
            remainingContainerPool.splice(bestContainerIndex, 1);

            // Remove packed items from the remaining list
            const packedInstanceIds = new Set(bestPackResult.placedCargo.map(p => p.instanceId));
            remainingBoxes = remainingBoxes.filter(box => !packedInstanceIds.has(box.instanceId));
        } else {
            // No more items can be packed into any of the remaining containers
            break;
        }
    }

    // Consolidate remaining boxes back into CargoItem format
    const unplacedCounts = remainingBoxes.reduce((acc, box) => {
        acc[box.id] = (acc[box.id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const unplacedCargo: CargoItem[] = [];
    cargoItems.forEach(item => {
        if (unplacedCounts[item.id]) {
            unplacedCargo.push({ ...item, quantity: unplacedCounts[item.id] });
        }
    });

    return {
        packedContainers,
        unplacedCargo
    };
}