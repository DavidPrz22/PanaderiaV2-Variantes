import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DownloadSampleDataButtonProps {
  filePath: string;
  fileName?: string;
  label?: string;
  className?: string;
}

export const DownloadSampleDataButton: React.FC<DownloadSampleDataButtonProps> = ( {
  filePath,
  fileName,
  label = 'Ejemplo CSV',
  className,
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = filePath;
    link.setAttribute(
      'download',
      fileName || filePath.split('/').pop() || 'ejemplo.csv'
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleDownload}
      className={`border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/30 cursor-pointer font-semibold ${className || ''}`}
    >
      <Download className="size-4" />
      {label}
    </Button>
  );
};

export default DownloadSampleDataButton;
