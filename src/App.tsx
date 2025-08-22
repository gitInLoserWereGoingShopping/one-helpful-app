import { GameHub } from "./components/GameHub";
import { GAME_REGISTRY } from "./registry/gameRegistry";
import { ThemeProvider } from "./styles/ThemeProvider";
import "./styles/global.css";

function App() {
  return (
    <ThemeProvider themeId="hub">
      <div className="App">
        <GameHub games={GAME_REGISTRY} />
      </div>
    </ThemeProvider>
  );
}

export default App;
