import { useState } from 'react'
import { tools } from './tools/registry.js'
import ThemeToggle from './ThemeToggle.jsx'
import './App.css'

function App() {
  const [activeToolId, setActiveToolId] = useState(tools[0].id)
  const activeTool = tools.find((tool) => tool.id === activeToolId)
  const ActiveComponent = activeTool.Component

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <div className="tool-toggle" role="tablist">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              role="tab"
              aria-selected={tool.id === activeToolId}
              className={tool.id === activeToolId ? 'tool-toggle-button active' : 'tool-toggle-button'}
              onClick={() => setActiveToolId(tool.id)}
            >
              <span className="tool-toggle-icon" aria-hidden="true">{tool.icon}</span>
              {tool.name}
            </button>
          ))}
        </div>
        <ThemeToggle />
      </div>

      <main className="app-main" key={activeTool.id}>
        <h1>{activeTool.name}</h1>
        <p className="app-tagline">{activeTool.tagline}</p>
        <ActiveComponent />
      </main>
    </div>
  )
}

export default App
