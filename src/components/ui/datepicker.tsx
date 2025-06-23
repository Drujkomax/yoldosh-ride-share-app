
import * as React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Выберите дату", className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-12 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm",
            "hover:border-slate-300 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20",
            "justify-start text-left font-normal pl-4",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-yoldosh-primary" />
          {value ? format(value, "dd MMMM yyyy", { locale: ru }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-lg border-0 shadow-2xl rounded-2xl" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          className="pointer-events-auto rounded-2xl"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-3",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center mb-4",
            caption_label: "text-lg font-bold text-slate-800",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-8 w-8 bg-gradient-primary text-white hover:bg-gradient-secondary rounded-xl transition-all duration-300 hover:scale-110"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex mb-2",
            head_cell: "text-slate-600 rounded-md w-10 font-medium text-sm text-center py-2",
            row: "flex w-full mt-2",
            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 hover:bg-yoldosh-primary/10 rounded-xl transition-all duration-200",
            day: cn(
              "h-10 w-10 p-0 font-normal rounded-xl hover:bg-yoldosh-primary hover:text-white transition-all duration-300 hover:scale-110",
              "focus:bg-yoldosh-primary focus:text-white"
            ),
            day_selected: "bg-gradient-primary text-white hover:bg-gradient-secondary hover:text-white focus:bg-gradient-primary focus:text-white shadow-lg scale-110",
            day_today: "bg-yoldosh-accent/20 text-yoldosh-accent font-bold",
            day_outside: "text-slate-400 opacity-50",
            day_disabled: "text-slate-400 opacity-30",
            day_range_middle: "aria-selected:bg-yoldosh-primary/20 aria-selected:text-yoldosh-primary",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
