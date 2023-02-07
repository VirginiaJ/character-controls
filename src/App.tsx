import "./index.css"
import { Suspense } from "react"

import { Canvas } from "@react-three/fiber"

import { Character } from "./components/Character"
import { Forest } from "./components/Forest"
import { Ground } from "./components/Ground"
import { Ruins } from "./components/Ruins"
import { Wizard } from "./components/Wizard"

function App() {
  return (
    <div className="App" id="container">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{
          position: [3, 2, 12],
          rotation: [-0.3, 0, 0],
          fov: 45,
        }}
      >
        <color attach="background" args={["#202030"]} />
        <fog attach="fog" args={["#202030", 10, 25]} />
        <hemisphereLight intensity={0.5} color="#91907e" groundColor="blue" />
        <Suspense fallback={null}>
          <Character />
          <Wizard />
          <Forest />
          <Ground />
          <Ruins />
        </Suspense>
        <ambientLight intensity={1} />
        <directionalLight
          color="#fcfcfa"
          position={[4, 5, 5]}
          intensity={1.5}
          castShadow
          shadow-bias={-0.0001}
        />
      </Canvas>
    </div>
  )
}

export default App
