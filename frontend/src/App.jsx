import AppRouter from "@/core/router/AppRouter";
import { AuthProvider } from "@/modules/auth/contexts/AuthContext";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
