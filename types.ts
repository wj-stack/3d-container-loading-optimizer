export type PackagingType = 'carton' | 'wooden_box' | 'pallet' | 'bundle' | 'other';

export interface Container {
    id: string;
    name: string;
    length: number; // mm
    width: number; // mm
    height: number; // mm
    maxWeight: number; // kg
}

export interface CargoItem {
    id: string;
    name: string;
    length: number; // mm
    width: number; // mm
    height: number; // mm
    weight: number; // kg
    quantity: number;
    isFragile: boolean;
    packaging: PackagingType;
}

export interface PlacedCargo {
    id: string; // Original CargoItem ID
    instanceId: string; // Unique ID for this specific box instance
    name: string;
    x: number;
    y: number;
    z: number;
    length: number;
    width: number;
    height: number;
    weight: number;
    isFragile: boolean;
    packaging: PackagingType;
    color: string;
}

export interface PackingResult {
    placedCargo: PlacedCargo[];
    unplacedCargo: CargoItem[];
    volumeUtilization: number; // percentage
    weightUtilization: number; // percentage
    totalWeight: number;
    remainingSpaces: Space[];
}

export interface Space {
    x: number;
    y: number;
    z: number;
    length: number;
    width: number;
    height: number;
    // Information about the surface this space rests on, for advanced stacking rules
    supportingSurface: {
        itemId: string | null; // ID of the item underneath, null for container floor
        length: number;
        width: number;
        packaging: PackagingType;
    } | null;
}


// New types for multi-container results
export interface PackedContainer {
    container: Container;
    result: PackingResult;
}

export interface MultiContainerPackingResult {
    packedContainers: PackedContainer[];
    unplacedCargo: CargoItem[];
}

// Types for the new bundling feature with permutations

export interface Permutation {
  layout: { x: number; y: number; z: number };
  finalDims: { length: number; width: number; height: number };
}

export interface BundlingConfiguration {
  baseFactors: [number, number, number];
  permutations: Permutation[];
  itemCount: number;
}

// Types for the filler cargo feature
export interface FillerOption {
    item: Omit<CargoItem, 'id' | 'quantity'>;
    placedFillerCargo: PlacedCargo[];
    quantity: number;
    addedWeight: number;
    addedVolumeUtilization: number;
}