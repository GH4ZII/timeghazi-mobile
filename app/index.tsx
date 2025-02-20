// 📌 Importerer ting vi trenger fra React
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, FlatList, Text, View } from "react-native"; // 📌 UI-komponenter
import { registerRootComponent } from "expo"; // 📌 Expo trenger dette for å starte appen
import { fetchShifts, Shift } from "@/api"; // 📌 Henter skift fra backend
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🔐 Lagrer token for å sjekke om brukeren er innlogget
import { useRouter } from "expo-router"; // 📌 Brukes for å navigere mellom sider
import { HubConnection, HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr"; // 📡 SignalR for sanntidsoppdateringer

// 📌 Hoveddelen av appen vår! 🎉
const App: React.FC = () => {
    // 🔹 Lagrer skift (arbeidstider) i en liste
    const [shifts, setShifts] = useState<Shift[]>([]);
    // 🔹 Sjekker om brukeren er logget inn (null betyr at vi fortsatt sjekker)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    // 🔹 Brukes for å navigere til forskjellige sider
    const router = useRouter();
    // 🔹 Holder på SignalR-tilkoblingen for sanntidsoppdateringer
    const [connection, setConnection] = useState<HubConnection | null>(null);

    // **1️⃣ Sjekker om brukeren er logget inn**
    useEffect(() => {
        const checkAuth = async () => {

            const token = await AsyncStorage.getItem("token"); // 🔐 Hent token fra lagring
            if (!token) {
                router.replace("/login"); // ❌ Hvis ingen token, send til login-siden
            } else {
                setIsAuthenticated(true); // ✅ Hvis token finnes, brukeren er innlogget
            }
        };

        checkAuth(); // 🚀 Start sjekken!
    }, []); // ✅ Kjør denne sjekken bare én gang når appen starter

    // **2️⃣ Henter skift fra backend**
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("📡 Henter skift fra backend...");
                const data = await fetchShifts(); // 📡 Hent skift fra serveren
                console.log("✅ Skift hentet:", data);
                setShifts(data); // 🔄 Lagre skiftene i `shifts`-listen
            } catch (error) {
                console.error("❌ Feil ved henting av skift:", error);
            }
        };

        fetchData(); // 🚀 Start henting av data!
    }, []); // ✅ Kjør bare én gang når appen starter

    // **3️⃣ Oppretter SignalR-tilkobling for sanntidsoppdateringer**
    useEffect(() => {
        const setupSignalR = async () => {
            try {
                // 🔹 Lager en ny SignalR-tilkobling
                const newConnection = new HubConnectionBuilder()
                    .withUrl("http://10.0.2.2:5026/shiftHub", { // 📡 Koble til serveren
                        skipNegotiation: true, // 🔹 Hopp over forhandling (bruk WebSockets direkte)
                        transport: HttpTransportType.WebSockets // 📡 Bruk WebSockets for rask kommunikasjon
                    })
                    .withAutomaticReconnect() // 🔄 Prøv å koble til på nytt hvis det feiler
                    .build();

                // 📌 Lagre tilkoblingen i state
                setConnection(newConnection);

                // ❌ Hvis tilkoblingen blir stengt, logg feilen
                newConnection.onclose(error => {
                    console.error("🔴 SignalR-tilkoblingen ble lukket:", error);
                });

                // 🔄 Når serveren sender en oppdatering, hent nye skift
                newConnection.on("ReceiveShiftUpdate", async (message) => {
                    console.log("🔄 SANNTIDSOPPDATERING MOTTATT:", message);
                    const updatedShifts = await fetchShifts();
                    setShifts(updatedShifts);
                });

                await newConnection.start(); // 🚀 Start tilkoblingen!
                console.log("✅ WebSocket connected!");

                // 🔥 **Hent employeeId og bli med i riktig gruppe**
                const storedEmployeeId = await AsyncStorage.getItem("employeeId");
                if (storedEmployeeId) {
                    console.log(`📡 Kaller JoinShiftGroup med EmployeeId: ${storedEmployeeId}`);
                    await newConnection.invoke("JoinShiftGroup", storedEmployeeId);
                }

            } catch (error) {
                console.error("❌ SignalR-feil:", error);
            }
        };

        setupSignalR(); // 🚀 Start SignalR

        return () => {
            if (connection) {
                connection.stop(); // ❌ Hvis komponenten fjernes, stopp tilkoblingen
            }
        };
    }, []); // ✅ Kjør bare én gang når appen starter

    // **4️⃣ Viser en "Laster..." hvis vi fortsatt sjekker om brukeren er innlogget**
    if (isAuthenticated === null) {
        return <ActivityIndicator size="large" />; // 🌀 Viser en loader
    }

    // **5️⃣ Viser skift-listen**
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Mine Skift</Text>

            {/* 🔄 Viser alle skiftene i en liste */}
            <FlatList
                data={shifts} // 📡 Bruk `shifts`-listen
                keyExtractor={(item) => item.id.toString()} // 📌 Hver skift må ha en unik ID
                renderItem={({ item }) => ( // 🎨 Hvordan hvert skift skal vises
                    <View style={{ padding: 10, marginVertical: 5, backgroundColor: "#e3e3e3", borderRadius: 5 }}>
                        <Text>⏰ Start: {new Date(item.startTime).toLocaleString()}</Text>
                        <Text>⏳ Slutt: {new Date(item.endTime).toLocaleString()}</Text>
                        <Text>👤 Ansatt ID: {item.employeeId}</Text>
                    </View>
                )}
            />

            {/* 🔴 Logg ut-knapp */}
            <Button
                title="Logg ut"
                onPress={async () => {
                    await AsyncStorage.removeItem("token"); // ❌ Slett tokenet ved logout
                    router.replace("/login"); // 🚀 Send brukeren til login-siden
                }}
                color="red"
            />
        </View>
    );
};

// 🚀 Registrer hovedkomponenten for Expo (starter appen!)
registerRootComponent(App);

export default App; // 📌 Gjør at andre filer kan bruke denne komponenten
