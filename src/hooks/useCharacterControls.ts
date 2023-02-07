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

const axisY = new Vector3(0, 1, 0)
const cameraDir = new Vector3()
const rotationToSide = new Euler(0, Math.PI / 2, 0)
const cameraQuaternion = new Quaternion()
const lookTarget = new Vector3()
const sideDir = new Vector3()
const frontOffset = new Vector3()
const sideOffset = new Vector3()
const characterBox = new Box3()
const dummyObject = new Object3D()
const orbitObject = new Object3D()
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
  const setControls = useStore((state) => state.setControls)
  const dist = useRef(0)

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
    camera.add(orbitObject)
    cameraQuaternion.copy(cameraQuaternion)
    camera.rotation.set(0, 0, 0)
    orbitObject.position.set(0, 0, 0)
    if (characterRef.current) {
      const characterOffset = camera.position
        .clone()
        .sub(characterRef.current.position)
        .projectOnPlane(axisY)
      orbitObject.position.copy(characterOffset.negate())
      dist.current = camera.position
        .clone()
        .sub(characterRef.current.position)
        .projectOnPlane(axisY)
        .length()
    }
    camera.setRotationFromQuaternion(cameraQuaternion)

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("keyup", onKeyUp)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("keyup", onKeyUp)
    }
  }, [onKeyDown, onKeyUp, characterRef, camera])

  const updateCharacterControls = useCallback(
    (delta: number, elapsedTime: number) => {
      if (!characterRef.current || !camera) return
      const speed = delta * movementSpeed

      camera.getWorldDirection(cameraDir)
      cameraQuaternion.copy(camera.quaternion)
      cameraDir.projectOnPlane(axisY)

      characterBox.setFromObject(characterRef.current)
      dummyObject.position.copy(characterRef.current.position)

      lookTarget.copy(characterRef.current.position)

      camera.rotation.set(0, 0, 0)
      characterRef.current.rotation.set(0, 0, 0)

      if (moveForward.current) {
        dummyObject.translateOnAxis(cameraDir, speed)
        frontOffset.copy(
          dummyObject.position.sub(characterRef.current.position)
        )
        // const ifIntersect = checkForCollisions(
        //   characterBox,
        //   objectsToTestForCollisions,
        //   frontOffset
        // )

        // characterRef.current.translateOnAxis(cameraDir, speed)
        // camera.translateOnAxis(cameraDir, speed)

        characterRef.current.position.add(frontOffset)
        camera.position.add(frontOffset)
        lookTarget.add(cameraDir)
      }
      if (moveBackward.current) {
        characterRef.current.translateOnAxis(cameraDir, -speed)
        camera.translateOnAxis(cameraDir, -speed)
        lookTarget.sub(cameraDir)
      }
      if (moveLeft.current) {
        sideDir.copy(cameraDir).applyEuler(rotationToSide)
        // characterRotation.set(0, -Math.PI / 2, 0)
        // characterRef.current.translateX(-speed)

        if (controlsRef.current?.enabled) {
          characterRef.current.translateOnAxis(sideDir, speed)
          camera.translateOnAxis(sideDir, speed)
        } else {
          //   console.log(orbitObject.getWorldPosition(new Vector3()))
          // orbitObject.position.x =
          //   dist.current *
          //   Math.sin(Math.PI - camera.rotation.z + elapsedTime * 0.05)
          // orbitObject.position.z =
          //   dist.current *
          //   Math.cos(Math.PI - camera.rotation.z + elapsedTime * 0.05)
          //   console.log(orbitObject.getWorldPosition(new Vector3()))
          // characterRef.current.position.x = orbitObject.getWorldPosition(
          //   new Vector3()
          // ).x
          // characterRef.current.position.z = orbitObject.getWorldPosition(
          //   new Vector3()
          // ).z
          //   console.log(characterRef.current.position)
        }
        lookTarget.add(sideDir)
      }
      if (moveRight.current) {
        sideDir.copy(cameraDir).applyEuler(rotationToSide)
        // characterRotation.set(0, Math.PI / 2, 0)
        // characterRef.current.translateX(speed)

        characterRef.current.translateOnAxis(sideDir, -speed)
        camera.translateOnAxis(sideDir, -speed)
        lookTarget.sub(sideDir)
      }

      if (controlsRef.current?.enabled) {
        controlsRef.current?.target.copy(characterRef.current.position)
        camera.applyQuaternion(cameraQuaternion)
      } else {
        camera.lookAt(characterRef.current.position)
      }
      characterRef.current.lookAt(lookTarget)

      // cameraDir.multiplyScalar(cameraDist)
      // cameraPos.copy(characterRef.current.position).sub(cameraDir)
      // camera.position.copy(cameraPos)
    },
    [characterRef, camera, controlsRef]
  )

  return { updateCharacterControls }
}
