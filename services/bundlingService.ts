
import { CargoItem, BundlingConfiguration, Container, Permutation } from '../types';

/**
 * Finds all factor triplets (i, j, k) for a given number n.
 * The triplets are sorted to represent the base arrangement.
 * @param n The number to factorize.
 * @returns An array of sorted triplets [i, j, k] where i * j * k = n.
 */
function findFactorTriplets(n: number): [number, number, number][] {
    const triplets = new Set<string>();
    for (let i = 1; i <= n; i++) {
        if (n % i === 0) {
            const remainder = n / i;
            for (let j = 1; j <= remainder; j++) {
                if (remainder % j === 0) {
                    const k = remainder / j;
                    const sorted = [i, j, k].sort((a, b) => a - b);
                    triplets.add(sorted.join(','));
                }
            }
        }
    }
    return Array.from(triplets).map(s => {
        const parts = s.split(',');
        return [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])];
    });
}

/**
 * Gets all unique permutations of a triplet.
 * e.g., [1, 2, 2] -> [[1, 2, 2], [2, 1, 2], [2, 2, 1]]
 */
function getPermutations(triplet: [number, number, number]): [number, number, number][] {
    const perms = new Set<string>();
    const permute = (arr: number[], l: number, r: number) => {
        if (l === r) {
            perms.add(arr.join(','));
        } else {
            for (let i = l; i <= r; i++) {
                [arr[l], arr[i]] = [arr[i], arr[l]];
                permute(arr, l + 1, r);
                [arr[l], arr[i]] = [arr[i], arr[l]]; // backtrack
            }
        }
    };
    permute([...triplet], 0, 2);
    return Array.from(perms).map(s => {
        const parts = s.split(',');
        return [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])];
    });
}


/**
 * Calculates possible bundling options for a given cargo item, including all valid permutations.
 * @param item The cargo item to bundle.
 * @param availableContainers The list of containers the bundle must fit into.
 * @returns A list of unique bundling configurations, each with its own list of valid permutations.
 */
export function calculateBundlingOptions(item: CargoItem, availableContainers: Container[]): BundlingConfiguration[] {
    if (!item || item.quantity < 2) {
        return [];
    }
    
    const { quantity, length, width, height } = item;
    const configurations: BundlingConfiguration[] = [];

    const triplets = findFactorTriplets(quantity);
    
    for (const triplet of triplets) {
        const permutations = getPermutations(triplet);
        const validPermutations: Permutation[] = [];

        for (const perm of permutations) {
            const [px, py, pz] = perm;
            const finalDims = {
                length: length * px,
                width: width * py,
                height: height * pz,
            };
            
            // A bundle is only valid if it can fit into at least one of the available containers.
            // If no containers are provided, we skip this check and allow all options.
            const canFit = availableContainers.length === 0 || availableContainers.some(c => 
                finalDims.length <= c.length &&
                finalDims.width <= c.width &&
                finalDims.height <= c.height
            );

            if (canFit) {
                 validPermutations.push({
                    layout: { x: px, y: py, z: pz },
                    finalDims,
                });
            }
        }

        if (validPermutations.length > 0) {
            configurations.push({
                baseFactors: triplet,
                permutations: validPermutations,
                itemCount: quantity,
            });
        }
    }

    // Sort configurations to prefer more "cube-like" shapes based on their base factors
    return configurations.sort((a, b) => {
        const aRatio = a.baseFactors[2] / a.baseFactors[0];
        const bRatio = b.baseFactors[2] / b.baseFactors[0];
        return aRatio - bRatio;
    });
}