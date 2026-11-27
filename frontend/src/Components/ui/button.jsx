import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/lib/button-variants"

/**
 * Fluffy Liquid Glass Button
 * Supports all attractive glass/gel/aurora variants plus cursor specular flare and magnetic attraction.
 */
const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      magnetic = true,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const isMagneticActive =
      magnetic &&
      variant !== "link" &&
      !(typeof className === "string" && className.includes("w-full"))

    const handleMouseMove = (e) => {
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      const localX = e.clientX - rect.left
      const localY = e.clientY - rect.top
      el.style.setProperty("--mx", `${localX}px`)
      el.style.setProperty("--my", `${localY}px`)

      if (isMagneticActive) {
        const relX = localX - rect.width / 2
        const relY = localY - rect.height / 2
        const maxShift = 5
        const shiftX = Math.max(-maxShift, Math.min(maxShift, relX * 0.15))
        const shiftY = Math.max(-maxShift, Math.min(maxShift, relY * 0.2))
        el.style.translate = `${shiftX.toFixed(2)}px ${shiftY.toFixed(2)}px`
      }
      if (onMouseMove) onMouseMove(e)
    }

    const handleMouseLeave = (e) => {
      if (isMagneticActive) {
        e.currentTarget.style.translate = ""
      }
      if (onMouseLeave) onMouseLeave(e)
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
