"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-white/30 p-0.5 transition-all duration-300 ease-fluffy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-400 data-[state=checked]:to-blue-500 data-[state=checked]:shadow-[0_0_20px_rgba(0,212,255,0.55),inset_0_2px_2px_rgba(255,255,255,0.85)] data-[state=unchecked]:bg-white/10 data-[state=unchecked]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)] backdrop-blur-lg",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.45),inset_0_1.5px_2px_rgba(255,255,255,0.95)] ring-0 transition-transform duration-300 ease-fluffy data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
