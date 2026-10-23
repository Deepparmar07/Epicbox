import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { folderApi } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FolderPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface CreateFolderDialogProps {
  currentFolderId: string | null;
  onFolderCreated: () => void;
}

export default function CreateFolderDialog({
  currentFolderId,
  onFolderCreated,
}: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a folder name',
        variant: 'destructive',
      });
      return;
    }

    if (!profile) {
      toast({
        title: 'Profile unavailable',
        description: 'Your profile has not loaded. Refresh the page and try again. If the problem continues, check profile permissions in Supabase.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await folderApi.createFolder(folderName.trim(), currentFolderId, profile.id);
      toast({
        title: 'Success',
        description: 'Folder created successfully',
      });
      setOpen(false);
      setFolderName('');
      onFolderCreated();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create folder',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for your new folder
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                placeholder="My Folder"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
