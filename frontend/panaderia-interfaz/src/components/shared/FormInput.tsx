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
        const isNumberType = props.type === "number";

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (isNumberType) {
                // Allow control keys and shortcuts
                const isControlKey = [
                    "Backspace", "Delete", "Tab", "Escape", "Enter", 
                    "ArrowLeft", "ArrowRight", "Home", "End", "ArrowUp", "ArrowDown"
                ].includes(e.key);
                const isShortcut = e.ctrlKey || e.metaKey;

                if (isControlKey || isShortcut) {
                    props.onKeyDown?.(e);
                    return;
                }

                // Allow numbers
                if (/[0-9]/.test(e.key)) {
                    props.onKeyDown?.(e);
                    return;
                }

                // Allow . or , but only one and not both
                if (e.key === "." || e.key === ",") {
                    const value = e.currentTarget.value;
                    const hasSeparator = value.includes(".") || value.includes(",");
                    if (hasSeparator) {
                        e.preventDefault();
                    } else {
                        props.onKeyDown?.(e);
                    }
                    return;
                }

                // Prevent everything else
                e.preventDefault();
                return;
            }
            props.onKeyDown?.(e);
        };

        const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
            if (isNumberType) {
                const pastedText = e.clipboardData.getData("text");
                const currentValue = e.currentTarget.value;
                
                // Check if pasted text contains only numbers and separators
                if (!/^[0-9.,]*$/.test(pastedText)) {
                    e.preventDefault();
                    return;
                }

                // Check if adding this would result in multiple separators or both types
                const hasExistingSeparator = currentValue.includes(".") || currentValue.includes(",");
                const pasteHasSeparator = pastedText.includes(".") || pastedText.includes(",");
                
                if (hasExistingSeparator && pasteHasSeparator) {
                    e.preventDefault();
                    return;
                }

                const dotInPaste = pastedText.includes(".");
                const commaInPaste = pastedText.includes(",");
                if (dotInPaste && commaInPaste) {
                    e.preventDefault();
                    return;
                }
            }
            props.onPaste?.(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (isNumberType) {
                // Normalize comma to dot for consistency and compatibility with numeric parsing
                const originalValue = e.target.value;
                const normalizedValue = originalValue.replace(",", ".");
                if (originalValue !== normalizedValue) {
                    e.target.value = normalizedValue;
                }
            }
            props.onChange?.(e);
        };

        const inputProps = { ...props };
        if (isNumberType) {
            // Use type="text" with inputMode="decimal" to allow the comma reliably across locales
            inputProps.type = "text";
            inputProps.inputMode = "decimal";
        }

        return (
            <FormItem label={label} error={error} required={required} className={containerClassName || className}>
                {children}
                <Input
                    ref={ref}
                    {...inputProps}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onChange={handleChange}
                    className={cn(
                        "bg-card shadow-sm focus-visible:ring-3 focus-visible:ring-(--input-ring-color) focus-visible:border-(--input-border-color)",
                        error && "border-destructive/50 focus-visible:ring-destructive"
                    )}
                />
            </FormItem>
        );
    }
);

FormInput.displayName = "FormInput";
