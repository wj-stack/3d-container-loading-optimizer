
import { Container, CargoItem } from './types';
import { v4 as uuidv4 } from 'uuid';

export const CONTAINER_PRESETS: Container[] = [
    { id: '20GP', name: "20' GP", length: 5898, width: 2352, height: 2393, maxWeight: 28200 },
    { id: '40GP', name: "40' GP", length: 12032, width: 2352, height: 2393, maxWeight: 28800 },
    { id: '40HQ', name: "40' HQ", length: 12032, width: 2352, height: 2698, maxWeight: 28600 },
    { id: 'custom', name: "Custom", length: 12000, width: 2400, height: 2500, maxWeight: 30000 },
];

export const INITIAL_CARGO_ITEMS: CargoItem[] = [
    {
        id: uuidv4(),
        name: 'Large Box',
        length: 1200,
        width: 1000,
        height: 800,
        weight: 250,
        quantity: 15,
        isFragile: false,
        packaging: 'other',
    },
    {
        id: uuidv4(),
        name: 'Medium Box',
        length: 800,
        width: 600,
        height: 500,
        weight: 100,
        quantity: 20,
        isFragile: false,
        packaging: 'carton',
    },
    {
        id: uuidv4(),
        name: 'Fragile Goods',
        length: 500,
        width: 400,
        height: 300,
        weight: 15,
        quantity: 30,
        isFragile: true,
        packaging: 'carton',
    },
];

export const CARGO_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#78716c'
];
