"use client"

import { Textarea } from "@/components/ui/Textarea"

interface InputSectionProps {
  value: string
  onChange: (value: string) => void
}

export function InputSection({ value, onChange }: InputSectionProps) {
  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter text to preprocess... e.g., 'I LOVED the movie!!! 😍 #amazing @friend https://example.com'"
        rows={4}
      />
      <div className="flex items-center justify-between mt-2">
        <p className="text-caption text-muted">{value.length} characters</p>
      </div>
    </div>
  )
}
