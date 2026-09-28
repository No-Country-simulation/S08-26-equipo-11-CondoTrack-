import AppRouter from "@/core/router/AppRouter";
import { AppProviders } from "@/core/providers/AppProviders";
import "./index.css";

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
