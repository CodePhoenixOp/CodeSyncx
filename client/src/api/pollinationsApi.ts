import axios, { AxiosInstance } from "axios"

const geminiBaseUrl =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"

const instance: AxiosInstance = axios.create({
  baseURL: geminiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  params: {
    key: import.meta.env.VITE_GEMINI_API_KEY,
  },
})

export default instance