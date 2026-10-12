import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "cyan"
}

export function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/30",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200",
    destructive: "bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-500/20 dark:text-rose-400 dark:border dark:border-rose-500/30",
    outline: "text-slate-950 dark:text-slate-50 border border-slate-200 dark:border-slate-800",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    cyan: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  }

  const selectedVariant = variants[variant] || variants.default

  return (
    <div className={`${base} ${selectedVariant} ${className}`} {...props} />
  )
}

export default Badge
