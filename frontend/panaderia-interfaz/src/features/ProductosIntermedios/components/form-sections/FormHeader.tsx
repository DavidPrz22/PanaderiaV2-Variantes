import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormHeaderProps {
    onClose: () => void;
    title: string;
    description: string;
}

export const FormHeader = ({ onClose, title, description }: FormHeaderProps) => {
    return (
        <div className="p-6 pt-0 border-b bg-background  top-0 z-10">
            
            <div className="flex items-center gap-2  max-w-4xl mx-auto">
                <Button variant="ghost" size="icon" onClick={onClose} type="button">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    );
};
