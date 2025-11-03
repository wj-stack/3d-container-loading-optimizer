
import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Edges, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Container, PackingResult, PlacedCargo } from '../types';

interface VisualizationProps {
    container: Container;
    result: PackingResult | null;
}

const SCALE = 0.001; // Convert mm to meters for rendering

const CargoBox: React.FC<{ cargo: PlacedCargo; setHovered: (cargo: PlacedCargo | null) => void }> = ({ cargo, setHovered }) => {
    const position: [number, number, number] = [
        (cargo.x + cargo.length / 2) * SCALE,
        (cargo.z + cargo.height / 2) * SCALE, // Y is up in Three.js
        (cargo.y + cargo.width / 2) * SCALE
    ];
    const args: [number, number, number] = [
        cargo.length * SCALE,
        cargo.height * SCALE, // Y is height in Three.js
        cargo.width * SCALE
    ];

    return (
        <Box
            args={args}
            position={position}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(cargo); }}
            onPointerOut={() => setHovered(null)}
        >
            <meshStandardMaterial color={cargo.color} transparent opacity={cargo.isFragile ? 0.7 : 0.9} />
             <Edges
                scale={1.001}
                threshold={15} // Angle between faces
                color="white"
                />
        </Box>
    );
};

const LoadingSpinner = () => (
     <Html center>
        <div className="text-white">Loading 3D View...</div>
     </Html>
)

const Visualization: React.FC<VisualizationProps> = ({ container, result }) => {
    const [hovered, setHovered] = useState<PlacedCargo | null>(null);

    const containerDimensions: [number, number, number] = [
        container.length * SCALE,
        container.height * SCALE, // Y is height
        container.width * SCALE,
    ];

    const cargoBoxes = useMemo(() => result?.placedCargo.map((cargo, index) => (
        <CargoBox key={index} cargo={cargo} setHovered={setHovered} />
    )), [result]);

    return (
        <Suspense fallback={<LoadingSpinner/>}>
            <Canvas
                camera={{ position: [containerDimensions[0] * 1.5, containerDimensions[1] * 1.5, containerDimensions[2] * 1.5], fov: 50 }}
                shadows
                className="rounded-xl"
            >
                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[containerDimensions[0], containerDimensions[1] * 2, containerDimensions[2]]}
                    intensity={1.5}
                    castShadow
                />
                <OrbitControls makeDefault />

                <group position={[-containerDimensions[0] / 2, -containerDimensions[1] / 2, -containerDimensions[2] / 2]}>
                    {/* Container Wireframe */}
                    <Box args={containerDimensions} position={[containerDimensions[0] / 2, containerDimensions[1] / 2, containerDimensions[2] / 2]}>
                        <meshStandardMaterial color="#0e7490" transparent opacity={0.1} />
                        <Edges
                            scale={1}
                            threshold={15}
                            color="#06b6d4"
                            />
                    </Box>

                    {/* Cargo */}
                    {cargoBoxes}
                </group>

                {hovered && (
                    <Html position={[(hovered.x + hovered.length / 2) * SCALE - containerDimensions[0]/2, (hovered.z + hovered.height) * SCALE - containerDimensions[1]/2, (hovered.y + hovered.width / 2) * SCALE - containerDimensions[2]/2]}>
                        <div className="bg-gray-900/80 text-white p-2 rounded-md shadow-lg text-xs pointer-events-none whitespace-nowrap">
                            <p className="font-bold">{hovered.name}</p>
                            <p>Size: {hovered.length}x{hovered.width}x{hovered.height} mm</p>
                            <p>Weight: {hovered.weight} kg</p>
                            <p>Package: <span className="capitalize">{hovered.packaging.replace('_', ' ')}</span></p>
                            {hovered.isFragile && <p className="text-red-400">Fragile</p>}
                        </div>
                    </Html>
                )}
            </Canvas>
        </Suspense>
    );
};

export default Visualization;
