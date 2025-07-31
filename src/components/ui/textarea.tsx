import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "bg-[#1c1c1c] border-[#6b6b6b] placeholder:text-[#6b6b6b] focus-visible:border-[#6b6b6b] focus-visible:ring-[#6b6b6b]/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-[25px] border bg-transparent px-[25px] py-[25px] text-[14px] shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 text-[#f0f0f0]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
