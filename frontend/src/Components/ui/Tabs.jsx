import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "../../lib/utils"

const Tabs = TabsPrimitive.Root

/* Fluffy Cushion Segmented Glass Pill */
const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-center p-1.5 rounded-full bg-white/[0.08] border border-white/25 backdrop-blur-2xl saturate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25),0_10px_28px_rgba(0,0,0,0.35)] text-slate-300",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ease-fluffy focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:text-white data-[state=active]:bg-gradient-to-b data-[state=active]:from-white/30 data-[state=active]:to-cyan-400/15 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/45 data-[state=active]:shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),0_6px_18px_rgba(0,212,255,0.25)] data-[state=active]:scale-[1.03]",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 focus-visible:outline-none animate-fade-in",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
