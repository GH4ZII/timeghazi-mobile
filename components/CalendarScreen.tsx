import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { fetchShifts, Shift } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HubConnection, HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.0.2.2:5026/api";
const signalRBaseUrl = apiBaseUrl.replace("/api", "");
const shiftHubUrl = `${signalRBaseUrl}/shiftHub`;

const formatDateToMonth = (date: Date) => date.toISOString().split("T")[0].slice(0, 7);

const CalendarScreen: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
    const [totalHours, setTotalHours] = useState(0);
    const [currentMonth, setCurrentMonth] = useState(formatDateToMonth(new Date()));

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const setupSignalR = async () => {
            const connection = new HubConnectionBuilder()
                .withUrl(shiftHubUrl, { transport: HttpTransportType.LongPolling })
                .withAutomaticReconnect()
                .build();

            connection.on("ReceiveShiftUpdate", async () => {
                const updatedShifts = await fetchShifts();
                setShifts(updatedShifts);
                refreshMonthView(updatedShifts, currentMonth);
            });

            await connection.start();

            const employeeId = await AsyncStorage.getItem("employeeId");
            if (employeeId) {
                await connection.invoke("JoinShiftGroup", employeeId);
            }
        };

        setupSignalR();
    }, []);

    const fetchData = async () => {
        const shifts = await fetchShifts();
        setShifts(shifts);
        refreshMonthView(shifts, currentMonth);
    };

    const handleMonthChange = (month: any) => {
        const newMonth = `${month.year}-${month.month.toString().padStart(2, "0")}`;
        setCurrentMonth(newMonth);
        refreshMonthView(shifts, newMonth);
    };

    const refreshMonthView = (allShifts: Shift[], month: string) => {
        const marks: { [key: string]: any } = {};
        let totalHours = 0;

        allShifts.forEach(shift => {
            const startDate = new Date(shift.startTime);
            const endDate = new Date(shift.endTime);

            if (formatDateToMonth(startDate) === month) {
                const date = shift.startTime.split("T")[0];
                marks[date] = { marked: true, selected: true, selectedColor: "#ffcccb" };
                totalHours += (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
            }
        });

        setMarkedDates(marks);
        setTotalHours(totalHours);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>📅 Kalender</Text>
            <Text style={styles.summary}>Timer i {currentMonth}: {totalHours.toFixed(1)} timer</Text>
            <Calendar markingType="custom" markedDates={markedDates} onMonthChange={handleMonthChange} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 24, fontWeight: "bold" },
    summary: { fontSize: 18, marginBottom: 20 }
});

export default CalendarScreen;
