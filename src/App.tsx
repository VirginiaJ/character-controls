import "./index.css"
import { Suspense } from "react"

import { Canvas } from "@react-three/fiber"

import { Character } from "./components/Character"
import { Forest } from "./components/Forest"
import { Ground } from "./components/Ground"
import { Ruins } from "./components/Ruins"
import { Checkbox } from "./components/UI/Checkbox"
import { InfoBox } from "./components/UI/InfoBox"
import { Wizard } from "./components/Wizard"
import { useStore } from "./store"

function App() {
  const ifShowCollisionBoxes = useStore((state) => state.ifShowCollisionBoxes)
  const isOrbitControlsEnabled = useStore(
    (state) => state.isOrbitControlsEnabled
  )
  const setIsOrbitControlsEnabled = useStore(
    (state) => state.setIsOrbitControlsEnabled
  )
  const setIfShowCollisionBoxes = useStore(
    (state) => state.setIfShowCollisionBoxes
  )
  return (
    <div className="App" id="container">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{
          position: [1.5, 2, 12],
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
      <div className="UI_elements_container">
        <InfoBox />
        <div className="checkboxes_container">
          <Checkbox
            id="controls-checkbox"
            initialValue={isOrbitControlsEnabled}
            label="Enable orbit controls"
            onChange={() => setIsOrbitControlsEnabled(!isOrbitControlsEnabled)}
          />
          <Checkbox
            id="boxes-checkbox"
            initialValue={ifShowCollisionBoxes}
            label="Show collision boxes"
            onChange={() => setIfShowCollisionBoxes(!ifShowCollisionBoxes)}
          />
        </div>
      </div>
    </div>
  )
}

export default App
