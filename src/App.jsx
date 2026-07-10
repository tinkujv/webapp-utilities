import { useState } from 'react'
import { tools } from './tools/registry.js'
import './App.css'

function App() {
  const [activeToolId, setActiveToolId] = useState(tools[0].id)
  const activeTool = tools.find((tool) => tool.id === activeToolId)
  const ActiveComponent = activeTool.Component

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <div className="app-nav-title">Explain It</div>
        <ul className="app-nav-list">
          {tools.map((tool) => (
            <li key={tool.id}>
              <button
                type="button"
                className={tool.id === activeToolId ? 'app-nav-button active' : 'app-nav-button'}
                onClick={() => setActiveToolId(tool.id)}
              >
                {tool.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="app-main">
        <h1>{activeTool.name}</h1>
        <p className="app-tagline">{activeTool.tagline}</p>
        <ActiveComponent />
      </main>
    </div>
  )
}

export default App
