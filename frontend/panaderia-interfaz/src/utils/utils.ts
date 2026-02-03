// This file previously contained localStorage token utilities.
// These are no longer needed with the new authentication system
// that stores tokens in memory and uses HttpOnly cookies for refresh tokens.

// You can add other utility functions here as needed.

export type TFileBase64 = {
  content: string;
  filename: string;
}

export const ConverFileToBase64 = (file: File): Promise<TFileBase64> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const pureBase64 = dataUrl.split(',')[1];
  
        resolve({
            content: pureBase64,
            filename: file.name,
        });
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
    
        reader.readAsDataURL(file);
        });
    };
    
    
export const HadleFileConversion = async (file: File): Promise<TFileBase64 | null> => {
    try {
      const base64 = await ConverFileToBase64(file);
      return base64;
    } catch (error) {
      console.error('Error converting file to base64:', error);
      return null;
    }
  };
  
  export const HadleFilesConversion = async (files: File[]): Promise<TFileBase64[] | null> => {
    if (files.length === 0) {
      return null;
    }
    try {
      const base64 = await Promise.all(files.map(file => ConverFileToBase64(file)));
      return base64;
    } catch (error) {
      console.error('Error converting files to base64:', error);
      return null;
    }
  };

export const RoundToTwo = (num: number) => Math.round(num * 100) / 100


export const getStatusBadgeVariant = (estado: string) => {
    switch (estado.toUpperCase()) {
        case "DISPONIBLE":
            return "default";
        case "INACTIVO":
            return "secondary";
        case "AGOTADO":
            return "outline";
        case "EXPIRADO":
            return "destructive";
        default:
            return "secondary";
    }
};