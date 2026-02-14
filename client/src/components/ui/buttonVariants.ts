import { cva } from "class-variance-authority";

export const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    {
        variants: {
            variant: {
                primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 shadow-md",
                action: "bg-[var(--color-action)] text-[var(--color-action-foreground)] hover:opacity-90 shadow-md",
                error: "bg-[var(--color-error)] text-[var(--color-error-foreground)] hover:opacity-90 shadow-md",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                ghost: "hover:bg-accent hover:text-accent-foreground",
            },
            size: {
                sm: "h-9 px-3 text-sm",
                md: "h-10 px-4 py-2",
                lg: "h-11 px-8 text-md font-semibold",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);
