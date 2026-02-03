import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { FormItem } from "./FormItem";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    required?: boolean;
    containerClassName?: string;
    children?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, required, className, containerClassName, children, ...props }, ref) => {
        return (
            <FormItem label={label} error={error} required={required} className={containerClassName || className}>
                {children}
                <Input
                    ref={ref}
                    className={cn(
                        "bg-card shadow-sm focus-visible:ring-3 focus-visible:ring-(--input-ring-color) focus-visible:border-(--input-border-color)",
                        error && "border-destructive/50 focus-visible:ring-destructive"
                    )}
                    {...props}
                />
            </FormItem>
        );
    }
);

FormInput.displayName = "FormInput";
