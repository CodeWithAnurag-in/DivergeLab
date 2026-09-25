import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-['JetBrains_Mono'] uppercase tracking-wider cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-zinc-200 shadow-md",
        outline: "border border-white/20 bg-[#090a0f] text-white hover:bg-white/10 hover:border-white/40",
        secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
        ghost: "hover:bg-white/5 text-zinc-300 hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2 text-xs",
        sm: "h-9 rounded-md px-3 text-[11px]",
        lg: "h-11 rounded-md px-8 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
