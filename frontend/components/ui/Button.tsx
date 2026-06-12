"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "primary-sm"
    | "secondary-sm"
    | "nav-signup"
    | "nav-login"
    | "nav-ask-ai"
    | "tab-ghost"
    | "icon-circular"
  size?: "default" | "sm" | "icon"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-sans font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
          {
            "button-primary": variant === "primary",
            "button-secondary": variant === "secondary",
            "button-primary-sm": variant === "primary-sm",
            "button-secondary-sm": variant === "secondary-sm",
            "nav-cta-signup": variant === "nav-signup",
            "nav-cta-login": variant === "nav-login",
            "nav-cta-ask-ai": variant === "nav-ask-ai",
            "tab-ghost": variant === "tab-ghost",
            "icon-button-circular": variant === "icon-circular",
          },
          // Size overrides if explicit
          size === "sm" && variant !== "primary-sm" && variant !== "secondary-sm" && "px-3 py-1.5 h-8 text-[13px] rounded-sm",
          size === "icon" && "w-10 h-10 p-0 rounded-full",
          props.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
