import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormItemProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
    id?: string;
}

export const FormItem = ({
    label,
    error,
    required,
    children,
    className,
    id,
}: FormItemProps) => {
    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={id} className={cn(error && "text-destructive")}>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {error && (
                <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                    {error}
                </p>
            )}
        </div>
    );
};
