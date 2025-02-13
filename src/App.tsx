import { useEffect, useRef } from 'react'
import { ThreeRender } from './ThreeRender';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Color } from 'three';

function App() {

  return (
    <Router>
      <ThreeContainer />
    </Router>
  )
}

function ThreeContainer() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current != null) {
      const renderer = new ThreeRender(containerRef.current)
      console.log(location.pathname);
      if (location.pathname === '/skog/valentine') {
        renderer.renderer.setClearColor(new Color("#F4AAFF"))
      }

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
    </>)
}

export default App
