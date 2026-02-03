import React, { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FormItem } from "./FormItem";
import { cn } from "@/lib/utils";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    required?: boolean;
    containerClassName?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ label, error, required, className, containerClassName, ...props }, ref) => {
        return (
            <FormItem label={label} error={error} required={required} className={containerClassName || className}>
                <Textarea
                    ref={ref}
                    className={cn(
                        "bg-card shadow-sm resize-none focus-visible:ring-3 focus-visible:ring-(--input-ring-color) focus-visible:border-(--input-border-color)",
                        error && "border-destructive/50 focus:ring-destructive"
                    )}
                    {...props}
                />
            </FormItem>
        );
    }
);

FormTextarea.displayName = "FormTextarea";
