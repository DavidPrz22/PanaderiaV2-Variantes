import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-(--estado-disponible) text-primary-foreground [a&]:hover:bg-(--estado-disponible)/90",
        secondary:
          "border-transparent bg-(--estado-inactivo) text-secondary-foreground [a&]:hover:bg-(--estado-inactivo)/90",
        destructive:
          "border-transparent bg-(--estado-agotado) text-white [a&]:hover:bg-(--estado-agotado)/90 focus-visible:ring-(--estado-agotado)/20 dark:focus-visible:ring-(--estado-agotado)/40 dark:bg-(--estado-agotado)/60",
        outline:
          "text-foreground [a&]:hover:bg-(--estado-expirado) [a&]:hover:text-(--estado-expirado)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
