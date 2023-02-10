import { useEffect, useState } from "react"

export const InfoBox = () => {
  const [ifShowInfobox, setIfShowInfobox] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIfShowInfobox(false)
    }, 5000)
  }, [])

  return (
    <>
      {ifShowInfobox && (
        <div className="info-box">
          Use arrow keys or w,s,a,d keys to move the character around. <br />
          Use your mouse to control camera angle if orbit controls are enabled.
        </div>
      )}
    </>
  )
}
