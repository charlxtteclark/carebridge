import { useState } from 'react'
import CareTimeline from './components/CareTimeline'
import BurnoutDashboard from './components/BurnoutDashboard'

function App() {
  const [activeTab, setActiveTab] = useState('timeline')

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          padding: '1.5rem 0 0',
        }}
      >
        <button
          onClick={() => setActiveTab('timeline')}
          style={{
            fontSize: 14,
            fontWeight: 500,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #e5e5e5',
            background: activeTab === 'timeline' ? '#1a1a1a' : '#fff',
            color: activeTab === 'timeline' ? '#fff' : '#1a1a1a',
            cursor: 'pointer',
          }}
        >
          Care timeline
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            fontSize: 14,
            fontWeight: 500,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #e5e5e5',
            background: activeTab === 'dashboard' ? '#1a1a1a' : '#fff',
            color: activeTab === 'dashboard' ? '#fff' : '#1a1a1a',
            cursor: 'pointer',
          }}
        >
          Wellbeing
        </button>
      </div>

      {activeTab === 'timeline' ? <CareTimeline /> : <BurnoutDashboard />}
    </div>
  )
}

export default App