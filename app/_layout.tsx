import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
    return (
        <Drawer screenOptions={{ headerShown: true }}>
            <Drawer.Screen name="index" options={{ title: "Kalender" }} />
            <Drawer.Screen name="settings" options={{ title: "Innstillinger" }} />
        </Drawer>
    );
}
