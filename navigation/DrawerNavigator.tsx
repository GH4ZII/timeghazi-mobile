import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import CalendarScreen from "@/components/CalendarScreen";
import Settings from "@/app/settings";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    return (
        <NavigationContainer>
            <Drawer.Navigator initialRouteName="Kalender">
                <Drawer.Screen name="Kalender" component={CalendarScreen} />
                <Drawer.Screen name="Innstillinger" component={Settings} />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}
