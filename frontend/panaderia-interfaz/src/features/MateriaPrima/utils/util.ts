import type { UseFormSetError } from "react-hook-form";
import type { TMateriaPrimaSchema } from "../../MateriaPrima/schemas/schemas";
import { translateApiError } from "@/data/translations";

export const setErrorForm = (setError: UseFormSetError<TMateriaPrimaSchema>, error: {
  failed: boolean;
  errorData: Record<string, string[]>;
}) => {
  if (error.failed) {
    for (const fieldName in error.errorData) {
      if (
        Object.prototype.hasOwnProperty.call(error.errorData, fieldName)
      ) {
        const errorMessages = error.errorData[fieldName];
        if (Array.isArray(errorMessages) && errorMessages.length > 0) {
          const message = translateApiError(errorMessages[0]);
          setError(fieldName as keyof TMateriaPrimaSchema, { message });
        } else if (typeof errorMessages === "string") {
          const message = translateApiError(errorMessages);
          setError(fieldName as keyof TMateriaPrimaSchema, { message });
        }
      }
    }
  }
}