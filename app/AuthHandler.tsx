import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native";

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("token"); // 🔐 Hent token fra lagring
            if (!token) {
                router.replace("/login"); // ❌ Hvis ingen token, send til login-siden
            } else {
                setIsAuthenticated(true); // ✅ Hvis token finnes, brukeren er innlogget
            }
        };

        checkAuth();
    }, []);

    return isAuthenticated;
};

export const AuthLoader = () => {
    return <ActivityIndicator size="large" />;
};
