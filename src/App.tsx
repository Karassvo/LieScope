// src/App.tsx

// import './App.css'; // Эту строку мы удалили

import GameContainer from './container/GameContainer'; // ИСПРАВЛЕННЫЙ ПУТЬ

function App() {
  return (
    <div className="font-sans">
      <GameContainer />
    </div>
  );
}

export default App;