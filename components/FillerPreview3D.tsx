import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Edges, Html } from '@react-three/drei';
import { Container, PlacedCargo } from '../types';

const SCALE = 0.001; // Convert mm to meters

const LoadingSpinner = () => (
     <Html center>
        <div className="text-white">Loading 3D Preview...</div>
     </Html>
);

const PositionedBox: React.FC<{ cargo: PlacedCargo; material: React.ReactNode }> = ({ cargo, material }) => {
    const position: [number, number, number] = [
        (cargo.x + cargo.length / 2) * SCALE,
        (cargo.z + cargo.height / 2) * SCALE, // Y is up
        (cargo.y + cargo.width / 2) * SCALE
    ];
    const args: [number, number, number] = [
        cargo.length * SCALE,
        cargo.height * SCALE,
        cargo.width * SCALE
    ];

    return (
        <Box args={args} position={position}>
            {material}
        </Box>
    );
};


const FillerPreview3D: React.FC<{
    container: Container;
    originalPlacedCargo: PlacedCargo[];
    fillerPlacedCargo: PlacedCargo[];
}> = ({ container, originalPlacedCargo, fillerPlacedCargo }) => {

    const containerDimensions: [number, number, number] = [
        container.length * SCALE,
        container.height * SCALE,
        container.width * SCALE,
    ];

    return (
        <Suspense fallback={<LoadingSpinner/>}>
            <Canvas
                camera={{ position: [containerDimensions[0] * 1.5, containerDimensions[1] * 1.5, containerDimensions[2] * 1.5], fov: 50 }}
                shadows
                className="rounded-lg"
            >
                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[containerDimensions[0], containerDimensions[1] * 2, containerDimensions[2]]}
                    intensity={1.5}
                />
                <OrbitControls makeDefault />

                <group position={[-containerDimensions[0] / 2, -containerDimensions[1] / 2, -containerDimensions[2] / 2]}>
                    {/* Container Wireframe */}
                    <Box args={containerDimensions} position={[containerDimensions[0] / 2, containerDimensions[1] / 2, containerDimensions[2] / 2]}>
                        <meshStandardMaterial color="#0e7490" transparent opacity={0.1} />
                        <Edges color="#06b6d4" />
                    </Box>

                    {/* Original cargo as ghosts */}
                    {originalPlacedCargo.map((cargo, i) => (
                        <PositionedBox 
                            key={`ghost-${i}`} 
                            cargo={cargo} 
                            material={<meshStandardMaterial color={cargo.color} transparent opacity={0.15} />} 
                        />
                    ))}

                    {/* New filler cargo, highlighted */}
                    {fillerPlacedCargo.map((cargo, i) => (
                        <PositionedBox 
                            key={`filler-${i}`} 
                            cargo={cargo} 
                            material={
                                <>
                                    <meshStandardMaterial color={cargo.color} />
                                    <Edges color="white" />
                                </>
                            }
                        />
                    ))}
                </group>
            </Canvas>
        </Suspense>
    );
};

export default FillerPreview3D;