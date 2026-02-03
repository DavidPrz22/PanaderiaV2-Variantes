import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormItem } from "./FormItem";
import { cn } from "@/lib/utils";

interface SelectOption {
    value: string | number;
    label: string;
}

interface FormSelectProps {
    label: string;
    error?: string;
    required?: boolean;
    value?: string | number;
    onValueChange: (value: string) => void;
    placeholder?: string;
    options: SelectOption[];
    className?: string;
    triggerClassName?: string;
    containerClassName?: string;
}

export const FormSelect = ({
    label,
    error,
    required,
    value,
    onValueChange,
    placeholder = "Seleccionar...",
    options,
    className,
    triggerClassName,
    containerClassName,
}: FormSelectProps) => {
    return (
        <FormItem label={label} error={error} required={required} className={className}>
            <Select
                value={value && value !== 0 ? value.toString() : undefined}
                onValueChange={onValueChange}
            >
                <SelectTrigger
                    className={cn(
                        "bg-card shadow-sm focus:ring-3 focus:ring-(--input-ring-color) focus:border-(--input-border-color)",
                        error && "border-destructive/50 focus:ring-destructive",
                        triggerClassName
                    )}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className={containerClassName}>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FormItem>
    );
};
