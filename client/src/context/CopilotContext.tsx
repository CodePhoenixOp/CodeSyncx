import { ICopilotContext } from "@/types/copilot"
import { createContext, ReactNode, useContext, useState } from "react"
import toast from "react-hot-toast"
import axiosInstance from "../api/pollinationsApi"

const CopilotContext = createContext<ICopilotContext | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useCopilot = () => {
    const context = useContext(CopilotContext)
    if (context === null) {
        throw new Error(
            "useCopilot must be used within a CopilotContextProvider",
        )
    }
    return context
}

const CopilotContextProvider = ({ children }: { children: ReactNode }) => {
    const [input, setInput] = useState<string>("")
    const [output, setOutput] = useState<string>("")
    const [isRunning, setIsRunning] = useState<boolean>(false)

    const generateCode = async () => {
  try {
    if (input.length === 0) {
      toast.error("Please write a prompt")
      return
    }

    toast.loading("Generating code...")
    setIsRunning(true)

    const response = await axiosInstance.post("", {
      contents: [
        {
          parts: [
            {
              text: `You are a code generator copilot for a project named Code Sync.

Rules:
- Generate code only
- No explanations
- Return code in markdown
- If unknown say "I don't know"

Prompt: ${input}`,
            },
          ],
        },
      ],
    })

    const code =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (code) {
      setOutput(code)
      toast.success("Code generated successfully")
    } else {
      toast.error("No code generated")
    }

    toast.dismiss()
    setIsRunning(false)
  } catch (error) {
    console.error(error)
    toast.dismiss()
    toast.error("Failed to generate the code")
    setIsRunning(false)
  }
}
    return (
        <CopilotContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                generateCode,
            }}
        >
            {children}
        </CopilotContext.Provider>
    )
}

export { CopilotContextProvider }
export default CopilotContext
