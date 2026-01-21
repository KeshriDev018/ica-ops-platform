import Router from './router'
import { ChatProvider } from './contexts/ChatContext'

function App() {
  return (
    <ChatProvider>
      <Router />
    </ChatProvider>
  )
}

export default App
