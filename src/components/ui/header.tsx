import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
  children: React.ReactNode
}

export function Header({ className, children }: HeaderProps) {
  return (
    <header className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      {children}
    </header>
  )
}

interface HeaderTitleProps {
  className?: string
  children: React.ReactNode
}

export function HeaderTitle({ className, children }: HeaderTitleProps) {
  return (
    <h1 className={cn("text-3xl font-bold", className)}>
      {children}
    </h1>
  )
}

interface HeaderDescriptionProps {
  className?: string
  children: React.ReactNode
}

export function HeaderDescription({ className, children }: HeaderDescriptionProps) {
  return (
    <p className={cn("text-muted-foreground", className)}>
      {children}
    </p>
  )
} 