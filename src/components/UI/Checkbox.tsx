import { useStore } from "../../store"

export const Checkbox = () => {
  const isOrbitControlsEnabled = useStore(
    (state) => state.isOrbitControlsEnabled
  )
  const setIsOrbitControlsEnabled = useStore(
    (state) => state.setIsOrbitControlsEnabled
  )

  return (
    <div className="checkbox">
      <input
        id="checkbox"
        type="checkbox"
        role="switch"
        checked={isOrbitControlsEnabled}
        onChange={() => setIsOrbitControlsEnabled(!isOrbitControlsEnabled)}
      />
      <label className="checkbox_label" htmlFor="checkbox">
        Enable orbit controls
      </label>
    </div>
  )
}
