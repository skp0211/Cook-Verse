import Constants from "expo-constants";

// Auto-detect dev machine IP for physical devices; falls back to localhost for emulators
const debuggerHost =
  Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri ?? "localhost:8081";
const host = debuggerHost.split(":")[0];

export const API_URL = `http://${host}:5001/api`;
