import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🔐 Lagrer token og employeeId

// 📌 Bytt ut med riktig backend-URL
const API_BASE_URL = "https://timeghazi-chephuash3ekdyd6.westeurope-01.azurewebsites.net/api";



// 📌 Definerer grensesnittet (interface) for et skift
export interface Shift {
    id: number;
    employeeId: number;
    startTime: string;
    endTime: string;
    isApproved: boolean;
}

// 🔹 Hent kun skift for innlogget ansatt
export const fetchShifts = async (): Promise<Shift[]> => {
    try {
        const employeeId = await AsyncStorage.getItem("employeeId"); // 🔥 Hent ansattens ID
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

// 📌 Logger inn brukeren, lagrer token OG employeeId
export const loginUser = async (email: string, password: string) => {
    try {
        console.log("📡 Sender innloggingsforespørsel...");
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

        console.log("🔍 Respons fra server:", response.data); // ✅ Logger hele responsen

        if (response.status === 200) {
            const { token, employeeId } = response.data;

            if (!employeeId) {
                console.error("❌ Ingen employeeId returnert fra backend!");
                return false;
            }

            console.log("✅ Lagrer employeeId:", employeeId);
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("employeeId", employeeId.toString());

            // 📌 Sjekker om `employeeId` er lagret riktig
            const storedEmployeeId = await AsyncStorage.getItem("employeeId");
            console.log("🔍 Bekreftelse: Lagret employeeId:", storedEmployeeId);

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


// 📌 Logger ut brukeren
export const logoutUser = async () => {
    await AsyncStorage.removeItem("token"); // ❌ Fjern token
    await AsyncStorage.removeItem("employeeId"); // ❌ Fjern employeeId
    console.log("🚪 Brukeren er logget ut!");
};
