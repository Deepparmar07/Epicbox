import { useState, useEffect } from 'react';
import { fileApi } from '@/db/api';
import type { File } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FilePreviewDialog from '@/components/files/FilePreviewDialog';
import ShareDialog from '@/components/files/ShareDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Grid3x3, List, Clock, Download, Trash2, Share2, FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize } from '@/lib/fileUtils';
import { storageApi } from '@/db/api';

export default function RecentFilesPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shareFileId, setShareFileId] = useState<string | null>(null);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    try {
      setLoading(true);
      const data = await fileApi.getRecentFiles(50);
      setFiles(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load recent files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (file: File) => {
    await fileApi.updateFileAccess(file.id);
    setSelectedFile(file);
  };

  const handleDownload = async (file: File) => {
    try {
      const blob = await storageApi.downloadFile(file.storage_path, file.type, file.storage_provider);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await fileApi.softDeleteFile(fileId);
      toast({
        title: 'Success',
        description: 'File moved to recycle bin',
      });
      await loadRecentFiles();
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Recent Files</h1>
              <p className="text-muted-foreground mt-1">
                Files you've accessed recently
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading recent files...</p>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Recent Files</h3>
            <p className="text-muted-foreground max-w-md">
              Files you access will appear here for quick access
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-2'}>
            {files.map((file) => (
              <Card
                key={file.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleFileClick(file)}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileIcon className="w-12 h-12 text-primary" />
                  <p className="text-sm font-medium text-center truncate w-full">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  <div className="flex gap-1 mt-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareFileId(file.id);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedFile && (
        <FilePreviewDialog
          file={selectedFile}
          open={!!selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}

      {shareFileId && (
        <ShareDialog
          type="file"
          itemId={shareFileId}
          open={!!shareFileId}
          onClose={() => setShareFileId(null)}
        />
      )}
    </DashboardLayout>
  );
}
