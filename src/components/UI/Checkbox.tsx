import { useState } from "react"

interface CheckboxProps {
  id: string
  label: string
  initialValue: boolean
  onChange: () => void
}

export const Checkbox = ({
  id,
  label,
  initialValue,
  onChange,
}: CheckboxProps) => {
  const [checked, setChecked] = useState(initialValue)
  return (
    <div className="checkbox">
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={() => {
          setChecked(!checked)
          onChange()
        }}
      />
      <label className="checkbox-label" htmlFor={id}>
        {label}
      </label>
    </div>
  )
}
