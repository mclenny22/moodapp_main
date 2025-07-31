import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "relative rounded-xl shrink-0 inline-flex items-center justify-center text-[12px] font-normal w-fit whitespace-nowrap [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:outline-none transition-all duration-200 overflow-hidden font-sans",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--button-primary)] text-[var(--button-text-primary)] px-[9px] py-[3px]",
        secondary:
          "border border-[var(--card-border)] text-[var(--button-text-secondary)] px-[9px] py-[3px]",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 px-[9px] py-[3px]",
        outline:
          "border border-[var(--card-border)] text-[var(--button-text-secondary)] px-[9px] py-[3px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
