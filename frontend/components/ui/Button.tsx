"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "primary-sm"
    | "secondary-sm"
    | "action"
    | "action-sm"
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
            "button-action": variant === "action",
            "button-action-sm": variant === "action-sm",
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

export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((props, ref) => (
  <Button ref={ref} variant="primary" {...props} />
))
PrimaryButton.displayName = "PrimaryButton"

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((props, ref) => (
  <Button ref={ref} variant="secondary" {...props} />
))
SecondaryButton.displayName = "SecondaryButton"

export const PrimaryButtonSm = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((props, ref) => (
  <Button ref={ref} variant="primary-sm" {...props} />
))
PrimaryButtonSm.displayName = "PrimaryButtonSm"

export const SecondaryButtonSm = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((props, ref) => (
  <Button ref={ref} variant="secondary-sm" {...props} />
))
SecondaryButtonSm.displayName = "SecondaryButtonSm"

export const ActionButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((props, ref) => (
  <Button ref={ref} variant="action" {...props} />
))
ActionButton.displayName = "ActionButton"

export const ActionButtonSm = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((props, ref) => (
  <Button ref={ref} variant="action-sm" {...props} />
))
ActionButtonSm.displayName = "ActionButtonSm"

export const NavSignupButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((props, ref) => (
  <Button ref={ref} variant="nav-signup" {...props} />
))
NavSignupButton.displayName = "NavSignupButton"

export const NavLoginButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((props, ref) => (
  <Button ref={ref} variant="nav-login" {...props} />
))
NavLoginButton.displayName = "NavLoginButton"

export const NavAskAiButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((props, ref) => (
  <Button ref={ref} variant="nav-ask-ai" {...props} />
))
NavAskAiButton.displayName = "NavAskAiButton"

export const TabGhostButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((props, ref) => (
  <Button ref={ref} variant="tab-ghost" {...props} />
))
TabGhostButton.displayName = "TabGhostButton"

export const IconCircularButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((props, ref) => (
  <Button ref={ref} variant="icon-circular" {...props} />
))
IconCircularButton.displayName = "IconCircularButton"

export { Button }
