import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "box-border content-stretch flex flex-row gap-[15px] items-center justify-start px-[15px] h-[50px] relative rounded-[10px] w-full",
  {
    variants: {
      variant: {
        default: "border-[#72E485] text-[#72E485]",
        destructive: "border-[#F46F6F] text-[#F46F6F]",
        warning: "border-[#F4E46F] text-[#F4E46F]",
        success: "border-[#72E485] text-[#72E485]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {/* Alert Border */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute border border-solid inset-0 pointer-events-none rounded-[10px]",
          variant === "destructive" && "border-[#F46F6F]",
          variant === "warning" && "border-[#F4E46F]",
          (variant === "default" || variant === "success") && "border-[#72E485]"
        )}
      />
      
      {/* Alert Icon */}
      <div className="relative shrink-0 size-3.5">
        <div className={cn(
          "w-full h-full rounded-full",
          variant === "destructive" && "bg-[#F46F6F]",
          variant === "warning" && "bg-[#F4E46F]",
          (variant === "default" || variant === "success") && "bg-[#72E485]"
        )} />
      </div>
      
      {/* Alert Content */}
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-left">
        {props.children}
      </div>
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
