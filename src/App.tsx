import './App.css'
import { QueryProviders } from './app/providers/QueryProviders'
import HomePage from './pages/HomePage'
import ContactFooter from './components/ContactFooter'

function App() {
  return (
    <QueryProviders>
      <HomePage />
      <ContactFooter />
    </QueryProviders>
  )
}

export default App
