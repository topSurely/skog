import { useEffect, useRef, useState } from 'react'
import { ThreeRender } from './ThreeRender';
import { HashRouter as Router, useLocation } from 'react-router-dom';
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
  const [loadProgress, setLoadProgress] = useState<{ total: number, loaded: number }>({ loaded: 0, total: 100 })


  const progress = (e: ProgressEvent) => {
    setLoadProgress({ loaded: e.loaded, total: e.total });
  }

  useEffect(() => {
    if (containerRef.current != null) {
      const renderer = new ThreeRender(containerRef.current)
      renderer.progress = progress
      console.log(location.pathname);
      if (location.pathname === '/valentine') {
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
      {
        loadProgress.loaded < loadProgress.total &&
        <div style={{ position: "absolute", bottom: 0, color: "white", fontSize: "5vh" }}>
          Skög is loading: {((loadProgress.loaded / loadProgress.total) * 100).toFixed(0)}%
        </div>}
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }}>

      </div>
    </>)
}

export default App
