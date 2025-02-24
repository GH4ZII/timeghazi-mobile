import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button } from "react-native";
import { fetchShifts, Shift } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HubConnection, HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import { useRouter } from "expo-router";

const ShiftViewer: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("📡 Henter skift fra backend...");
                const data = await fetchShifts();
                console.log("✅ Skift hentet:", data);
                setShifts(data);
            } catch (error) {
                console.error("❌ Feil ved henting av skift:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const setupSignalR = async () => {
            try {
                const newConnection = new HubConnectionBuilder()
                    .withUrl("http://10.0.2.2:5026/shiftHub", {
                        skipNegotiation: true,
                        transport: HttpTransportType.WebSockets
                    })
                    .withAutomaticReconnect()
                    .build();

                setConnection(newConnection);

                newConnection.onclose(error => {
                    console.error("🔴 SignalR-tilkoblingen ble lukket:", error);
                });

                newConnection.on("ReceiveShiftUpdate", async (message) => {
                    console.log("🔄 SANNTIDSOPPDATERING MOTTATT:", message);
                    const updatedShifts = await fetchShifts();
                    setShifts(updatedShifts);
                });

                await newConnection.start();
                console.log("✅ WebSocket connected!");

                const storedEmployeeId = await AsyncStorage.getItem("employeeId");
                if (storedEmployeeId) {
                    console.log(`📡 Kaller JoinShiftGroup med EmployeeId: ${storedEmployeeId}`);
                    await newConnection.invoke("JoinShiftGroup", storedEmployeeId);
                }

            } catch (error) {
                console.error("❌ SignalR-feil:", error);
            }
        };

        setupSignalR();

        return () => {
            if (connection) {
                connection.stop();
            }
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

            <Button
                title="Logg ut"
                onPress={async () => {
                    await AsyncStorage.removeItem("token");
                    router.replace("/login");
                }}
                color="red"
            />
        </View>
    );
};

export default ShiftViewer;
