import { useState, useEffect } from 'react';
import { fileApi, storageApi } from '@/db/api';
import type { File } from '@/types';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { formatFileSize, getFileIcon } from '@/lib/fileUtils';
import { RotateCcw, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function RecycleBinPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteFile, setDeleteFile] = useState<File | null>(null);
  const { toast } = useToast();

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fileApi.getDeletedFiles();
      setFiles(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load deleted files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleRestore = async (file: File) => {
    try {
      await fileApi.restoreFile(file.id);
      toast({
        title: 'Success',
        description: 'File restored successfully',
      });
      loadFiles();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restore file',
        variant: 'destructive',
      });
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteFile) return;

    try {
      await storageApi.deleteFile(deleteFile.storage_path, deleteFile.storage_provider);
      await fileApi.permanentDeleteFile(deleteFile.id);
      toast({
        title: 'Success',
        description: 'File permanently deleted',
      });
      setDeleteFile(null);
      loadFiles();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recycle Bin</h1>
            <p className="text-muted-foreground mt-1">
              Restore or permanently delete files
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">Recycle bin is empty</p>
            <p className="text-sm text-muted-foreground">
              Deleted files will appear here
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-3">Deleted</div>
              <div className="col-span-2"></div>
            </div>

            <div className="divide-y">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0 text-lg">
                      {getFileIcon(file.type)}
                    </div>
                    <span className="font-medium truncate" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground">
                    {file.deleted_at ? new Date(file.deleted_at).toLocaleString() : '—'}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(file)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteFile(file)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete File?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The file will be permanently deleted from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentDelete}>
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
