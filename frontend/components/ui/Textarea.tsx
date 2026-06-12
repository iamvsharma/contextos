"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, id, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-caption text-mute mb-1.5 font-sans">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "w-full min-h-[120px] px-3 py-2 bg-canvas text-ink text-body-sm rounded-sm border border-hairline resize-y",
          "placeholder:text-mute/60",
          "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
          className
        )}
        {...props}
      />
    </div>
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
