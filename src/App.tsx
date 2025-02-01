import "./App.css";
import { useWod } from "./wod/use-wod";

function App() {
  const wod = useWod();

  return (
    <>
      <span>{wod}</span>
    </>
  );
}

export default App;
