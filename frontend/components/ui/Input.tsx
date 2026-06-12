"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  inputSize?: "sm" | "md" | "lg"
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, id, inputSize = "md", ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-caption text-mute mb-1.5 font-sans">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          {
            "form-input-sm": inputSize === "sm",
            "form-input": inputSize === "md",
            "form-input-lg": inputSize === "lg",
          },
          "placeholder:text-mute/60",
          error && "border-error focus:ring-error",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-caption text-error font-sans">{error}</p>}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
