import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FormItem } from "./FormItem";

interface FormDatePickerProps {
    label: string;
    error?: string;
    required?: boolean;
    selected?: Date;
    onSelect: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
}

export const FormDatePicker = ({
    label,
    error,
    required,
    selected,
    onSelect,
    placeholder = "Seleccionar fecha",
    className,
    buttonClassName,
}: FormDatePickerProps) => {
    return (
        <FormItem label={label} error={error} required={required} className={className}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        type="button"
                        className={cn(
                            "w-full justify-start text-left font-normal bg-card shadow-sm h-10 focus-visible:ring-3 focus-visible:ring-(--input-ring-color)",
                            !selected && "text-muted-foreground",
                            error && "border-destructive/50 focus:ring-destructive",
                            buttonClassName
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                        {selected ? (
                            format(selected, "PPP", { locale: es })
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selected}
                        onSelect={onSelect}
                        className="rounded-md border shadow-lg"
                    />
                </PopoverContent>
            </Popover>
        </FormItem>
    );
};
