import { Button } from "@/components/ui/button";

interface ActionBarProps {
  onCancel: () => void;
  isPending: boolean;
  formId: string;
}

export const ActionBar = ({ onCancel, isPending, formId }: ActionBarProps) => {
  return (
    <div className="py-4 px-5 bg-white border-t border-gray-200 ">
      <div className="w-4xl max-w-4xl mx-auto flex gap-2 justify-end">

        <Button variant="outline" onClick={onCancel} disabled={isPending} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" form={formId} disabled={isPending} className="flex-1">
          Guardar
        </Button>
      </div>
    </div>
  );
};
