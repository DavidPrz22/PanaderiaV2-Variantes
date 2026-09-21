import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UploadIcon, HelpCircleIcon, FileTextIcon, Loader2Icon } from "lucide-react"

import { HadleFileConversion, type TFileBase64 } from '@/utils/utils'
import { toast } from "sonner"
import type { UseMutateAsyncFunction } from "@tanstack/react-query"

type FileObject = Omit<TFileBase64, 'filename'> & {
  file: File
}

type ImportCSVProps = {
  descripcion: string, 
  uploadFunction: UseMutateAsyncFunction<{
    status: number;
    message: string;
}, Error, string, unknown>, 
  isPending: boolean,
  csvContent: string,
  fileType?: 'csv' | 'yaml',
}
export const ImportCSV = ({ descripcion, uploadFunction, isPending, csvContent, fileType = 'yaml' }: ImportCSVProps) => {

  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null)
  const [open, setOpen] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const b64File = await HadleFileConversion(file)
      setSelectedFile({
        file,
        content: b64File?.content!,
      })
    }
  }

  const handleDownloadTemplate = () => {
    const mimeType = fileType === 'yaml' ? 'text/yaml' : 'text/csv'
    const extension = fileType === 'yaml' ? 'yaml' : 'csv'
    const blob = new Blob([csvContent], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Template-Import.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    try {
      if (selectedFile) {
        const res = await uploadFunction(selectedFile.content)
        toast.success(res.message)
        setOpen(false)
        setSelectedFile(null)
      }
    } catch (e: any) {
      toast.error('Error al subir el archivo, verifique que el archivo tenga el formato correcto')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer gap-2 font-semibold bg-blue-800 hover:bg-blue-900" size={'lg'}>
          <UploadIcon className="size-4" />
          {fileType === 'yaml' ? 'Importar YAML' : 'Importar CSV'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md ">
        <DialogHeader>
          <DialogTitle>{fileType === 'yaml' ? 'Importar archivo YAML' : 'Importar archivo CSV'}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">

          {/* File Input Area */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input type="file" accept={fileType === 'yaml' ? '.yaml,.yml' : '.csv'} onChange={handleFileChange} className="hidden" id="csv-file-input" />
            <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center gap-2">
              <FileTextIcon className="size-10 text-muted-foreground" />
              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{selectedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Haz clic para seleccionar un archivo</p>
                  <p className="text-xs text-muted-foreground">O arrastra y suelta aquí</p>
                </div>
              )}
            </label>
          </div>

          {/* Help Button */}
          <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <HelpCircleIcon className="size-4" />
              <span>¿Necesitas ayuda con el formato?</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="text-primary cursor-pointer">
              Descargar plantilla
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false)
                setSelectedFile(null)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={!selectedFile} className="bg-blue-800 hover:bg-blue-900">
              Importar
              {isPending && <Loader2Icon className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}