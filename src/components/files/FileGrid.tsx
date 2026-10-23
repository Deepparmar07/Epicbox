import type { File, Folder } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatFileSize, getFileIcon } from '@/lib/fileUtils';
import { Folder as FolderIcon, MoreVertical, Trash2, Share2, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { storageApi } from '@/db/api';
import { downloadBlob } from '@/lib/fileUtils';
import { useToast } from '@/hooks/use-toast';

interface FileGridProps {
  files: File[];
  folders: Folder[];
  onFileClick: (file: File) => void;
  onFolderClick: (folderId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onShareFile: (fileId: string) => void;
  onShareFolder: (folderId: string) => void;
}

export default function FileGrid({
  files,
  folders,
  onFileClick,
  onFolderClick,
  onDeleteFile,
  onDeleteFolder,
  onShareFile,
  onShareFolder,
}: FileGridProps) {
  const { toast } = useToast();

  const handleDownload = async (file: File) => {
    try {
      const blob = await storageApi.downloadFile(file.storage_path, file.type, file.storage_provider);
      downloadBlob(blob, file.name);
      toast({
        title: 'Success',
        description: 'File downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {folders.map((folder) => (
        <Card
          key={folder.id}
          className="p-4 hover:shadow-hover transition-shadow cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="flex-1"
              onClick={() => onFolderClick(folder.id)}
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-2">
                <FolderIcon className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onShareFolder(folder.id)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteFolder(folder.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div onClick={() => onFolderClick(folder.id)}>
            <p className="font-medium text-sm truncate">{folder.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(folder.created_at).toLocaleDateString()}
            </p>
          </div>
        </Card>
      ))}

      {files.map((file) => (
        <Card
          key={file.id}
          className="p-4 hover:shadow-hover transition-shadow cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="flex-1"
              onClick={() => onFileClick(file)}
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2 text-2xl">
                {getFileIcon(file.type)}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload(file)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShareFile(file.id)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteFile(file.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div onClick={() => onFileClick(file)}>
            <p className="font-medium text-sm truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
