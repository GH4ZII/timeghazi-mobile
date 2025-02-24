// 📌 Importerer nødvendige hooks og biblioteker
import { useEffect, useState } from "react"; // 🔹 useEffect for sideeffekter, useState for å lagre tilstand
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🔹 Brukes til å lagre og hente data lokalt (for eksempel token)
import { useRouter } from "expo-router"; // 🔹 Brukes for navigasjon i Expo-apper
import { ActivityIndicator } from "react-native"; // 🔹 Viser en "laster..." animasjon

// 🔥 Custom hook for autentisering
export const useAuth = () => {
    // 🔹 Lager en tilstand for å lagre om brukeren er innlogget eller ikke
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    // 🔹 Henter router-objektet for å kunne navigere brukeren
    const router = useRouter();

    // 🔹 useEffect kjører én gang når komponenten lastes inn
    useEffect(() => {
        const checkAuth = async () => {
            // 🔐 Henter token fra lokal lagring (AsyncStorage)
            const token = await AsyncStorage.getItem("token");

            if (!token) {
                // ❌ Hvis token ikke finnes, send brukeren til login-siden
                router.replace("/login");
            } else {
                // ✅ Hvis token finnes, sett isAuthenticated til true
                setIsAuthenticated(true);
            }
        };

        checkAuth(); // 🚀 Kjør funksjonen for å sjekke autentisering
    }, []); // 🔄 Tom array [] betyr at useEffect kun kjører én gang når komponenten lastes inn

    return isAuthenticated; // 🔙 Returnerer om brukeren er innlogget eller ikke
};

// 🔥 Komponent som viser en "laster..." animasjon mens vi sjekker om brukeren er innlogget
export const AuthLoader = () => {
    return <ActivityIndicator size="large" />; // 🔄 Viser en loader-animasjon
};
