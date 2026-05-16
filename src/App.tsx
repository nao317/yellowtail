import './App.css'
import { QueryProviders } from './app/providers/QueryProviders'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import Silk from './components/Silk'

function App() {
  return (
    <QueryProviders>
      <div className="silk-fullscreen" aria-hidden="true">
        <Silk speed={2.2} scale={1} color="#514c5459" noiseIntensity={0.5} rotation={0.6} />
      </div>
      <RouterProvider router={router} />
    </QueryProviders>
  )
}

export default App
