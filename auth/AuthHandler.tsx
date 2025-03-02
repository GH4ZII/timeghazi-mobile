import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native";

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                router.replace("/login");
            } else {
                setIsAuthenticated(true);
            }
        };
        checkAuth();
    }, []);

    return isAuthenticated;
};

export const AuthLoader = () => <ActivityIndicator size="large" />;
