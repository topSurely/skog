import { useEffect, useRef } from 'react'
import { ThreeRender } from './ThreeRender';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current != null) {
      const renderer = new ThreeRender(containerRef.current)

      return () => {
        console.log("killin it");
        renderer.kill();
      }
    }
  }, [])

  return (
    <>
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }}>

      </div>
    </>
  )
}

export default App
