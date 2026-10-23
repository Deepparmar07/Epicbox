import type { File, Folder } from '@/types';
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

interface FileListProps {
  files: File[];
  folders: Folder[];
  onFileClick: (file: File) => void;
  onFolderClick: (folderId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onShareFile: (fileId: string) => void;
  onShareFolder: (folderId: string) => void;
}

export default function FileList({
  files,
  folders,
  onFileClick,
  onFolderClick,
  onDeleteFile,
  onDeleteFolder,
  onShareFile,
  onShareFolder,
}: FileListProps) {
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
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-3">Modified</div>
        <div className="col-span-1"></div>
      </div>

      <div className="divide-y">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/50 transition-colors group"
          >
            <div
              className="col-span-6 flex items-center gap-3 cursor-pointer"
              onClick={() => onFolderClick(folder.id)}
            >
              <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <FolderIcon className="w-4 h-4 text-secondary" />
              </div>
              <span className="font-medium truncate">{folder.name}</span>
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">—</div>
            <div className="col-span-3 text-sm text-muted-foreground">
              {new Date(folder.updated_at).toLocaleDateString()}
            </div>
            <div className="col-span-1 flex justify-end">
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
          </div>
        ))}

        {files.map((file) => (
          <div
            key={file.id}
            className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/50 transition-colors group"
          >
            <div
              className="col-span-6 flex items-center gap-3 cursor-pointer"
              onClick={() => onFileClick(file)}
            >
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
              {new Date(file.updated_at).toLocaleDateString()}
            </div>
            <div className="col-span-1 flex justify-end">
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
          </div>
        ))}
      </div>
    </div>
  );
}
