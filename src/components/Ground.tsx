import { useEffect } from "react"

import { useLoader } from "@react-three/fiber"
import { RepeatWrapping } from "three"
import { TextureLoader } from "three/src/loaders/TextureLoader"

export const Ground = () => {
  const loadedTextures = useLoader(TextureLoader, [
    "textures/texture.jpg",
    "textures/textureDisp.jpg",
    "textures/textureNormal.jpg",
  ])

  useEffect(() => {
    if (loadedTextures) {
      loadedTextures.forEach((texture) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(15, 15)
      })
    }
  }, [loadedTextures])

  return (
    <mesh
      name="ground"
      position={[0, -0.1, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[50, 50, 500, 500]} />
      <meshStandardMaterial
        color={"#262934"}
        map={loadedTextures[0]}
        normalMap={loadedTextures[1]}
        displacementMap={loadedTextures[2]}
        displacementScale={0.1}
        roughness={0.8}
      />
    </mesh>
  )
}
