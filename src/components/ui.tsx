import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-terra text-white shadow-soft hover:bg-terra-dark hover:shadow-lift',
        dark: 'bg-ink text-cream hover:bg-black',
        outline: 'border border-line bg-paper text-ink hover:bg-sand',
        ghost: 'text-ink hover:bg-sand',
        sage: 'bg-sage-dark text-white hover:bg-[#7a4f93]',
      },
      size: { default: 'h-11 px-6', sm: 'h-9 px-4 text-xs', lg: 'h-13 px-8 text-base', icon: 'size-10' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})
Button.displayName = 'Button'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn('flex h-12 w-full rounded-xl border border-line bg-paper px-4 text-sm placeholder:text-muted/70 transition focus:border-terra focus:outline-none focus:ring-4 focus:ring-terra/15', className)}
    {...props}
  />
))
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn('flex min-h-24 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm placeholder:text-muted/70 transition focus:border-terra focus:outline-none focus:ring-4 focus:ring-terra/15', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn('h-12 w-full cursor-pointer appearance-none rounded-xl border border-line bg-paper bg-[url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%237a6a62%27 stroke-width=%272%27><path d=%27M4 6l4 4 4-4%27/></svg>")] bg-[length:16px] bg-[position:right_14px_center] bg-no-repeat px-4 pr-10 text-sm transition focus:border-terra focus:outline-none focus:ring-4 focus:ring-terra/15', className)}
    {...props}
  />
))
Select.displayName = 'Select'

export const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted', className)} {...props} />
))
Label.displayName = 'Label'

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold', {
  variants: {
    variant: {
      default: 'bg-sand text-ink',
      terra: 'bg-blush text-terra-dark',
      sage: 'bg-sage/25 text-sage-dark',
      mustard: 'bg-mustard/25 text-[#a85f1c]',
      dark: 'bg-ink text-cream',
      outline: 'border border-line text-muted',
    },
  },
  defaultVariants: { variant: 'default' },
})
export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-3xl border border-line bg-paper shadow-soft', className)} {...props} />
}
