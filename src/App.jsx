import { useState } from 'react'
import { tools } from './tools/registry.js'
import './App.css'

function App() {
  const [activeToolId, setActiveToolId] = useState(tools[0].id)
  const activeTool = tools.find((tool) => tool.id === activeToolId)
  const ActiveComponent = activeTool.Component

  return (
    <div className="app-shell">
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
            {tool.name}
          </button>
        ))}
      </div>

      <main className="app-main">
        <h1>{activeTool.name}</h1>
        <p className="app-tagline">{activeTool.tagline}</p>
        <ActiveComponent />
      </main>
    </div>
  )
}

export default App
