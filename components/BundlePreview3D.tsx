import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Edges, Html } from '@react-three/drei';
import { CargoItem } from '../types';

interface BundlePreview3DProps {
    item: Omit<CargoItem, 'id' | 'quantity'>;
    layout: { x: number; y: number; z: number };
}

const SCALE = 0.01;

const LoadingSpinner = () => (
     <Html center>
        <div className="text-white text-xs">Loading Preview...</div>
     </Html>
)

const BundlePreview3D: React.FC<BundlePreview3DProps> = ({ item, layout }) => {
    const boxes = [];
    const itemDims = {
        l: item.length * SCALE,
        w: item.width * SCALE,
        h: item.height * SCALE
    };

    const totalDims = {
        l: itemDims.l * layout.x,
        w: itemDims.w * layout.y,
        h: itemDims.h * layout.z
    };
    
    for (let i = 0; i < layout.x; i++) {
        for (let j = 0; j < layout.y; j++) {
            for (let k = 0; k < layout.z; k++) {
                boxes.push(
                    <Box
                        key={`${i}-${j}-${k}`}
                        args={[itemDims.l, itemDims.h, itemDims.w]} // Note: y is height in three.js
                        position={[
                            i * itemDims.l + itemDims.l / 2 - totalDims.l / 2,
                            k * itemDims.h + itemDims.h / 2 - totalDims.h / 2,
                            j * itemDims.w + itemDims.w / 2 - totalDims.w / 2,
                        ]}
                    >
                        <meshStandardMaterial color="#3b82f6" />
                        <Edges color="white" />
                    </Box>
                );
            }
        }
    }

    const maxDim = Math.max(totalDims.l, totalDims.w, totalDims.h);

    return (
        <div className="w-full h-48 bg-gray-900/50 rounded-lg cursor-grab active:cursor-grabbing">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>}>
                <Canvas camera={{ position: [maxDim * 1.5, maxDim * 1.2, maxDim * 1.5], fov: 50 }}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[maxDim, maxDim * 2, maxDim]} intensity={1.2} />
                    <OrbitControls makeDefault enableZoom={true} enablePan={false} />
                    <group>
                        {boxes}
                    </group>
                </Canvas>
            </Suspense>
        </div>
    );
};

export default BundlePreview3D;
