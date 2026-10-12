import * as React from "react"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Avatar({ className = "", children, ...props }: AvatarProps) {
  return (
    <div
      className={`relative flex size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-800 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function AvatarImage({ src, alt = "Avatar", className = "", ...props }: AvatarImageProps) {
  const [hasError, setHasError] = React.useState(false)

  if (!src || hasError) return null

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`aspect-square size-full object-cover ${className}`}
      {...props}
    />
  )
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AvatarFallback({ className = "", children, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={`flex size-full items-center justify-center rounded-full bg-slate-800 text-slate-200 font-bold text-sm select-none ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
