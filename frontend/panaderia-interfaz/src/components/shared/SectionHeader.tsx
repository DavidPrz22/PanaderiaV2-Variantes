import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    description?: string;
    className?: string;
    separator?: boolean;
}

export const SectionHeader = ({
    title,
    description,
    className,
    separator = false,
}: SectionHeaderProps) => {
    return (
        <div className={cn("space-y-1", className)}>
            {separator && <div className="h-px bg-border mb-6" />}
            <h3 className="text-lg font-medium tracking-tight text-foreground">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
};
