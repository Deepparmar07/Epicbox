import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { storageApi, fileApi } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { compressImage, isImageFile, sanitizeFileName } from '@/lib/fileUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UploadButtonProps {
  currentFolderId: string | null;
  onUploadComplete: () => void;
}

export default function UploadButton({ currentFolderId, onUploadComplete }: UploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!profile) {
      toast({
        title: 'Profile unavailable',
        description: 'Your profile has not loaded. Refresh and try again before uploading.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    setUploading(true);
    let successCount = 0;
    const uploadErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      setCurrentFile(file.name);
      setProgress(((i + 1) / files.length) * 100);
      let storagePath: string | null = null;

      try {
        const maxSize = 52428800;
        if (file.size > maxSize) {
          if (isImageFile(file.type)) {
            toast({
              title: 'Compressing Image',
              description: `${file.name} is too large, compressing...`,
            });
            file = await compressImage(file, 1048576);
            toast({
              title: 'Compression Complete',
              description: `Compressed to ${(file.size / 1024 / 1024).toFixed(2)} MB`,
            });
          } else {
            throw new Error('File size exceeds 50MB limit');
          }
        }

        const sanitizedName = sanitizeFileName(file.name);
        storagePath = await storageApi.uploadFile(file, profile.id);

        await fileApi.createFile({
          name: sanitizedName,
          size: file.size,
          type: file.type,
          storage_path: storagePath,
          storage_provider: storageApi.getStorageProviderId(),
          folder_id: currentFolderId,
          owner_id: profile.id,
        });

        successCount++;
      } catch (error) {
        console.error('Upload error:', error);
        if (storagePath) {
          try {
            await storageApi.deleteFile(storagePath, storageApi.getStorageProviderId());
          } catch (cleanupError) {
            console.error('Failed to clean up uploaded file after metadata save failed:', cleanupError);
          }
        }

        const message = error instanceof Error ? error.message : 'Unknown upload error';
        uploadErrors.push(`${file.name}: ${message}`);
      }
    }

    setUploading(false);
    setProgress(0);
    setCurrentFile('');

    if (successCount > 0) {
      toast({
        title: 'Upload Complete',
        description: `Successfully uploaded ${successCount} file(s)`,
      });
      onUploadComplete();
    }

    if (uploadErrors.length > 0) {
      toast({
        title: 'Upload Errors',
        description: uploadErrors.join('\n'),
        variant: 'destructive',
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <Button onClick={handleFileSelect} disabled={uploading}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Files
      </Button>

      <Dialog open={uploading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Uploading Files</DialogTitle>
            <DialogDescription>
              Please wait while your files are being uploaded
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate">{currentFile}</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
