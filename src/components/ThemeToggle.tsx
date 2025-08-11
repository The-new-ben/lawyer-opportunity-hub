import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [mode, setMode] = useState("light")
  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "dark") {
      document.documentElement.classList.add("dark")
      setMode("dark")
    }
  }, [])
  function toggle() {
    const next = mode === "dark" ? "light" : "dark"
    document.documentElement.classList.toggle("dark", next === "dark")
    localStorage.setItem("theme", next)
    setMode(next)
  }
  return (
    <Button variant="ghost" size="icon" onClick={toggle}>
      <Sun className={mode === "dark" ? "h-5 w-5 -rotate-90 scale-0 transition-all" : "h-5 w-5 rotate-0 scale-100 transition-all"} />
      <Moon className={mode === "dark" ? "absolute h-5 w-5 rotate-0 scale-100 transition-all" : "absolute h-5 w-5 rotate-90 scale-0 transition-all"} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

