import { CargoItem } from './types';

export type PredefinedCargo = Omit<CargoItem, 'id' | 'quantity'>;

export const PREDEFINED_CARGO_LIST: PredefinedCargo[] = [
    { name: 'S2008 Pallet 1#', length: 2500, width: 1850, height: 1570, weight: 828, isFragile: false, packaging: 'pallet' },
    { name: 'S2008 Pallet 2#', length: 2500, width: 1850, height: 1500, weight: 702, isFragile: false, packaging: 'pallet' },
    { name: 'S2008 Pallet 3/4#', length: 1850, width: 1500, height: 1560, weight: 690, isFragile: false, packaging: 'pallet' },
    { name: 'S2008 Pallet 5#', length: 1600, width: 1500, height: 960, weight: 408, isFragile: false, packaging: 'pallet' },
    { name: 'S2008-15 Wooden Box 6#', length: 850, width: 850, height: 760, weight: 335, isFragile: false, packaging: 'wooden_box' },
    { name: 'S2008-10 Wooden Box 7#', length: 1130, width: 800, height: 1010, weight: 1061, isFragile: false, packaging: 'wooden_box' },
    { name: 'S2008 Pallet 8#', length: 2460, width: 1860, height: 1000, weight: 2130, isFragile: false, packaging: 'pallet' },
    { name: 'S2008-1 Pallet 9#', length: 2460, width: 1860, height: 1000, weight: 2160, isFragile: false, packaging: 'pallet' },
    { name: 'S2008-2/3 Pallet 10#', length: 2460, width: 1860, height: 780, weight: 1952, isFragile: false, packaging: 'pallet' },
    { name: 'S2008-9 Pallet 11#', length: 5900, width: 1000, height: 300, weight: 1200, isFragile: false, packaging: 'pallet' },
    { name: 'S2008-8 Bundle 12#', length: 6000, width: 275, height: 275, weight: 540, isFragile: false, packaging: 'bundle' },
];
