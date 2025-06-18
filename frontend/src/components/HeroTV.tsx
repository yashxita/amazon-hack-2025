"use client";

import { useState, useEffect, useRef, Suspense, useMemo, JSX } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Lightformer,
  Float,
} from "@react-three/drei";
import { DoubleSide } from "three";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Plus,
  Star,
  Volume2,
  Info,
  ThumbsUp,
  Share2,
} from "lucide-react";
import { Effects } from "./Effects";
const featuredMovies = [
  {
    id: 1,
    title: "DUNE: PART TWO",
    subtitle: "Epic Sci-Fi Adventure • 2024",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.",
    rating: 8.9,
    year: 2024,
    genre: ["Sci-Fi", "Adventure", "Drama"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
  {
    id: 2,
    title: "OPPENHEIMER",
    subtitle: "Historical Drama • 2023",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II. A gripping tale of science, politics, and moral responsibility.",
    rating: 8.3,
    year: 2023,
    genre: ["Drama", "History", "Biography"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
  {
    id: 3,
    title: "SPIDER-MAN: ACROSS THE SPIDER-VERSE",
    subtitle: "Animated Adventure • 2023",
    description:
      "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. A visually stunning animated masterpiece.",
    rating: 8.7,
    year: 2023,
    genre: ["Animation", "Action", "Adventure"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
  {
    id: 4,
    title: "THE BATMAN",
    subtitle: "Dark Crime Thriller • 2022",
    description:
      "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
    rating: 7.8,
    year: 2022,
    genre: ["Action", "Crime", "Drama"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
]

function CameraLookAtCenter() {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }, [camera]);

  return null;
}

function Model(
  // remove `object` from the accepted props
  props: Omit<JSX.IntrinsicElements["primitive"], "object">
) {
  const { scene } = useGLTF("/Channel_Tv.glb");

  useMemo(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Material customization if needed
      }
    });
  }, [scene]);

  // safe: `object` is provided exactly once
  return <primitive object={scene} {...props} />;
}
useGLTF.preload("/Channel_Tv.glb");


function CurvedTV() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -mouse.y * 0.3,
      0.05
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.x * 0.5,
      0.01
    );
  });

  return (
    <group ref={groupRef}>
      <Float
        floatIntensity={2}
        rotationIntensity={1}
        speed={1}
        floatingRange={[-0.2, 0.2]}
      >
        <Model scale={4} position={[24, -7, 20]} />
      </Float>
    </group>
  );
}

export default function Hero() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const currentFeatured = featuredMovies[currentHeroIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Canvas as background */}
      <div className="absolute inset-0 z-0">
        <Canvas
          gl={{
            alpha: false,
            antialias: false,
            preserveDrawingBuffer: true,
            logarithmicDepthBuffer: true,
          }}
          dpr={[1, 1.5]}
          camera={{ position: [50, 0, 70], fov: 50 }}
        >
          <CameraLookAtCenter />
          <hemisphereLight intensity={0.5} />

          {/* Glowing ring meshes */}
          <Float floatIntensity={1} rotationIntensity={1}>
            <mesh scale={15} position={[-24, 30, -50]}>
              <ringGeometry args={[0.9, 1, 4, 1]} />
              <meshStandardMaterial
                color="white"
                roughness={0.75}
                emissive="#ff0000"
                emissiveIntensity={5}
              />
            </mesh>
          </Float>

          <Float floatIntensity={1} rotationIntensity={1}>
            <mesh
              scale={12}
              position={[36, 20, -30]}
              rotation={[0, 0, Math.PI / 2.5]}
            >
              <ringGeometry args={[0.9, 1, 3, 1]} />
              <meshStandardMaterial
                color="white"
                roughness={0.75}
                emissive="#00f6ff"
                emissiveIntensity={5}
              />
            </mesh>
          </Float>

          <Environment resolution={512}>
            <Lightformer
              intensity={2}
              rotation-x={Math.PI / 2}
              position={[0, 4, -9]}
              scale={[10, 1, 1]}
            />
            <Lightformer
              intensity={2}
              rotation-x={Math.PI / 2}
              position={[0, 4, 6]}
              scale={[10, 1, 1]}
            />
            <Lightformer
              intensity={2}
              rotation-x={Math.PI / 2}
              position={[0, 4, 9]}
              scale={[10, 1, 1]}
            />
            <Lightformer
              intensity={2}
              rotation-y={Math.PI / 2}
              position={[-50, 2, 0]}
              scale={[100, 2, 1]}
            />
            <Lightformer
              intensity={2}
              rotation-y={-Math.PI / 2}
              position={[50, 2, 0]}
              scale={[100, 2, 1]}
            />
          </Environment>

          <Suspense fallback={null}>
            <CurvedTV />
          </Suspense>

          <Effects />
        </Canvas>
      </div>

      {/* Movie Text & Buttons */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500 px-4 py-2 rounded-full mb-4">
                <Play className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-semibold text-sm">
                  NOW STREAMING
                </span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-white mb-4 tracking-tight">
                {currentFeatured.title}
              </h1>
              <p className="text-blue-400 text-xl font-semibold mb-4">
                {currentFeatured.subtitle}
              </p>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
              {currentFeatured.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-bold text-lg">
                  {currentFeatured.rating}
                </span>
              </div>
              <div className="flex gap-2">
                {currentFeatured.genre.map((g) => (
                  <Badge
                    key={g}
                    variant="outline"
                    className="border-gray-600 text-gray-300 bg-black/50"
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg font-semibold shadow-lg shadow-red-500/30">
                <Play className="w-5 h-5 mr-2 fill-white" />
                WATCH NOW
              </Button>
              <Button
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-400/10 px-8 py-3 text-lg font-semibold"
              >
                <Info className="w-5 h-5 mr-2" />
                MORE INFO
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-400"
              >
                <ThumbsUp className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-blue-400"
              >
                <Plus className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-blue-400"
              >
                <Share2 className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <Volume2 className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero navigation dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentHeroIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentHeroIndex
                ? "bg-red-500"
                : "bg-gray-600 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
