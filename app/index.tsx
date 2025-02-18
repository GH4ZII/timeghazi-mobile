import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { registerRootComponent } from "expo"; // Expo trenger dette
import { HubConnectionBuilder } from "@microsoft/signalr";
import { fetchShifts, Shift } from "@/api"; // Sørg for at api.ts eksisterer!

const App: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);

    useEffect(() => {
        // Opprett en async funksjon inne i useEffect
        const fetchData = async () => {
            try {
                const data = await fetchShifts();
                setShifts(data);
            } catch (error) {
                console.error("Feil ved henting av skift:", error);
            }
        };

        fetchData(); // Kjør async funksjonen

        // Opprett SignalR-forbindelsen
        const connection = new HubConnectionBuilder()
            .withUrl("http://10.0.2.2:5026/shiftHub")
            .withAutomaticReconnect()
            .build();

        connection.start()
            .then(() => {
                console.log("✅ Connected to SignalR");
                connection.on("ReceiveShiftUpdate", async (message) => {
                    console.log("🔄 Sanntidsoppdatering mottatt:", message);
                    fetchData(); // Hent skift på nytt når en oppdatering skjer
                });
            })
            .catch(error => console.error("❌ SignalR-feil:", error));

        return () => {
            connection.stop(); // Cleanup function for å stoppe SignalR når komponenten avmonteres
        };
    }, []);


    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Mine Skift</Text>

            <FlatList
                data={shifts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ padding: 10, marginVertical: 5, backgroundColor: "#e3e3e3", borderRadius: 5 }}>
                        <Text>⏰ Start: {new Date(item.startTime).toLocaleString()}</Text>
                        <Text>⏳ Slutt: {new Date(item.endTime).toLocaleString()}</Text>
                        <Text>👤 Ansatt ID: {item.employeeId}</Text>
                    </View>
                )}
            />
        </View>
    );
};

// 🚀 Registrer hovedkomponenten for Expo
registerRootComponent(App);

export default App;
