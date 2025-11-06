import { Container, CargoItem, PackingResult, PlacedCargo, Space, FillerOption } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * A simplified packing algorithm that attempts to fit as many instances
 * of a single item type into a given set of spaces.
 */
function packSingleItemType(
    spaces: Space[],
    item: Omit<CargoItem, 'id' | 'quantity'>,
    remainingWeight: number,
    color: string
): PlacedCargo[] {
    const placedItems: PlacedCargo[] = [];
    let currentSpaces: Space[] = JSON.parse(JSON.stringify(spaces)); // Deep copy to avoid mutation
    let totalAddedWeight = 0;
    let canStillPack = true;

    while (canStillPack) {
        canStillPack = false;

        if (totalAddedWeight + item.weight > remainingWeight) {
            break; // Stop if adding another item would exceed weight limit
        }

        let bestFit: { space: Space; spaceIndex: number; } | null = null;
        
        // Find the best space using a simple "bottom-front-left" heuristic
        for (let i = 0; i < currentSpaces.length; i++) {
            const s = currentSpaces[i];
            if (item.length <= s.length && item.width <= s.width && item.height <= s.height) {
                if (bestFit === null || s.z < bestFit.space.z || (s.z === bestFit.space.z && s.y < bestFit.space.y) || (s.z === bestFit.space.z && s.y === bestFit.space.y && s.x < bestFit.space.x)) {
                    bestFit = { space: s, spaceIndex: i };
                }
            }
        }

        if (bestFit) {
            const { space, spaceIndex } = bestFit;
            
            placedItems.push({
                id: 'filler-item', // A generic ID for filler items
                instanceId: uuidv4(),
                name: item.name,
                x: space.x, y: space.y, z: space.z,
                length: item.length,
                width: item.width,
                height: item.height,
                weight: item.weight,
                isFragile: item.isFragile,
                packaging: item.packaging,
                color: color
            });
            totalAddedWeight += item.weight;
            canStillPack = true; // We packed one, so let's try to pack another

            currentSpaces.splice(spaceIndex, 1);

            const placedBoxSurface = { itemId: 'filler-item', length: item.length, width: item.width, packaging: item.packaging };

            // Create new spaces from the remainder of the split space (same logic as main packer)
            if (space.length - item.length > 0) {
                currentSpaces.push({ x: space.x + item.length, y: space.y, z: space.z, length: space.length - item.length, width: space.width, height: space.height, supportingSurface: space.supportingSurface });
            }
            if (space.width - item.width > 0) {
                currentSpaces.push({ x: space.x, y: space.y + item.width, z: space.z, length: item.length, width: space.width - item.width, height: space.height, supportingSurface: space.supportingSurface });
            }
            if (!item.isFragile && space.height - item.height > 0) {
                currentSpaces.push({ x: space.x, y: space.y, z: space.z + item.height, length: item.length, width: item.width, height: space.height - item.height, supportingSurface: placedBoxSurface });
            }
        }
    }
    return placedItems;
}


export function calculateFillerOptions(
    container: Container,
    originalResult: PackingResult,
    potentialFillerItems: Omit<CargoItem, 'id' | 'quantity'>[]
): FillerOption[] {
    const { remainingSpaces, totalWeight } = originalResult;
    const remainingWeightCapacity = container.maxWeight - totalWeight;

    if (remainingSpaces.length === 0 || remainingWeightCapacity <= 0) {
        return [];
    }

    const options: FillerOption[] = [];
    const containerVolume = container.length * container.width * container.height;

    potentialFillerItems.forEach((item) => {
        // Use a distinct, bright color for all filler items to make them stand out
        const color = '#f43f5e';
        const placedFillerCargo = packSingleItemType(
            remainingSpaces,
            item,
            remainingWeightCapacity,
            color
        );

        if (placedFillerCargo.length > 0) {
            const addedWeight = placedFillerCargo.reduce((sum, p) => sum + p.weight, 0);
            const addedVolume = placedFillerCargo.reduce((sum, p) => sum + (p.length * p.width * p.height), 0);
            const addedVolumeUtilization = containerVolume > 0 ? (addedVolume / containerVolume) * 100 : 0;

            options.push({
                item,
                placedFillerCargo,
                quantity: placedFillerCargo.length,
                addedWeight,
                addedVolumeUtilization,
            });
        }
    });

    // Sort options to show the most numerous additions first
    return options.sort((a, b) => {
        if (b.quantity !== a.quantity) {
            return b.quantity - a.quantity;
        }
        return b.addedVolumeUtilization - a.addedVolumeUtilization;
    });
}