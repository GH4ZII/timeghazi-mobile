import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Brukes til å lagre token for autentisering

// 📌 Bytt ut med riktig backend-URL
const API_BASE_URL = "http://10.0.2.2:5026/api";

// 📌 Definerer grensesnittet (interface) for et skift
export interface Shift {
    id: number;
    employeeId: number;
    startTime: string;
    endTime: string;
    isApproved: boolean;
}

// 📌 Henter alle skift fra backend
export const fetchShifts = async (): Promise<Shift[]> => {
    try {
        const token = await AsyncStorage.getItem("token"); // 🔐 Henter token fra lagring
        const response = await axios.get(`${API_BASE_URL}/shifts`, {
            headers: {
                Authorization: `Bearer ${token}`, // 📌 Sender token for autentisering
            },
        });
        return response.data;
    } catch (error) {
        console.error("❌ Feil ved henting av skift:", error);
        return [];
    }
};

// 📌 Logger inn brukeren og lagrer token
export const loginUser = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

        if (response.status === 200) {
            const token = response.data.token;
            await AsyncStorage.setItem("token", token); // 🔐 Lagrer token
            console.log("✅ Token lagret:", token);
            return true; // ✅ Innlogging vellykket
        }

        return false; // ❌ Innlogging feilet
    } catch (error) {
        // @ts-ignore
        console.error("❌ Feil ved innlogging:", error.response?.data || error);
        return false;
    }
};
