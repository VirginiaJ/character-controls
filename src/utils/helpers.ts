import {
  Box3,
  Box3Helper,
  Camera,
  Color,
  Scene,
  Vector3,
  Vector3Tuple,
} from "three"

const dist = 4.5
const characterPosition = new Vector3()
const groundPlane = new Vector3(0, 1, 0)
const projectedCameraPosition = new Vector3()
const cameraDir = new Vector3()

const sceneBBoxes: Box3[] = []
const boxHelpers: Box3Helper[] = []
export const getSceneBBoxes = () => sceneBBoxes
export const addSceneBBox = (bbox: Box3) => {
  sceneBBoxes.push(bbox)
}
export const getBoxHelpers = () => boxHelpers
export const addBoxHelper = (boxHelper: Box3Helper) => {
  boxHelpers.push(boxHelper)
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
  const sceneBBoxes = getSceneBBoxes()
  characterBox.translate(offset)

  sceneBBoxes.forEach((bbox: Box3) => {
    if (bbox.intersectsBox(characterBox)) {
      ifIntersect = true
    }
  })
  return ifIntersect
}

export const generateSceneBBoxes = (scene: Scene) => {
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
          const bbox = new Box3().setFromObject(childObj)
          addSceneBBox(bbox)
          const helper = new Box3Helper(
            new Box3().setFromObject(childObj),
            new Color(0xffff00)
          )
          addBoxHelper(helper)
          helper.visible = false
          scene.add(helper)
        }
      })
    }
  })
  return getSceneBBoxes()
}
