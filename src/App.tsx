import './App.css'
import { QueryProviders } from './app/providers/QueryProviders'
import HomePage from './pages/HomePage'
// ContactFooter removed to avoid footer-level contact form
import Silk from './components/Silk'

function App() {
  return (
    <QueryProviders>
      <div className="silk-fullscreen" aria-hidden="true">
        <Silk speed={2.2} scale={1} color="#514c5459" noiseIntensity={0.5} rotation={0.6} />
      </div>
      <HomePage />
    </QueryProviders>
  )
}

export default App
