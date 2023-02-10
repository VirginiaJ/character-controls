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

type ControlKeys =
  | "ArrowUp"
  | "KeyW"
  | "ArrowDown"
  | "KeyS"
  | "ArrowLeft"
  | "KeyA"
  | "ArrowRight"
  | "KeyD"

let alpha = 0
const movementSpeed = 1
const axisY = new Vector3(0, 1, 0)
const cameraDir = new Vector3()
const rotationToSide = new Euler(0, Math.PI / 2, 0)
const cameraQuaternion = new Quaternion()
const lookTarget = new Vector3()
const sideDir = new Vector3()
const frontOffset = new Vector3()
const characterOffset = new Vector3()
const trackPos = new Vector3()
const characterBox = new Box3()
const dummyObject = new Object3D()
const obj = new Object3D()

export const useCharacterControls = (
  characterRef: MutableRefObject<Group | null>,
  controlsRef: MutableRefObject<OrbitControlsType | null>,
  testObj: any
) => {
  const { camera, scene } = useThree()
  const moveForward = useRef(false)
  const moveBackward = useRef(false)
  const moveLeft = useRef(false)
  const moveRight = useRef(false)
  const dist = useRef(0)
  const setControls = useStore((state) => state.setControls)
  const isOrbitControlsEnabled = useStore(
    (state) => state.isOrbitControlsEnabled
  )

  const camGroup = useMemo(() => new Group(), [])

  const trackObject = useMemo(() => {
    const object = new Object3D()
    camGroup.add(object)
    return object
  }, [camGroup])

  const objectsToTestForCollisions = useMemo(
    () =>
      scene.children.filter(
        (child: any) =>
          !child.isLight &&
          !child.isPoints &&
          child.name !== "character" &&
          child.name !== "ground"
      ),
    [scene]
  )

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

      // dist.current = camera.position
      //   .clone()
      //   .sub(characterRef.current.position)
      //   .projectOnPlane(axisY)
      //   .length()
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
      obj.position.copy(characterRef.current.position)

      lookTarget.copy(obj.position)

      if (controlsRef.current?.enabled) camera.rotation.set(0, 0, 0)
      characterRef.current.rotation.set(0, 0, 0)

      // const ifIntersect = checkForCollisions(
      //   characterBox,
      //   objectsToTestForCollisions,
      //   frontOffset
      // )
      if (moveForward.current || moveBackward.current) {
        dummyObject.translateOnAxis(
          cameraDir,
          moveForward.current ? speed : -speed
        )
        frontOffset.copy(
          dummyObject.position.sub(characterRef.current.position)
        )
        characterRef.current.position.add(frontOffset)
        camera.position.add(frontOffset)
        moveForward.current
          ? lookTarget.add(cameraDir)
          : lookTarget.sub(cameraDir)
      }
      if (moveLeft.current || moveRight.current) {
        sideDir.copy(cameraDir).applyEuler(rotationToSide)

        if (controlsRef.current?.enabled) {
          characterRef.current.translateOnAxis(
            sideDir,
            moveLeft.current ? speed : -speed
          )
          camera.translateOnAxis(sideDir, moveLeft.current ? speed : -speed)
        } else {
          camGroup.rotateY(moveLeft.current ? 0.01 : -0.01)
          characterRef.current.position.copy(
            trackObject.getWorldPosition(trackPos)
          )
        }
        moveLeft.current ? lookTarget.add(sideDir) : lookTarget.sub(sideDir)
      }

      if (controlsRef.current?.enabled) {
        controlsRef.current?.target.copy(characterRef.current.position)
        camera.applyQuaternion(cameraQuaternion)
      } else {
        camera.lookAt(characterRef.current.position)
      }
      // dummyObject.position.copy(characterRef.current.position)
      testObj.current?.position.copy(lookTarget)

      obj.lookAt(lookTarget)

      if (!characterRef.current.quaternion.equals(obj.quaternion)) {
        alpha += delta
        characterRef.current.quaternion.rotateTowards(obj.quaternion, alpha)
        console.log(alpha)
        if (alpha > 1) alpha = 0
      }

      // characterRef.current.quaternion.slerp(obj.quaternion, 1)
      // characterRef.current.lookAt(lookTarget)
    },
    [characterRef, camera, camGroup, controlsRef, testObj, trackObject]
  )

  return { updateCharacterControls }
}
