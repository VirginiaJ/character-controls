import { Sparkles, useGLTF } from "@react-three/drei"
import { GroupProps } from "@react-three/fiber"

import { GLTFResult } from "./Character"

const Tree = (props: GroupProps) => {
  const { nodes, materials } = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-4-kaykit/model.gltf"
  ) as GLTFResult

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.treeD_graveyard.geometry}
        material={materials["DarkWood.015"]}
        castShadow
        receiveShadow
      />
    </group>
  )
}

const Rocks = (props: GroupProps) => {
  const { nodes } = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/rocks-forrest/model.gltf"
  ) as GLTFResult
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.rocksA_forest.geometry}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <meshLambertMaterial color="#5c5c5c" />
      </mesh>
    </group>
  )
}

export const Forest = () => (
  <>
    <Rocks position={[2.5, 0, -9]} rotation={[0, -2, 0]} />
    <Rocks position={[-1.5, 0, 2]} />
    <Tree position={[4, 0, -8]} />
    <Tree position={[3, 0, -12]} rotation={[0, -50 * (Math.PI / 180), 0]} />
    <Tree position={[6, 0, -10]} rotation={[0, 140 * (Math.PI / 180), 0]} />
    <Sparkles
      position={[4, 2.5, -10]}
      count={120}
      speed={0.4}
      opacity={1}
      scale={[5, 2, 6]}
      size={4}
      color="#90fcf7"
    />
  </>
)
