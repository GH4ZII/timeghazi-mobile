import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('employeeId');
        // Her må du navigere til login manuelt hvis du vil det
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>⚙️ Innstillinger</Text>
            <Button title="Logg ut" color="red" onPress={handleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 24, marginBottom: 20 },
});
