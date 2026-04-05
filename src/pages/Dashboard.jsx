import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import CommandCenter from '../modules/CommandCenter'
import NicheFinder from '../modules/NicheFinder'
import Competitors from '../modules/Competitors'
import Persona from '../modules/Storytelling'
import BioGenerator from '../modules/BioGenerator'
import Offers from '../modules/Offers'
import ContentGenerator from '../modules/ContentFactory'
import ContentPlanner from '../modules/ContentPlanner'
import Projects from '../modules/Projects'

const MODULE_MAP = {
  command:     null,
  niche:       NicheFinder,
  competitors: Competitors,
  persona:     Persona,
  bio:         BioGenerator,
  offers:      Offers,
  ideas:       ContentGenerator,
  planner:     ContentPlanner,
  projects:    Projects,
}

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState('command')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="flex-1 overflow-hidden flex flex-col lg:pt-0 pt-14">
        {activeModule === 'command' ? (
          <CommandCenter key="command" onModuleChange={setActiveModule} />
        ) : (
          (() => {
            const ActiveComponent = MODULE_MAP[activeModule]
            return ActiveComponent ? <ActiveComponent key={activeModule} /> : null
          })()
        )}
      </main>
    </div>
  )
}
