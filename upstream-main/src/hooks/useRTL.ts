import { useCallback, useEffect, useState } from "react"

export function useRTL() {
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr")
  useEffect(() => {
    setDir(document.dir === "rtl" ? "rtl" : "ltr")
  }, [])
  const toggle = useCallback(() => {
    const next = dir === "rtl" ? "ltr" : "rtl"
    document.dir = next
    setDir(next)
  }, [dir])
  return { dir, toggle }
}

