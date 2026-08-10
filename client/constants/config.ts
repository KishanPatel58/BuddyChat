import { Platform } from "react-native";

const HOST = Platform.select({
    ios: "10.234.8.52",
    android: "10.234.8.52",
    default: "localhost"
})

export const API_BASE_URL = `http://${HOST}:3000`
export const WS_URL = `ws://${HOST}:3000`

