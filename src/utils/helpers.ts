import { Box3, Camera, Object3D, Vector3, Vector3Tuple } from "three"

const dist = 4.5
const characterPosition = new Vector3()
const groundPlane = new Vector3(0, 1, 0)
const projectedCameraPosition = new Vector3()
const cameraDir = new Vector3()
const collisionBox = new Box3()

export const getCharacterPosition = (camera: Camera): Vector3Tuple => {
  camera.getWorldDirection(cameraDir)
  cameraDir.projectOnPlane(groundPlane)
  characterPosition.copy(cameraDir).multiplyScalar(dist)
  projectedCameraPosition.copy(camera.position).projectOnPlane(groundPlane)
  characterPosition.add(projectedCameraPosition)
  return [characterPosition.x, characterPosition.y, characterPosition.z]
}

export const checkForCollisions = (
  characterBox: Box3,
  objectsToTestForCollisions: Object3D[],
  offset: Vector3
) => {
  let ifIntersect = false
  characterBox.translate(offset)

  objectsToTestForCollisions.forEach((object: any) => {
    if (object.children.length > 0) {
      object.traverse((childObj: any) => {
        if (childObj.isMesh && childObj.children.length === 0) {
          collisionBox.setFromObject(childObj)
          if (collisionBox.intersectsBox(characterBox)) {
            ifIntersect = true
          }
        }
      })
    } else if (object.isMesh) {
      collisionBox.setFromObject(object)
      if (collisionBox.intersectsBox(characterBox)) ifIntersect = true
    }
  })
  return ifIntersect
}
