import axios from "axios";

const API_BASE_URL = "http://10.0.2.2:5026/api"; // Bytt ut med riktig backend-url

export interface Shift {
    id: number;
    employeeId: number;
    startTime: string;
    endTime: string;
    isApproved: boolean;
}

export const fetchShifts = async (): Promise<Shift[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/shifts`);
        return response.data;
    } catch (error) {
        console.error("Error fetching shifts:", error);
        return [];
    }
};
