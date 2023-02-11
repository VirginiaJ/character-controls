import {
  Box3,
  Box3Helper,
  Camera,
  Color,
  Scene,
  Vector3,
  Vector3Tuple,
} from "three"
import { OBB } from "three-stdlib"

const dist = 4.5
const characterPosition = new Vector3()
const groundPlane = new Vector3(0, 1, 0)
const projectedCameraPosition = new Vector3()
const cameraDir = new Vector3()

let sceneOBBs: OBB[] = []
export const getSceneOBBs = () => sceneOBBs
export const resetSceneOBBs = () => (sceneOBBs = [])
export const addSceneOBB = (obb: OBB) => {
  sceneOBBs.push(obb)
}

// putting character in fron of camera
export const getCharacterPosition = (camera: Camera): Vector3Tuple => {
  camera.getWorldDirection(cameraDir)
  cameraDir.projectOnPlane(groundPlane)
  characterPosition.copy(cameraDir).multiplyScalar(dist)
  projectedCameraPosition.copy(camera.position).projectOnPlane(groundPlane)
  characterPosition.add(projectedCameraPosition)
  return [characterPosition.x, characterPosition.y, characterPosition.z]
}

export const checkForCollisions = (characterBox: Box3, offset: Vector3) => {
  let ifIntersect = false
  const sceneOBBs = getSceneOBBs()
  characterBox.translate(offset)

  sceneOBBs.forEach((obb: OBB) => {
    if (obb.intersectsBox3(characterBox)) {
      ifIntersect = true
    }
  })
  return ifIntersect
}

export const generateSceneOBBs = (scene: Scene) => {
  const relevantObjects = scene.children.filter(
    (child: any) =>
      !child.isLight &&
      !child.isPoints &&
      child.name !== "character" &&
      child.name !== "ground"
  )
  relevantObjects.forEach((object: any) => {
    if (object.children.length > 0) {
      object.traverse((childObj: any) => {
        if (childObj.isMesh && childObj.children.length === 0) {
          const obb = new OBB().fromBox3(new Box3().setFromObject(childObj))
          addSceneOBB(obb)
          const helper = new Box3Helper(
            new Box3().setFromObject(childObj),
            new Color(0xffff00)
          )
          scene.add(helper)
        }
      })
    }
  })
  return getSceneOBBs()
}
