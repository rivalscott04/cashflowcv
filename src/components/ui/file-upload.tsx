import React, { useState, useRef } from "react";
import { Upload, Eye, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSize?: number; // in bytes
  value?: File | null;
  onChange?: (file: File | null) => void;
  className?: string;
  placeholder?: string;
}

const FileUpload = ({
  label,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 300 * 1024, // 300KB default
  value,
  onChange,
  className,
  placeholder = "Pilih file..."
}: FileUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    if (file.size > maxSize) {
      toast({
        title: "File terlalu besar",
        description: `Ukuran file maksimal ${formatFileSize(maxSize)}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onChange?.(file);
      
      // Create preview URL for supported file types
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    onChange?.(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openPreview = () => {
    if (previewUrl) {
      setIsPreviewOpen(true);
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const isImage = value?.type.startsWith('image/');
  const isPdf = value?.type === 'application/pdf';
  const canPreview = isImage || isPdf;

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-colors duration-200",
          isDragOver ? "border-primary bg-primary/5" : "border-border",
          "hover:border-primary/50 hover:bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {value ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">{value.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(value.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {canPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openPreview}
                  className="hover:border-primary/50 transition-colors duration-200"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
                className="hover:border-destructive hover:text-destructive transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">{placeholder}</p>
            <p className="text-xs text-muted-foreground">
              Maksimal {formatFileSize(maxSize)} • {accept.replace(/\./g, '').toUpperCase()}
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Preview: {value?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {previewUrl && (
              <div className="w-full h-full flex items-center justify-center">
                {isImage ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                ) : isPdf ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[70vh] rounded-lg border"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-4 text-muted-foreground">
                    <AlertCircle className="h-12 w-12" />
                    <p>Preview tidak tersedia untuk jenis file ini</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={closePreview} variant="outline">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUpload;