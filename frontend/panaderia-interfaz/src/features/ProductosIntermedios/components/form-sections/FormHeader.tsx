import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormHeaderProps {
    onClose: () => void;
    title: string;
    description: string;
}

export const FormHeader = ({ onClose, title, description }: FormHeaderProps) => {
    return (
        <div className="flex items-center gap-4 p-6 border-b bg-background sticky top-0 z-10">
            <Button variant="ghost" size="icon" onClick={onClose} type="button">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
};
