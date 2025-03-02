import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Automatisk velg backend-URL basert på miljø
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.0.2.2:5026/api";

// 📌 Shift-modellen (hold den uendret)
export interface Shift {
    id: number;
    employeeId: number;
    startTime: string;
    endTime: string;
    isApproved: boolean;
}

// 🔹 Hent skift for innlogget ansatt
export const fetchShifts = async (): Promise<Shift[]> => {
    try {
        const employeeId = await AsyncStorage.getItem("employeeId");
        if (!employeeId) {
            console.error("❌ Ingen employeeId funnet i AsyncStorage!");
            return [];
        }

        console.log(`📡 Henter skift for employeeId: ${employeeId}`);
        const response = await axios.get(`${API_BASE_URL}/shifts/${employeeId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Feil ved henting av skift:", error);
        return [];
    }
};

// 📌 Login - ingen endring nødvendig
export const loginUser = async (email: string, password: string) => {
    try {
        console.log("📡 Sender innloggingsforespørsel...");
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

        console.log("🔍 Respons fra server:", response.data);

        if (response.status === 200) {
            const { token, employeeId } = response.data;

            if (!employeeId) {
                console.error("❌ Ingen employeeId returnert fra backend!");
                return false;
            }

            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("employeeId", employeeId.toString());

            console.log("✅ Login lagret employeeId:", employeeId);
            return true;
        } else {
            console.error("❌ Innlogging feilet:", response.data);
            return false;
        }
    } catch (error) {
        console.error("❌ Feil ved innlogging:", error);
        return false;
    }
};

// 📌 Logout
export const logoutUser = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("employeeId");
    console.log("🚪 Brukeren er logget ut!");
};
