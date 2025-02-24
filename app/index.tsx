import React from "react";
import { useAuth, AuthLoader } from "./AuthHandler"; // 🔥 Endret fra "@/components/AuthHandler" til "./AuthHandler"
import ShiftViewer from "./ShiftViewer"; // 🔥 Endret fra "@/components/ShiftViewer" til "./ShiftViewer"

const App: React.FC = () => {
    const isAuthenticated = useAuth();

    if (isAuthenticated === null) {
        return <AuthLoader />;
    }

    return <ShiftViewer />;
};

export default App;
