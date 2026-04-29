import axios from "axios"
import { RunContext as RunContextType } from "@/types/run"
import {
    ReactNode,
    createContext,
    useContext,
    useState,
    useEffect,
} from "react"
import toast from "react-hot-toast"
import { useFileSystem } from "./FileContext"

const RunCodeContext = createContext<RunContextType | null>(null)

export const useRunCode = () => {
    const context = useContext(RunCodeContext)
    if (context === null) {
        throw new Error(
            "useRunCode must be used within a RunCodeContextProvider",
        )
    }
    return context
}

/* JDoodle supported languages */
const jdoodleLanguages = [
{ language: "algol", version: "2.8", aliases: ["alg"] },
{ language: "algol", version: "3", aliases: ["alg"] },

{ language: "apl", version: "20", aliases: ["apl"] },

{ language: "awk", version: "5.3.0", aliases: ["awk"] },
{ language: "awk", version: "5.3.1", aliases: ["awk"] },

{ language: "ada", version: "2012", aliases: ["adb"] },
{ language: "ada", version: "2022", aliases: ["adb"] },

{ language: "gccasm", version: "3", aliases: ["asm"] },
{ language: "gccasm", version: "4", aliases: ["asm"] },

{ language: "nasm", version: "4", aliases: ["asm"] },
{ language: "nasm", version: "5", aliases: ["asm"] },

{ language: "bc", version: "0", aliases: ["bc"] },
{ language: "bc", version: "1", aliases: ["bc"] },

{ language: "bash", version: "4", aliases: ["sh"] },
{ language: "bash", version: "5", aliases: ["sh"] },

{ language: "befunge", version: "0", aliases: ["bf"] },
{ language: "befunge", version: "1", aliases: ["bf"] },

{ language: "brainfuck", version: "0", aliases: ["bf"] },

{ language: "c", version: "5", aliases: ["c"] },
{ language: "c", version: "6", aliases: ["c"] },

{ language: "csharp", version: "4", aliases: ["cs"] },
{ language: "csharp", version: "5", aliases: ["cs"] },

{ language: "cpp", version: "5", aliases: ["cpp"] },
{ language: "cpp", version: "6", aliases: ["cpp"] },

{ language: "cpp14", version: "4", aliases: ["cpp"] },
{ language: "cpp14", version: "5", aliases: ["cpp"] },

{ language: "cpp17", version: "1", aliases: ["cpp"] },
{ language: "cpp17", version: "2", aliases: ["cpp"] },

{ language: "c99", version: "4", aliases: ["c"] },
{ language: "c99", version: "5", aliases: ["c"] },

{ language: "clisp", version: "10", aliases: ["lisp"] },
{ language: "clisp", version: "11", aliases: ["lisp"] },

{ language: "iscobol", version: "0", aliases: ["cob"] },

{ language: "cow", version: "0", aliases: ["cow"] },

{ language: "clojure", version: "3", aliases: ["clj"] },
{ language: "clojure", version: "4", aliases: ["clj"] },

{ language: "cobol", version: "3", aliases: ["cob"] },
{ language: "cobol", version: "4", aliases: ["cob"] },

{ language: "coffeescript", version: "4", aliases: ["coffee"] },
{ language: "coffeescript", version: "5", aliases: ["coffee"] },

{ language: "crystal", version: "0", aliases: ["cr"] },

{ language: "d", version: "2", aliases: ["d"] },
{ language: "d", version: "3", aliases: ["d"] },

{ language: "dart", version: "4", aliases: ["dart"] },
{ language: "dart", version: "5", aliases: ["dart"] },

{ language: "deno", version: "0", aliases: ["ts"] },

{ language: "elixir", version: "4", aliases: ["ex"] },
{ language: "elixir", version: "5", aliases: ["ex"] },

{ language: "erlang", version: "1", aliases: ["erl"] },
{ language: "erlang", version: "2", aliases: ["erl"] },

{ language: "fsharp", version: "1", aliases: ["fs"] },
{ language: "fsharp", version: "2", aliases: ["fs"] },

{ language: "fasm", version: "0", aliases: ["asm"] },
{ language: "fasm", version: "1", aliases: ["asm"] },

{ language: "factor", version: "3", aliases: ["factor"] },
{ language: "factor", version: "4", aliases: ["factor"] },

{ language: "falcon", version: "0", aliases: ["fal"] },

{ language: "fantom", version: "0", aliases: ["fan"] },

{ language: "forth", version: "0", aliases: ["fth"] },
{ language: "forth", version: "1", aliases: ["fth"] },

{ language: "fortran", version: "4", aliases: ["f90"] },
{ language: "fortran", version: "5", aliases: ["f90"] },

{ language: "freebasic", version: "2", aliases: ["bas"] },
{ language: "freebasic", version: "3", aliases: ["bas"] },

{ language: "go", version: "4", aliases: ["go"] },
{ language: "go", version: "5", aliases: ["go"] },

{ language: "groovy", version: "4", aliases: ["groovy"] },
{ language: "groovy", version: "5", aliases: ["groovy"] },

{ language: "hack", version: "0", aliases: ["hack"] },

{ language: "haskell", version: "4", aliases: ["hs"] },
{ language: "haskell", version: "5", aliases: ["hs"] },

{ language: "haxe", version: "0", aliases: ["hx"] },
{ language: "haxe", version: "1", aliases: ["hx"] },

{ language: "icon", version: "1", aliases: ["icn"] },
{ language: "icon", version: "2", aliases: ["icn"] },

{ language: "intercal", version: "0", aliases: ["i"] },

{ language: "java", version: "4", aliases: ["java"] },
{ language: "java", version: "5", aliases: ["java"] },

{ language: "jelly", version: "0", aliases: ["jelly"] },

{ language: "julia", version: "0", aliases: ["jl"] },

{ language: "kotlin", version: "3", aliases: ["kt"] },
{ language: "kotlin", version: "4", aliases: ["kt"] },

{ language: "lolcode", version: "0", aliases: ["lol"] },

{ language: "lua", version: "3", aliases: ["lua"] },
{ language: "lua", version: "4", aliases: ["lua"] },

{ language: "moonscript", version: "0", aliases: ["moon"] },

{ language: "mozart", version: "0", aliases: ["oz"] },

{ language: "nemerle", version: "0", aliases: ["n"] },

{ language: "nim", version: "3", aliases: ["nim"] },
{ language: "nim", version: "4", aliases: ["nim"] },

{ language: "nodejs", version: "5", aliases: ["js"] },
{ language: "nodejs", version: "6", aliases: ["js"] },

{ language: "ocaml", version: "2", aliases: ["ml"] },
{ language: "ocaml", version: "3", aliases: ["ml"] },

{ language: "objc", version: "4", aliases: ["m"] },
{ language: "objc", version: "5", aliases: ["m"] },

{ language: "octave", version: "4", aliases: ["m"] },
{ language: "octave", version: "5", aliases: ["m"] },

{ language: "php", version: "4", aliases: ["php"] },
{ language: "php", version: "5", aliases: ["php"] },

{ language: "pascal", version: "2", aliases: ["pas"] },
{ language: "pascal", version: "3", aliases: ["pas"] },

{ language: "perl", version: "4", aliases: ["pl"] },
{ language: "perl", version: "5", aliases: ["pl"] },

{ language: "picolisp", version: "4", aliases: ["l"] },
{ language: "picolisp", version: "5", aliases: ["l"] },

{ language: "pike", version: "0", aliases: ["pike"] },
{ language: "pike", version: "1", aliases: ["pike"] },

{ language: "prolog", version: "2", aliases: ["pl"] },
{ language: "prolog", version: "3", aliases: ["pl"] },

{ language: "python2", version: "2", aliases: ["py"] },
{ language: "python2", version: "3", aliases: ["py"] },

{ language: "python3", version: "4", aliases: ["py"] },
{ language: "python3", version: "5", aliases: ["py"] },

{ language: "r", version: "4", aliases: ["r"] },
{ language: "r", version: "5", aliases: ["r"] },

{ language: "racket", version: "2", aliases: ["rkt"] },
{ language: "racket", version: "3", aliases: ["rkt"] },

{ language: "raku", version: "0", aliases: ["raku"] },

{ language: "rhino", version: "1", aliases: ["js"] },
{ language: "rhino", version: "2", aliases: ["js"] },

{ language: "ruby", version: "4", aliases: ["rb"] },
{ language: "ruby", version: "5", aliases: ["rb"] },

{ language: "rust", version: "4", aliases: ["rs"] },
{ language: "rust", version: "5", aliases: ["rs"] },

{ language: "sql", version: "4", aliases: ["sql"] },
{ language: "sql", version: "5", aliases: ["sql"] },

{ language: "scala", version: "4", aliases: ["scala"] },
{ language: "scala", version: "5", aliases: ["scala"] },

{ language: "scheme", version: "3", aliases: ["scm"] },
{ language: "scheme", version: "4", aliases: ["scm"] },

{ language: "smalltalk", version: "0", aliases: ["st"] },

{ language: "spidermonkey", version: "1", aliases: ["js"] },
{ language: "spidermonkey", version: "2", aliases: ["js"] },

{ language: "swift", version: "4", aliases: ["swift"] },
{ language: "swift", version: "5", aliases: ["swift"] },

{ language: "tasm", version: "0", aliases: ["asm"] },

{ language: "tcl", version: "4", aliases: ["tcl"] },
{ language: "tcl", version: "5", aliases: ["tcl"] },

{ language: "typescript", version: "0", aliases: ["ts"] },

{ language: "unlambda", version: "0", aliases: ["unl"] },
{ language: "unlambda", version: "1", aliases: ["unl"] },

{ language: "vbn", version: "4", aliases: ["vb"] },
{ language: "vbn", version: "5", aliases: ["vb"] },

{ language: "verilog", version: "3", aliases: ["v"] },
{ language: "verilog", version: "4", aliases: ["v"] },

{ language: "whitespace", version: "0", aliases: ["ws"] },

{ language: "yabasic", version: "1", aliases: ["yab"] },
{ language: "yabasic", version: "2", aliases: ["yab"] }
]
const RunCodeContextProvider = ({ children }: { children: ReactNode }) => {
    const { activeFile } = useFileSystem()

    const [input, setInput] = useState<string>("")
    const [output, setOutput] = useState<string>("")
    const [isRunning, setIsRunning] = useState<boolean>(false)

    const [supportedLanguages, setSupportedLanguages] = useState<any[]>([])
    const [selectedLanguage, setSelectedLanguage] = useState<any>({
        language: "",
        version: "",
        aliases: [],
    })

    /* load supported languages */
    useEffect(() => {
        setSupportedLanguages(jdoodleLanguages)
        setSelectedLanguage(jdoodleLanguages[0])
    }, [])

    /* auto select language based on file extension */
    useEffect(() => {
        if (!activeFile) return

        const extension = activeFile.name.split(".").pop()

        const lang = jdoodleLanguages.find((l) =>
            l.aliases.includes(extension || ""),
        )

        if (lang) setSelectedLanguage(lang)
    }, [activeFile])

    const runCode = async () => {
        try {
            if (!activeFile) {
                return toast.error("Please open a file to run the code")
            }

            if (!selectedLanguage.language) {
                return toast.error("Please select a language")
            }

            toast.loading("Running code...")
            setIsRunning(true)

            const response = await axios.post("https://code-synx-1.onrender.com/run", {
                script: activeFile.content,
                stdin: input,
                language: selectedLanguage.language,
                versionIndex: selectedLanguage.version,
            })

            setOutput(response.data.output)

            toast.dismiss()
            setIsRunning(false)
        } catch (error: any) {
            console.error(error?.response?.data)
            toast.dismiss()
            toast.error("Failed to run the code")
            setIsRunning(false)
        }
    }

    return (
        <RunCodeContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                supportedLanguages,
                selectedLanguage,
                setSelectedLanguage,
                runCode,
            }}
        >
            {children}
        </RunCodeContext.Provider>
    )
}

export { RunCodeContextProvider }
export default RunCodeContext