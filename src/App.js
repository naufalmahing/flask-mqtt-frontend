import React from 'react'
import HookMqtt from './components/Hook/'
// Hook or Class
// import ClassMqtt from './components/Class/'
import './App.css'
import Login from './Login'
import RealTimeChart from './RealTimeChart'

function App() {
  return (
    <div className="App">
      <HookMqtt />
      {/* <Login /> */}
      {/* Hook or Class */}
      {/* <ClassMqtt /> */}

      {/* <RealTimeChart /> */}
    </div>
  )
}

export default App