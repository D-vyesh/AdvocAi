import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-[transform,translate,box-shadow,background,border-color,color] duration-300 ease-fluffy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-45 select-none",
  {
    variants: {
      variant: {
        default:
          "btn-fluffy-primary",
        aurora:
          "btn-fluffy-aurora",
        secondary:
          "glass-btn-secondary",
        emerald:
          "btn-fluffy-emerald",
        outline:
          "btn-fluffy-glass text-slate-100 hover:text-white",
        glass:
          "btn-fluffy-glass text-white",
        "glass-circle":
          "btn-fluffy-orb text-white",
        ghost:
          "rounded-full text-slate-300 hover:text-white hover:bg-white/15 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.45)] active:scale-95",
        destructive:
          "btn-fluffy-danger",
        link:
          "text-cyan-300 underline-offset-4 hover:underline hover:text-cyan-200 p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-full",
        sm: "h-8 px-4 text-xs rounded-full",
        lg: "h-12 px-8 text-sm rounded-full",
        icon: "h-10 w-10 rounded-full p-0 flex items-center justify-center",
        "icon-sm": "h-8 w-8 rounded-full p-0 flex items-center justify-center",
        "icon-lg": "h-12 w-12 rounded-full p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
