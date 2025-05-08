"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2 max-w-xs", className)}  // shrink padding + limit width
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-2",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium", // slightly smaller
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-6 bg-transparent p-0 opacity-60 hover:opacity-100" // smaller buttons
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-separate border-spacing-0.5", // tighter spacing
        head_row: "flex",
        head_cell:
          "text-muted-foreground w-8 h-8 flex items-center justify-center font-medium text-[0.7rem]",
        row: "flex w-full",
        cell: cn(
          "relative w-8 h-8 p-0 text-center text-xs focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-start)]:rounded-l-sm [&:has(>.day-range-end)]:rounded-r-sm"
            : "rounded-sm"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "w-full h-full flex items-center justify-center p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground font-semibold",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-3", className)} {...props} /> // smaller icons
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-3", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}

export { Calendar }
