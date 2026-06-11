// CSS 3D gyroscope: three rings spinning on different axes around
// a glowing core. Pure CSS animation, no canvas or WebGL needed.
export default function Gyro({ size = 120 }) {
  return (
    <div className="gyro" style={{ width: size, height: size }} aria-hidden="true">
      <div className="gyro-ring r1" />
      <div className="gyro-ring r2" />
      <div className="gyro-ring r3" />
      <div className="gyro-core" />
    </div>
  )
}
