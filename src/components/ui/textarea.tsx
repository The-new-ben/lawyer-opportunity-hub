import * as React from "react"

import { cn } from "@/lib/utils"

 e43qts-codex/fix-404-pages-and-functionality-issues
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
 main

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
