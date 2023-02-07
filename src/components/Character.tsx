import { useEffect, useRef } from "react"

import { useAnimations, useGLTF, OrbitControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Group, MeshStandardMaterial } from "three"
import { GLTF, OrbitControls as OrbitControlsType } from "three-stdlib"
import { shallow } from "zustand/shallow"

import { useCharacterControls } from "../hooks/useCharacterControls"
import { useStore } from "../store"

export interface GLTFResult extends GLTF {
  nodes: Record<string, any>
  materials: Record<string, MeshStandardMaterial>
}

let previousTime = 0

export const Character = () => {
  const { camera } = useThree()
  const characterRef = useRef<Group>(null)
  const controlsRef = useRef<OrbitControlsType>(null)
  const controls = useStore((state) => state.controls, shallow)
  const { nodes, materials, animations } = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/korrigan-hat/model.gltf"
  ) as GLTFResult

  const { actions } = useAnimations(animations, characterRef)

  const { updateCharacterControls } = useCharacterControls(
    characterRef,
    controlsRef
  )

  useEffect(() => {
    updateCharacterControls(0, 0)
    actions.pose_chapeau?.play()
    if (characterRef.current) {
      if (controlsRef.current?.enabled) {
        controlsRef.current?.target.copy(characterRef.current.position)
      } else {
        camera.lookAt(characterRef.current.position)
      }
    }
  }, [actions, camera, updateCharacterControls])

  useEffect(() => {
    if (Object.values(controls).includes(true)) {
      actions.course_chapeau?.play()
      actions.pose_chapeau?.stop()
    } else {
      actions.course_chapeau?.stop()
      actions.pose_chapeau?.play()
    }
  }, [controls, actions, camera])

  useFrame(({ clock }) => {
    if (!characterRef.current) return
    const elapsedTime = clock.getElapsedTime()
    const delta = elapsedTime - previousTime
    updateCharacterControls(delta, elapsedTime)
    previousTime = elapsedTime
  })

  return (
    <>
      <group
        ref={characterRef}
        name="character"
        dispose={null}
        position={[1.5, 0, 7]}
        rotation={[0, Math.PI, 0]}
        scale={[1.5, 1.5, 1.5]}
      >
        <group rotation={[0, 0.01, 0]}>
          <primitive object={nodes.root} />
          <skinnedMesh
            geometry={nodes.Chapeau.geometry}
            material={materials["color_main.014"]}
            skeleton={nodes.Chapeau.skeleton}
            castShadow
            receiveShadow
          />
        </group>
      </group>

      <OrbitControls
        ref={controlsRef}
        enabled={true}
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        dampingFactor={0.2}
      />
    </>
  )
}
