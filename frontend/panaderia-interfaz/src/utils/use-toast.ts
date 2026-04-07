import { useCallback, useMemo } from "react"
import { toast as sonnerToast } from "sonner"

type ToastProps = {
    title?: string
    description?: React.ReactNode
    action?: {
        label: string
        onClick: () => void
    }
    cancel?: {
        label: string
        onClick: () => void
    }
    variant?: "default" | "destructive" | "success" | "warning" | "info"
    duration?: number
}

export function useToast() {
    const toast = useCallback(({ title, description, variant, action, ...props }: ToastProps) => {
        const toastOptions = {
            description,
            action: action ? {
                label: action.label,
                onClick: action.onClick,
            } : undefined,
            ...props,
        }

        switch (variant) {
            case "destructive":
                return sonnerToast.error(title, toastOptions)
            case "success":
                return sonnerToast.success(title, toastOptions)
            case "warning":
                return sonnerToast.warning(title, toastOptions)
            case "info":
                return sonnerToast.info(title, toastOptions)
            default:
                return sonnerToast(title, toastOptions)
        }
    }, [])

    return useMemo(() => ({ toast }), [toast])
}