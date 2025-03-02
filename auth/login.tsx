import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { loginUser } from "@/api";

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        const success = await loginUser(email, password);
        if (success) {
            const employeeId = await AsyncStorage.getItem("employeeId");
            if (!employeeId) {
                Alert.alert("❌ Feil", "Kunne ikke hente employeeId etter innlogging!");
                return;
            }
            Alert.alert("✅ Innlogging vellykket!");
            router.replace("/");
        } else {
            Alert.alert("❌ Feil", "Feil e-post eller passord!");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Logg inn</Text>
            <TextInput placeholder="E-post" value={email} onChangeText={setEmail} style={styles.input} />
            <TextInput placeholder="Passord" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
            <Button title="Logg inn" onPress={handleLogin} />
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 10 }
});
