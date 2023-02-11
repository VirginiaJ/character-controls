import { create } from "zustand"

export type ControlsMode = "moveForward" | "moveBack" | "moveLeft" | "moveRight"

type State = {
  isOrbitControlsEnabled: boolean
  ifShowCollisionBoxes: boolean
  controls: Record<ControlsMode, boolean>
  setControls: (mode: ControlsMode, ifActive: boolean) => void
  setIsOrbitControlsEnabled: (value: boolean) => void
  setIfShowCollisionBoxes: (value: boolean) => void
}

export const useStore = create<State>((set) => ({
  isOrbitControlsEnabled: true,
  ifShowCollisionBoxes: false,
  controls: {
    moveForward: false,
    moveBack: false,
    moveLeft: false,
    moveRight: false,
  },
  setControls: (mode: ControlsMode, ifActive: boolean) =>
    set((state) => ({ controls: { ...state.controls, [mode]: ifActive } })),
  setIsOrbitControlsEnabled: (value: boolean) =>
    set(() => ({ isOrbitControlsEnabled: value })),
  setIfShowCollisionBoxes: (value: boolean) =>
    set(() => ({ ifShowCollisionBoxes: value })),
}))
