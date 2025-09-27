import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "Select date", className }: DatePickerProps) {
  const selectedDate = value ? new Date(value) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm",
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedDate ? selectedDate.toLocaleDateString("pl-PL") : placeholder}
          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Calendar
          className="rounded-md border w-auto"
          mode="single"
          selected={selectedDate}
onSelect={(date) => {
  if (date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0") // miesiące są 0-indexed
    const day = String(date.getDate()).padStart(2, "0")
    onChange(`${year}-${month}-${day}`)
  }
}}

          captionLayout="dropdown"
          
        />
      </PopoverContent>
    </Popover>
  )
}
