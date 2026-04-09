import './App.css'
import { QueryProviders } from './app/providers/QueryProviders'
import HomePage from './pages/HomePage'

function App() {
  return (
    <QueryProviders>
      <HomePage />
    </QueryProviders>
  )
}

export default App
