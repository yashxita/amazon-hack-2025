"use client";

import { useState, useEffect, useRef, Suspense, useMemo, JSX } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  Lightformer,
  Float,
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,

  Star,

} from "lucide-react";
import { Effects } from "./Effects";
import { addToWatchHistory } from "../../services/api"; // ← added for history
import { toast } from "react-hot-toast";

const featuredMovies = [
  {
    id: 667257,
    title: "Impossible Things",
    subtitle: "Family, Drama • 2021",
    description:
      "Matilde is a woman who, after the death of her husband - a man who constantly abused her - finds her new best friend in Miguel, her young, insecure, disoriented and even dealer neighbor",
    rating: 8.5,
    year: 2021,
    genre: ["Family", "Drama"],
    backdrop: "/t2Ew8NZ8Ci2kqmoecZUNQUFDJnQ.jpg",
    poster: "/t2Ew8NZ8Ci2kqmoecZUNQUFDJnQ.jpg",
  },
  {
    id: 210577,
    title: "Gone Girl",
    subtitle: "Mystery, Thriller, Drama • 2014",
    description:
      "With his wife's disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him when it's suspected that he may not be innocent.",
    rating: 7.9,
    year: 2014,
    genre: ["Mystery", "Thriller", "Drama"],
    backdrop: "/qymaJhucquUwjpb8oiqynMeXnID.jpg",
    poster: "/qymaJhucquUwjpb8oiqynMeXnID.jpg",
  },
  {
    id: 379170,
    title: "Sherlock: The Abominable Bride",
    subtitle: "Crime, Drama, Mystery, TV Movie • 2016",
    description:
      "Sherlock Holmes and Dr. Watson find themselves in 1890s London in this holiday special.",
    rating: 7.9,
    year: 2016,
    genre: ["Crime", "Drama", "Mystery", "TV Movie"],
    backdrop: "/hibE8cyZs2Bm0o4WaWd1pppvjO2.jpg",
    poster: "/hibE8cyZs2Bm0o4WaWd1pppvjO2.jpg",
  },
  {
    id: 86000,
    title: "Always",
    subtitle: "Romance, Drama, Adventure • 2011",
    description:
      "Cheol-Min, a man with a dark, picks up a part-time night job as a parking lot attendant. He sits in the tiny pay booth in the parking lot and stares at the small television. A woman named Jung-Hwa walks into the booth. Cheol-Min realizes the woman is blind and she is confusing him for the parking attendant who worked there previously.  Nevertheless, the woman comes back on another night to watch the same television drama series. Cheol-Min starts becoming attached to Jung-Hwa and they find out they are connected by the same incident in the past.",
    rating: 7.9,
    year: 2011,
    genre: ["Romance", "Drama", "Adventure"],
    backdrop: "/7PaCGnjY87sc9088zxFf34Tamcz.jpg",
    poster: "/7PaCGnjY87sc9088zxFf34Tamcz.jpg",
  },
]

function CameraLookAtCenter() {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }, [camera]);

  return null;
}

function Model(props: Omit<JSX.IntrinsicElements["primitive"], "object">) {
  const { scene } = useGLTF("/Channel_Tv.glb");

  useMemo(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Customize material here if needed
      }
    });
  }, [scene]);

  return <primitive object={scene} {...props} />;
}

useGLTF.preload("/Channel_Tv.glb");

function CurvedTV() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -pointer.y * 0.3,
      0.02
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.5,
      0.003
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
        <Model scale={4} position={[34, -10, 20]} />
      </Float>
    </group>
  );
}

export default function Hero() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  // ← new state for history
  const [isAddingToHistory, setIsAddingToHistory] = useState(false);
  const [addedToHistory, setAddedToHistory] = useState(false);

  const currentFeatured = featuredMovies[currentHeroIndex];
  const movie = currentFeatured; // alias for handler

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!hasMounted) return null;

const handleClick = async () => {
  if (isAddingToHistory || addedToHistory) return;

  console.log("Adding movie to history:", movie);
  setIsAddingToHistory(true);

  try {
    await addToWatchHistory({
      movie_id: movie.id?.toString() || movie.title,
      movie_name: movie.title,
    });

    setAddedToHistory(true);
    setTimeout(() => setAddedToHistory(false), 2000);

    toast.success(`${movie.title} added to history!`);
    console.log(`"${movie.title}" added to watch history!`);
  } catch (error) {
    console.error("Error adding movie to history:", error);
    toast.error("There was a problem adding this movie to your history.")
  } finally {
    setIsAddingToHistory(false);
  }
};


  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Canvas
          eventSource={document.body}
          eventPrefix="client"
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

          <Float floatIntensity={1} rotationIntensity={1}>
            <mesh scale={20} position={[-24, 30, -50]}>
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
              scale={17}
              position={[40, -15, -30]}
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
                    className="border-gray-600 text-gray-300 bg-black/50"
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleClick} // ← here be the click!
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg font-semibold shadow-lg shadow-red-500/30"
              >
                <Play className="w-5 h-5 mr-2 fill-white" />
                WATCH NOW
              </Button>
              
            </div>

          </div>
        </div>
      </div>

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