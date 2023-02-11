import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react"

import { useThree } from "@react-three/fiber"
import { Box3, Euler, Group, Object3D, Quaternion, Vector3 } from "three"
import { OrbitControls as OrbitControlsType } from "three-stdlib"

import { useStore } from "../store"
import {
  checkForCollisions,
  generateSceneBBoxes,
  getBoxHelpers,
  getSceneBBoxes,
} from "../utils/helpers"

type ControlKeys =
  | "ArrowUp"
  | "KeyW"
  | "ArrowDown"
  | "KeyS"
  | "ArrowLeft"
  | "KeyA"
  | "ArrowRight"
  | "KeyD"

const axisY = new Vector3(0, 1, 0)
const cameraDir = new Vector3()
const rotationToSide = new Euler(0, Math.PI / 2, 0)
const cameraQuaternion = new Quaternion()
const lookTarget = new Vector3()
const sideDir = new Vector3()
const frontOffset = new Vector3()
const sideOffset = new Vector3()
const characterOffset = new Vector3()
const trackPos = new Vector3()
const characterBox = new Box3()
const dummyObject = new Object3D()
const movementSpeed = 1

export const useCharacterControls = (
  characterRef: MutableRefObject<Group | null>,
  controlsRef: MutableRefObject<OrbitControlsType | null>
) => {
  const { camera, scene } = useThree()
  const moveForward = useRef(false)
  const moveBackward = useRef(false)
  const moveLeft = useRef(false)
  const moveRight = useRef(false)
  const isOrbitControlsEnabled = useStore(
    (state) => state.isOrbitControlsEnabled
  )
  const ifShowCollisionBoxes = useStore((state) => state.ifShowCollisionBoxes)
  const setControls = useStore((state) => state.setControls)

  const camGroup = useMemo(() => new Group(), [])
  const trackObject = useMemo(() => {
    const object = new Object3D()
    camGroup.add(object)
    return object
  }, [camGroup])

  const keyMap: Record<ControlKeys, (state: boolean) => void> = useMemo(
    () => ({
      ArrowUp: (ifActive: boolean) => setControls("moveForward", ifActive),
      KeyW: (ifActive: boolean) => setControls("moveForward", ifActive),
      ArrowDown: (ifActive: boolean) => setControls("moveBack", ifActive),
      KeyS: (ifActive: boolean) => setControls("moveBack", ifActive),
      ArrowLeft: (ifActive: boolean) => setControls("moveLeft", ifActive),
      KeyA: (ifActive: boolean) => setControls("moveLeft", ifActive),
      ArrowRight: (ifActive: boolean) => setControls("moveRight", ifActive),
      KeyD: (ifActive: boolean) => setControls("moveRight", ifActive),
    }),
    [setControls]
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      if (Object.keys(keyMap).includes(e.code)) {
        keyMap[e.code as ControlKeys](true)
      }

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          moveForward.current = true
          break

        case "ArrowLeft":
        case "KeyA":
          moveLeft.current = true
          break

        case "ArrowDown":
        case "KeyS":
          moveBackward.current = true
          break

        case "ArrowRight":
        case "KeyD":
          moveRight.current = true
          break
      }
    },
    [keyMap]
  )

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (Object.keys(keyMap).includes(e.code)) {
        keyMap[e.code as ControlKeys](false)
      }

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          moveForward.current = false
          break

        case "ArrowLeft":
        case "KeyA":
          moveLeft.current = false
          break

        case "ArrowDown":
        case "KeyS":
          moveBackward.current = false
          break

        case "ArrowRight":
        case "KeyD":
          moveRight.current = false
          break
      }
    },
    [keyMap]
  )

  useEffect(() => {
    if (getBoxHelpers().length > 0)
      getBoxHelpers().forEach(
        (boxHelper) => (boxHelper.visible = ifShowCollisionBoxes)
      )
  }, [ifShowCollisionBoxes])

  useEffect(() => {
    characterRef.current && characterBox.setFromObject(characterRef.current)
  }, [characterRef])

  useEffect(() => {
    getSceneBBoxes().length === 0 &&
      // wrapping in setTimeOut for transformations to be applied when generating
      setTimeout(() => {
        generateSceneBBoxes(scene)
      }, 1000)
  }, [scene])

  useEffect(() => {
    camGroup.position.copy(camera.position)
    trackObject.position.set(0, 0, 0)
    if (characterRef.current && !isOrbitControlsEnabled) {
      characterOffset
        .copy(camera.position)
        .sub(characterRef.current.position)
        .projectOnPlane(axisY)

      trackObject.position.copy(characterOffset.clone().negate())
      trackObject.translateY(
        -camera.position.y + characterRef.current.position.y
      )
      characterRef.current.position.copy(trackObject.getWorldPosition(trackPos))
    }
  }, [characterRef, camera, trackObject, camGroup, isOrbitControlsEnabled])

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("keyup", onKeyUp)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("keyup", onKeyUp)
    }
  }, [onKeyDown, onKeyUp])

  const updateCharacterControls = useCallback(
    (delta: number) => {
      if (!characterRef.current || !camera) return
      const speed = delta * movementSpeed

      camera.getWorldDirection(cameraDir)
      cameraQuaternion.copy(camera.quaternion)
      cameraDir.projectOnPlane(axisY)
      camGroup.position.copy(camera.position)
      characterBox.setFromObject(characterRef.current)

      dummyObject.position.copy(characterRef.current.position)

      lookTarget.copy(characterRef.current.position)

      if (controlsRef.current?.enabled) camera.rotation.set(0, 0, 0)
      characterRef.current.rotation.set(0, 0, 0)

      if (moveForward.current || moveBackward.current) {
        dummyObject.translateOnAxis(
          cameraDir,
          moveForward.current ? speed : -speed
        )
        frontOffset
          .copy(dummyObject.position)
          .sub(characterRef.current.position)

        const ifIntersect = checkForCollisions(characterBox, frontOffset)
        if (!ifIntersect) {
          characterRef.current.position.add(frontOffset)
          camera.position.add(frontOffset)
        }

        moveForward.current
          ? lookTarget.add(cameraDir)
          : lookTarget.sub(cameraDir)
      }
      if (moveLeft.current || moveRight.current) {
        sideDir.copy(cameraDir).applyEuler(rotationToSide)

        if (controlsRef.current?.enabled) {
          dummyObject.translateOnAxis(
            sideDir,
            moveLeft.current ? speed : -speed
          )
          sideOffset
            .copy(dummyObject.position)
            .sub(characterRef.current.position)

          const ifIntersect = checkForCollisions(characterBox, sideOffset)
          if (!ifIntersect) {
            characterRef.current.position.add(sideOffset)
            camera.position.add(sideOffset)
          }
        } else {
          camGroup.rotateY(moveLeft.current ? 0.005 : -0.005)
          sideOffset
            .copy(trackObject.getWorldPosition(trackPos))
            .sub(characterRef.current.position)
          const ifIntersect = checkForCollisions(characterBox, sideOffset)
          if (!ifIntersect) {
            characterRef.current.position.add(sideOffset)
          }
        }

        moveLeft.current ? lookTarget.add(sideDir) : lookTarget.sub(sideDir)
      }

      if (controlsRef.current?.enabled) {
        controlsRef.current?.target.copy(characterRef.current.position)
        camera.applyQuaternion(cameraQuaternion)
      } else {
        camera.lookAt(characterRef.current.position)
      }
      characterRef.current.lookAt(lookTarget)
    },
    [characterRef, camera, camGroup, controlsRef, trackObject]
  )

  return { updateCharacterControls }
}
