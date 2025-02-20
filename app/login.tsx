import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🔐 Lagrer token og employeeId
import { useRouter } from "expo-router"; // 📌 Navigasjon i Expo
import { loginUser } from "@/api"; // 📌 Importerer login-funksjonen

const LoginScreen = () => {
    const [email, setEmail] = useState(""); // 📌 Lagrer brukerens e-post
    const [password, setPassword] = useState(""); // 📌 Lagrer brukerens passord
    const router = useRouter(); // 📌 Brukes til å navigere etter innlogging

    // 📌 Håndterer innlogging
    const handleLogin = async () => {
        const success = await loginUser(email, password); // 📡 Sender forespørsel til API
        if (success) {
            const employeeId = await AsyncStorage.getItem("employeeId"); // 🔥 Hent lagret employeeId

            if (!employeeId) {
                Alert.alert("❌ Feil", "Kunne ikke hente employeeId etter innlogging!");
                return;
            }

            console.log("✅ Innlogging vellykket! EmployeeId:", employeeId);
            Alert.alert("✅ Innlogging vellykket!");

            router.replace("/"); // 🚀 Naviger til hovedsiden etter innlogging
        } else {
            Alert.alert("❌ Feil", "Feil e-post eller passord!"); // ❌ Viser feilmelding
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Logg inn</Text>
            <TextInput
                placeholder="E-post"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
            />
            <TextInput
                placeholder="Passord"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title="Logg inn" onPress={handleLogin} />
        </View>
    );
};

export default LoginScreen;

// 📌 Stilark for skjermen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
});
